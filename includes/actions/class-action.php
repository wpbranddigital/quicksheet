<?php
/**
 * Base class for destination apps (actions).
 *
 * @package QuickSheetWP
 */

namespace QuickSheetWP\Actions;

use QuickSheetWP\Accounts;
use QuickSheetWP\Plugin;
use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Action contract.
 */
abstract class Action {

	/**
	 * Plugin.
	 *
	 * @var Plugin
	 */
	protected $plugin;

	/**
	 * Constructor.
	 *
	 * @param Plugin $plugin Plugin.
	 */
	public function __construct( Plugin $plugin ) {
		$this->plugin = $plugin;
	}

	/**
	 * Unique slug stored with feeds.
	 *
	 * @return string
	 */
	abstract public function slug();

	/**
	 * Display name.
	 *
	 * @return string
	 */
	abstract public function label();

	/**
	 * One-line description.
	 *
	 * @return string
	 */
	abstract public function description();

	/**
	 * Category shown in the app picker.
	 *
	 * @return string
	 */
	public function category() {
		return 'social';
	}

	/**
	 * Fields required to add an account. Empty when the app is not account based.
	 *
	 * @return array[] [ key, label, type, help, placeholder ]
	 */
	public function account_fields() {
		return array();
	}

	/**
	 * Link to the provider's credentials documentation.
	 *
	 * @return string
	 */
	public function docs_url() {
		return '';
	}

	/**
	 * Validate credentials with the provider.
	 *
	 * @param array $credentials Sanitized credentials.
	 * @return string|WP_Error Account display name.
	 */
	public function verify_account( array $credentials ) {
		return new WP_Error( 'qswp_not_supported', __( 'This app does not use accounts.', 'quicksheet' ) );
	}

	/**
	 * Sanitize credential input.
	 *
	 * @param array $raw Raw input.
	 * @return array
	 */
	public function sanitize_credentials( array $raw ) {
		$out = array();
		foreach ( $this->account_fields() as $field ) {
			$out[ $field['key'] ] = isset( $raw[ $field['key'] ] ) && is_scalar( $raw[ $field['key'] ] ) ? trim( sanitize_text_field( (string) $raw[ $field['key'] ] ) ) : '';
		}
		return $out;
	}

	/**
	 * Is the app ready to be used?
	 *
	 * @return bool
	 */
	public function is_connected() {
		return (bool) Accounts::all( $this->slug() );
	}

	/**
	 * Sanitize action settings.
	 *
	 * @param array $raw Raw settings.
	 * @return array
	 */
	abstract public function sanitize_settings( array $raw );

	/**
	 * Validate a feed before saving.
	 *
	 * @param array $feed Feed data incl. settings.
	 * @return true|WP_Error
	 */
	abstract public function validate( array $feed );

	/**
	 * Build the payload that will be sent (and stored for retries).
	 *
	 * @param array $feed Feed.
	 * @param array $tags Merge tags.
	 * @return array Empty array to skip.
	 */
	abstract public function build_payload( array $feed, array $tags );

	/**
	 * Deliver a payload.
	 *
	 * @param array $feed    Feed.
	 * @param array $payload Payload.
	 * @return array|WP_Error { message }
	 */
	abstract public function send( array $feed, array $payload );

	/**
	 * Load the feed's account credentials.
	 *
	 * @param array $feed Feed.
	 * @return array|WP_Error
	 */
	protected function credentials( array $feed ) {
		$account = $feed['account_id'] ? Accounts::get( $feed['account_id'] ) : null;
		if ( ! $account || $account['service'] !== $this->slug() ) {
			/* translators: %s: app name */
			return new WP_Error( 'qswp_no_account', sprintf( __( 'The %s account for this integration was removed. Edit the integration and choose an account.', 'quicksheet' ), $this->label() ) );
		}
		return $account['credentials'];
	}

	/**
	 * Validate the account belongs to this app.
	 *
	 * @param array $feed Feed.
	 * @return true|WP_Error
	 */
	protected function validate_account( array $feed ) {
		$account = empty( $feed['account_id'] ) ? null : Accounts::get( $feed['account_id'] );
		if ( ! $account || $account['service'] !== $this->slug() ) {
			/* translators: %s: app name */
			return new WP_Error( 'qswp_invalid', sprintf( __( 'Please choose a %s account.', 'quicksheet' ), $this->label() ) );
		}
		return true;
	}

	/**
	 * Render a template with merge tags.
	 *
	 * @param string $template Template.
	 * @param array  $tags     Tags.
	 * @return string
	 */
	protected function render( $template, array $tags ) {
		return trim( $this->plugin->dispatcher->render_template( $template, $tags ) );
	}

	/**
	 * Truncate to a maximum length (multibyte safe).
	 *
	 * @param string $text Text.
	 * @param int    $max  Max characters.
	 * @return string
	 */
	protected function limit( $text, $max ) {
		if ( function_exists( 'mb_strlen' ) && mb_strlen( $text ) > $max ) {
			return mb_substr( $text, 0, $max - 1 ) . '…';
		}
		return strlen( $text ) > $max ? substr( $text, 0, $max - 3 ) . '...' : $text;
	}

	/**
	 * Decode a JSON HTTP response, turning failures into WP_Error.
	 *
	 * @param array|WP_Error $response Response.
	 * @return array|WP_Error
	 */
	protected function parse_response( $response ) {
		if ( is_wp_error( $response ) ) {
			return $response;
		}
		$code = (int) wp_remote_retrieve_response_code( $response );
		$body = wp_remote_retrieve_body( $response );
		$data = json_decode( $body, true );
		if ( $code < 200 || $code >= 300 ) {
			$message = '';
			if ( isset( $data['error']['message'] ) ) {
				$message = $data['error']['message'];
			} elseif ( isset( $data['message'] ) ) {
				$message = $data['message'];
			}
			/* translators: %d: HTTP status code */
			return new WP_Error( 'qswp_api', $message ? wp_strip_all_tags( $message ) : sprintf( __( 'Request failed (HTTP %d).', 'quicksheet' ), $code ), array( 'api_status' => $code ) );
		}
		return is_array( $data ) ? $data : array();
	}

	/**
	 * Data for the admin app.
	 *
	 * @return array
	 */
	public function to_array() {
		return array(
			'slug'           => $this->slug(),
			'label'          => $this->label(),
			'description'    => $this->description(),
			'category'       => $this->category(),
			'account_fields' => $this->account_fields(),
			'uses_accounts'  => (bool) $this->account_fields(),
			'docs_url'       => $this->docs_url(),
			'connected'      => $this->is_connected(),
		);
	}
}
