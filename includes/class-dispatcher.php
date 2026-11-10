<?php
/**
 * Turns a form submission into action payloads, sends them and logs the result.
 *
 * @package QuickSheetWP
 */

namespace QuickSheetWP;

use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Submission dispatcher.
 */
class Dispatcher {

	/**
	 * Plugin.
	 *
	 * @var Plugin
	 */
	private $plugin;

	/**
	 * Constructor.
	 *
	 * @param Plugin $plugin Plugin.
	 */
	public function __construct( Plugin $plugin ) {
		$this->plugin = $plugin;
	}

	/**
	 * Entry point used by every trigger integration.
	 *
	 * @param string $source  Trigger slug.
	 * @param string $form_id Form identifier.
	 * @param array  $fields  field_key => value (scalar or array).
	 * @param array  $meta    Extra context: form_title, entry_id, page_url.
	 */
	public function handle( $source, $form_id, array $fields, array $meta = array() ) {
		$feeds = Feeds::for_form( $source, $form_id );
		if ( ! $feeds ) {
			return;
		}

		$fields = apply_filters( 'qswp_submission_fields', $fields, $source, $form_id, $meta );
		$tags   = $this->build_tags( $fields, $meta );

		foreach ( $feeds as $feed ) {
			$this->run( $feed, $tags, $fields, $meta );
		}
	}

	/**
	 * Run one feed for a submission.
	 *
	 * @param array $feed   Feed.
	 * @param array $tags   Merge tags.
	 * @param array $fields Raw fields.
	 * @param array $meta   Meta.
	 * @return array|WP_Error|null Null when skipped.
	 */
	public function run( array $feed, array $tags, array $fields = array(), array $meta = array() ) {
		$action = $this->plugin->action( $feed['action'] );
		if ( ! $action ) {
			return null;
		}
		$condition = isset( $feed['settings']['condition'] ) ? $feed['settings']['condition'] : array();
		if ( ! Conditions::passes( $condition, $tags, $this ) ) {
			return null;
		}

		$payload = $action->build_payload( $feed, $tags );
		$payload = apply_filters( 'qswp_payload', $payload, $feed, $fields, $meta );
		if ( empty( $payload ) ) {
			return null;
		}
		return $this->send( $feed, $payload );
	}

	/**
	 * Builds the merge-tag dictionary for a submission.
	 *
	 * @param array $fields Fields.
	 * @param array $meta   Meta.
	 * @return array
	 */
	public function build_tags( array $fields, array $meta ) {
		$tags = array();
		foreach ( $fields as $key => $value ) {
			$tags[ 'field:' . $key ] = $this->stringify( $value );
		}

		$ts  = current_time( 'timestamp' ); // phpcs:ignore WordPress.DateTime.CurrentTimeTimestamp.Requested -- formatted with date_i18n below.
		$opt = Options::all();

		$ip  = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
		$ua  = isset( $_SERVER['HTTP_USER_AGENT'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) ) : '';
		$ref = isset( $_SERVER['HTTP_REFERER'] ) ? esc_url_raw( wp_unslash( $_SERVER['HTTP_REFERER'] ) ) : '';

		$tags['date']       = date_i18n( $opt['date_format'], $ts );
		$tags['time']       = date_i18n( $opt['time_format'], $ts );
		$tags['datetime']   = date_i18n( $opt['date_format'] . ' ' . $opt['time_format'], $ts );
		$tags['form_title'] = isset( $meta['form_title'] ) ? (string) $meta['form_title'] : '';
		$tags['form_id']    = isset( $meta['form_id'] ) ? (string) $meta['form_id'] : '';
		$tags['entry_id']   = isset( $meta['entry_id'] ) ? (string) $meta['entry_id'] : '';
		$tags['page_url']   = ! empty( $meta['page_url'] ) ? esc_url_raw( $meta['page_url'] ) : $ref;
		$tags['ip']         = $ip;
		$tags['user_agent'] = $ua;
		$tags['site_name']  = get_bloginfo( 'name' );
		$tags['site_url']   = home_url( '/' );
		$user               = wp_get_current_user();
		$tags['user_id']    = $user->ID ? (string) $user->ID : '';
		$tags['user_email'] = $user->ID ? $user->user_email : '';

		// {all_fields}: "Label: value" lines for message-style apps.
		$lines = array();
		foreach ( $fields as $key => $value ) {
			$v = $this->stringify( $value );
			if ( '' !== $v && ! preg_match( '/^_/', (string) $key ) ) {
				$lines[] = $key . ': ' . $v;
			}
		}
		$tags['all_fields'] = implode( "\n", $lines );

		return apply_filters( 'qswp_merge_tags', $tags, $fields, $meta );
	}

	/**
	 * Flatten a submitted value to a string.
	 *
	 * @param mixed $value Value.
	 * @return string
	 */
	private function stringify( $value ) {
		if ( is_array( $value ) ) {
			$value = implode( ', ', array_filter( array_map( array( $this, 'stringify' ), $value ), 'strlen' ) );
		}
		if ( is_bool( $value ) ) {
			return $value ? __( 'Yes', 'quicksheet' ) : __( 'No', 'quicksheet' );
		}
		return is_scalar( $value ) ? trim( wp_strip_all_tags( (string) $value ) ) : '';
	}

