<?php
/**
 * WhatsApp action: send a message through the WhatsApp Cloud API (Meta).
 *
 * @package QuickSheetWP
 */

namespace QuickSheetWP\Actions;

use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * WhatsApp Cloud API.
 */
class Whatsapp extends Action {

	/** {@inheritDoc} */
	public function slug() {
		return 'whatsapp';
	}

	/** {@inheritDoc} */
	public function label() {
		return 'WhatsApp';
	}

	/** {@inheritDoc} */
	public function description() {
		return __( 'Send a WhatsApp message to you or to the person who submitted the form.', 'quicksheet' );
	}

	/** {@inheritDoc} */
	public function category() {
		return 'chat';
	}

	/** {@inheritDoc} */
	public function docs_url() {
		return 'https://developers.facebook.com/docs/whatsapp/cloud-api/get-started';
	}

	/** {@inheritDoc} */
	public function account_fields() {
		return array(
			array(
				'key'         => 'phone_number_id',
				'label'       => __( 'Phone number ID', 'quicksheet' ),
				'type'        => 'text',
				'placeholder' => '1234567890123456',
				'help'        => __( 'Meta for Developers → your app → WhatsApp → API Setup.', 'quicksheet' ),
			),
			array(
				'key'         => 'access_token',
				'label'       => __( 'Permanent access token', 'quicksheet' ),
				'type'        => 'password',
				'placeholder' => 'EAAG…',
				'help'        => __( 'Create a System User token with the whatsapp_business_messaging permission.', 'quicksheet' ),
			),
		);
	}

	/** {@inheritDoc} */
	public function verify_account( array $credentials ) {
		if ( ! Meta_Graph::is_id( $credentials['phone_number_id'] ) || '' === $credentials['access_token'] ) {
			return new WP_Error( 'qswp_invalid', __( 'Enter a valid phone number ID and access token.', 'quicksheet' ) );
		}
		$url  = add_query_arg( 'fields', 'display_phone_number,verified_name', Meta_Graph::url( $credentials['phone_number_id'] ) );
		$data = $this->parse_response( wp_remote_get( $url, Meta_Graph::args( $credentials['access_token'] ) ) );
		if ( is_wp_error( $data ) ) {
			return $data;
		}
		$name   = isset( $data['verified_name'] ) ? $data['verified_name'] : $this->label();
		$number = isset( $data['display_phone_number'] ) ? ' (' . $data['display_phone_number'] . ')' : '';
		return sanitize_text_field( $name . $number );
	}

	/** {@inheritDoc} */
	public function sanitize_settings( array $raw ) {
		$params = array();
		foreach ( isset( $raw['template_params'] ) && is_array( $raw['template_params'] ) ? $raw['template_params'] : array() as $p ) {
			if ( is_scalar( $p ) ) {
				$params[] = sanitize_text_field( (string) $p );
			}
		}
		$type = isset( $raw['message_type'] ) && 'template' === $raw['message_type'] ? 'template' : 'text';
		// Meta expects codes like "en_US"; accept the common "en-US" spelling instead of silently producing "enUS".
		$lang = isset( $raw['template_language'] ) ? preg_replace( '/[^A-Za-z_]/', '', str_replace( '-', '_', sanitize_text_field( (string) $raw['template_language'] ) ) ) : '';
		return array(
			'recipient'         => isset( $raw['recipient'] ) ? sanitize_text_field( (string) $raw['recipient'] ) : '',
			'message_type'      => $type,
			'message'           => isset( $raw['message'] ) ? sanitize_textarea_field( (string) $raw['message'] ) : '',
			'template_name'     => isset( $raw['template_name'] ) ? sanitize_key( (string) $raw['template_name'] ) : '',
			'template_language' => $lang ? $lang : 'en_US',
			'template_params'   => array_slice( $params, 0, 20 ),
		);
	}

