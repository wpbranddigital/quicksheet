<?php
/**
 * Discord action: post a message to a channel through an incoming webhook.
 *
 * @package QuickSheetWP
 */

namespace QuickSheetWP\Actions;

use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Discord webhook.
 */
class Discord extends Action {

	const URL_PATTERN = '#^https://(?:(?:ptb|canary)\.)?discord(?:app)?\.com/api/webhooks/\d{5,30}/[A-Za-z0-9_\-]{20,100}$#';

	/** {@inheritDoc} */
	public function slug() {
		return 'discord';
	}

	/** {@inheritDoc} */
	public function label() {
		return 'Discord';
	}

	/** {@inheritDoc} */
	public function description() {
		return __( 'Post submissions to a Discord channel.', 'quicksheet' );
	}

	/** {@inheritDoc} */
	public function category() {
		return 'chat';
	}

	/** {@inheritDoc} */
	public function docs_url() {
		return 'https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks';
	}

	/** {@inheritDoc} */
	public function account_fields() {
		return array(
			array(
				'key'         => 'webhook_url',
				'label'       => __( 'Webhook URL', 'quicksheet' ),
				'type'        => 'password',
				'placeholder' => 'https://discord.com/api/webhooks/…',
				'help'        => __( 'Discord → Server Settings → Integrations → Webhooks → New Webhook → Copy Webhook URL.', 'quicksheet' ),
			),
		);
	}

	/** {@inheritDoc} */
	public function sanitize_credentials( array $raw ) {
		$url = isset( $raw['webhook_url'] ) && is_string( $raw['webhook_url'] ) ? trim( $raw['webhook_url'] ) : '';
		return array( 'webhook_url' => preg_replace( '#/+$#', '', esc_url_raw( $url, array( 'https' ) ) ) );
	}

	/**
	 * Strict URL check – only Discord webhook URLs are ever requested (prevents SSRF).
	 *
	 * @param string $url URL.
	 * @return bool
	 */
	public static function is_valid_url( $url ) {
		return (bool) preg_match( self::URL_PATTERN, (string) $url );
	}

	/** {@inheritDoc} */
	public function verify_account( array $credentials ) {
		if ( ! self::is_valid_url( $credentials['webhook_url'] ) ) {
			return new WP_Error( 'qswp_invalid', __( 'Enter a valid Discord webhook URL.', 'quicksheet' ) );
		}
		$data = $this->parse_response( wp_safe_remote_get( $credentials['webhook_url'], array( 'timeout' => 15 ) ) );
		if ( is_wp_error( $data ) ) {
			return $data;
		}
		return isset( $data['name'] ) ? sanitize_text_field( $data['name'] ) : __( 'Discord webhook', 'quicksheet' );
	}

	/** {@inheritDoc} */
	public function sanitize_settings( array $raw ) {
		$color = isset( $raw['embed_color'] ) ? sanitize_hex_color( (string) $raw['embed_color'] ) : '';
		return array(
			'message'     => isset( $raw['message'] ) ? sanitize_textarea_field( (string) $raw['message'] ) : '',
			'username'    => isset( $raw['username'] ) ? sanitize_text_field( (string) $raw['username'] ) : '',
			'use_embed'   => ! empty( $raw['use_embed'] ) && rest_sanitize_boolean( $raw['use_embed'] ),
			'embed_title' => isset( $raw['embed_title'] ) ? sanitize_text_field( (string) $raw['embed_title'] ) : '',
			'embed_color' => $color ? $color : '#12855a',
		);
	}

	/** {@inheritDoc} */
	public function validate( array $feed ) {
		$account = $this->validate_account( $feed );
		if ( is_wp_error( $account ) ) {
			return $account;
		}
		if ( '' === trim( $feed['settings']['message'] ) ) {
			return new WP_Error( 'qswp_invalid', __( 'Write the message to send.', 'quicksheet' ) );
		}
		return true;
	}

	/** {@inheritDoc} */
	public function build_payload( array $feed, array $tags ) {
		$s    = $feed['settings'];
		$text = $this->render( $s['message'], $tags );
		if ( '' === $text ) {
			return array();
		}
		$payload = array(
			'allowed_mentions' => array( 'parse' => array() ), // Never ping @everyone from user input.
		);
		if ( '' !== $s['username'] ) {
			$payload['username'] = $this->limit( $this->render( $s['username'], $tags ), 80 );
		}
		if ( ! empty( $s['use_embed'] ) ) {
			$payload['embeds'] = array(
				array(
					'title'       => $this->limit( $this->render( $s['embed_title'], $tags ), 256 ),
					'description' => $this->limit( $text, 4096 ),
					'color'       => hexdec( ltrim( $s['embed_color'], '#' ) ),
					'timestamp'   => gmdate( 'c' ),
				),
			);
		} else {
			$payload['content'] = $this->limit( $text, 2000 );
		}
		return $payload;
	}

	/** {@inheritDoc} */
	public function send( array $feed, array $payload ) {
		$creds = $this->credentials( $feed );
		if ( is_wp_error( $creds ) ) {
			return $creds;
		}
		if ( ! self::is_valid_url( $creds['webhook_url'] ) ) {
			return new WP_Error( 'qswp_invalid', __( 'The saved Discord webhook URL is invalid.', 'quicksheet' ) );
		}
		$response = wp_safe_remote_post(
			add_query_arg( 'wait', 'true', $creds['webhook_url'] ),
			array(
				'timeout' => 15,
				'headers' => array( 'Content-Type' => 'application/json' ),
				'body'    => wp_json_encode( $payload ),
			)
		);
		$data     = $this->parse_response( $response );
		if ( is_wp_error( $data ) ) {
			return $data;
		}
		return array(
			/* translators: %s: Discord message ID */
			'message' => sprintf( __( 'Message posted to Discord (ID %s).', 'quicksheet' ), isset( $data['id'] ) ? $data['id'] : '–' ),
		);
	}
}