	/**
	 * Replace {tags} in a template.
	 *
	 * @param string $template Template.
	 * @param array  $tags     Tags.
	 * @return string
	 */
	public function render_template( $template, array $tags ) {
		return (string) preg_replace_callback(
			'/\{([a-z_]+(?::[^{}]+)?)\}/i',
			static function ( $m ) use ( $tags ) {
				return array_key_exists( $m[1], $tags ) ? $tags[ $m[1] ] : '';
			},
			(string) $template
		);
	}

	/**
	 * Send a payload and log the outcome.
	 *
	 * @param array $feed    Feed.
	 * @param array $payload Payload.
	 * @param int   $log_id  Existing log (retry).
	 * @return array|WP_Error
	 */
	public function send( array $feed, array $payload, $log_id = 0 ) {
		$action = $this->plugin->action( $feed['action'] );
		$result = $action
			? $action->send( $feed, $payload )
			: new WP_Error( 'qswp_no_action', __( 'The app for this integration is not available.', 'quicksheet' ) );

		if ( is_wp_error( $result ) ) {
			$message = $result->get_error_message();
			if ( $log_id ) {
				$log    = Logger::get( $log_id );
				$status = self::is_retryable( $result ) && $this->should_retry( $log ? $log['attempts'] + 1 : 99 ) ? Logger::PENDING : Logger::FAILED;
				Logger::update( $log_id, $status, $message );
			} else {
				$status = self::is_retryable( $result ) && $this->should_retry( 1 ) ? Logger::PENDING : Logger::FAILED;
				$log_id = Logger::add( $feed, $status, $message, $payload );
			}
			if ( Logger::PENDING === $status ) {
				$log = Logger::get( $log_id );
				// Back-off: 5, 10, 15 … minutes.
				wp_schedule_single_event( time() + 5 * MINUTE_IN_SECONDS * max( 1, $log['attempts'] ), 'qswp_retry_log', array( $log_id ) );
			}
			do_action( 'qswp_send_failed', $feed, $payload, $result, $log_id );
			return $result;
		}

		$message = isset( $result['message'] ) ? $result['message'] : __( 'Sent.', 'quicksheet' );
		if ( $log_id ) {
			Logger::update( $log_id, Logger::SUCCESS, $message );
		} else {
			$log_id = Logger::add( $feed, Logger::SUCCESS, $message, $payload );
		}
		do_action( 'qswp_send_success', $feed, $payload, $result, $log_id );
		return $result;
	}

	/**
	 * Temporary problems (network, 5xx, rate limits) are retried automatically;
	 * permanent ones (bad phone number, rejected request) go straight to "failed".
	 *
	 * @param WP_Error $error Error.
	 * @return bool
	 */
	public static function is_retryable( WP_Error $error ) {
		if ( in_array( $error->get_error_code(), array( 'qswp_invalid', 'qswp_invalid_phone', 'qswp_no_account', 'qswp_no_action' ), true ) ) {
			return false;
		}
		$data = $error->get_error_data();
		$code = 0;
		if ( is_array( $data ) ) {
			$code = isset( $data['api_status'] ) ? (int) $data['api_status'] : ( isset( $data['google_status'] ) ? (int) $data['google_status'] : 0 );
		}
		if ( $code >= 400 && $code < 500 && ! in_array( $code, array( 401, 408, 429 ), true ) ) {
			return false;
		}
		return (bool) apply_filters( 'qswp_is_retryable', true, $error );
	}

	/**
	 * Whether another automatic attempt is allowed.
	 *
	 * @param int $attempts Attempts so far.
	 * @return bool
	 */
	private function should_retry( $attempts ) {
		return Options::get( 'auto_retry' ) && $attempts <= (int) Options::get( 'max_retries' );
	}

	/**
	 * Re-send a logged payload (cron or manual).
	 *
	 * @param int $log_id Log ID.
	 * @return array|WP_Error
	 */
	public function retry( $log_id ) {
		$log = Logger::get( $log_id );
		if ( ! $log ) {
			return new WP_Error( 'qswp_no_log', __( 'Log entry not found.', 'quicksheet' ) );
		}
		if ( Logger::SUCCESS === $log['status'] ) {
			return new WP_Error( 'qswp_already_sent', __( 'This entry was already sent.', 'quicksheet' ) );
		}
		$feed = Feeds::get( $log['feed_id'] );
		if ( ! $feed ) {
			Logger::update( $log_id, Logger::FAILED, __( 'The integration for this entry was deleted.', 'quicksheet' ), false );
			return new WP_Error( 'qswp_no_feed', __( 'The integration for this entry was deleted.', 'quicksheet' ) );
		}
		wp_clear_scheduled_hook( 'qswp_retry_log', array( (int) $log_id ) );
		return $this->send( $feed, $log['row_data'], $log_id );
	}
}