	/** {@inheritDoc} */
	public function validate( array $feed ) {
		$account = $this->validate_account( $feed );
		if ( is_wp_error( $account ) ) {
			return $account;
		}
		$s = $feed['settings'];
		if ( '' === trim( $s['recipient'] ) ) {
			return new WP_Error( 'qswp_invalid', __( 'Enter the recipient phone number or choose a phone field.', 'quicksheet' ) );
		}
		if ( 'text' === $s['message_type'] && '' === trim( $s['message'] ) ) {
			return new WP_Error( 'qswp_invalid', __( 'Write the message to send.', 'quicksheet' ) );
		}
		if ( 'template' === $s['message_type'] && '' === $s['template_name'] ) {
			return new WP_Error( 'qswp_invalid', __( 'Enter the approved template name.', 'quicksheet' ) );
		}
		return true;
	}

	/**
	 * Normalize to international digits (E.164 without "+").
	 *
	 * @param string $phone Phone.
	 * @return string
	 */
	public static function normalize_phone( $phone ) {
		$digits = preg_replace( '/\D+/', '', (string) $phone );
		if ( 0 === strpos( $digits, '00' ) ) {
			$digits = substr( $digits, 2 );
		}
		return strlen( $digits ) >= 8 && strlen( $digits ) <= 15 ? $digits : '';
	}

	/** {@inheritDoc} */
	public function build_payload( array $feed, array $tags ) {
		$s  = $feed['settings'];
		$to = self::normalize_phone( $this->render( $s['recipient'], $tags ) );
		if ( '' === $to ) {
			return array( 'invalid_recipient' => $this->render( $s['recipient'], $tags ) );
		}
		$payload = array(
			'messaging_product' => 'whatsapp',
			'recipient_type'    => 'individual',
			'to'                => $to,
		);
		if ( 'template' === $s['message_type'] ) {
			$params = array();
			foreach ( $s['template_params'] as $param ) {
				$params[] = array(
					'type' => 'text',
					'text' => $this->limit( $this->render( $param, $tags ), 1024 ),
				);
			}
			$template = array(
				'name'     => $s['template_name'],
				'language' => array( 'code' => $s['template_language'] ),
			);
			if ( $params ) {
				$template['components'] = array(
					array(
						'type'       => 'body',
						'parameters' => $params,
					),
				);
			}
			$payload['type']     = 'template';
			$payload['template'] = $template;
		} else {
			$body = $this->render( $s['message'], $tags );
			if ( '' === $body ) {
				return array();
			}
			$payload['type'] = 'text';
			$payload['text'] = array(
				'preview_url' => false,
				'body'        => $this->limit( $body, 4096 ),
			);
		}
		return $payload;
	}

	/** {@inheritDoc} */
	public function send( array $feed, array $payload ) {
		if ( isset( $payload['invalid_recipient'] ) ) {
			/* translators: %s: submitted phone number */
			return new WP_Error( 'qswp_invalid_phone', sprintf( __( 'Invalid recipient phone number: "%s". Use the international format, e.g. +8801712345678.', 'quicksheet' ), $payload['invalid_recipient'] ) );
		}
		$creds = $this->credentials( $feed );
		if ( is_wp_error( $creds ) ) {
			return $creds;
		}
		if ( ! Meta_Graph::is_id( $creds['phone_number_id'] ) ) {
			return new WP_Error( 'qswp_invalid', __( 'The saved WhatsApp phone number ID is invalid.', 'quicksheet' ) );
		}
		$data = $this->parse_response(
			wp_remote_post( Meta_Graph::url( $creds['phone_number_id'] . '/messages' ), Meta_Graph::args( $creds['access_token'], $payload ) )
		);
		if ( is_wp_error( $data ) ) {
			return $data;
		}
		return array(
			/* translators: %s: phone number */
			'message' => sprintf( __( 'WhatsApp message sent to +%s.', 'quicksheet' ), $payload['to'] ),
			'id'      => isset( $data['messages'][0]['id'] ) ? $data['messages'][0]['id'] : '',
		);
	}
}
