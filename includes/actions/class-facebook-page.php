<?php
/**
 * Facebook Page action: publish a post on a Page you manage.
 *
 * @package QuickSheetWP
 */

namespace QuickSheetWP\Actions;

use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Facebook Page posts via the Graph API.
 */
class Facebook_Page extends Action {

	/** {@inheritDoc} */
	public function slug() {
		return 'facebook_page';
	}

	/** {@inheritDoc} */
	public function label() {
		return 'Facebook Page';
	}

	/** {@inheritDoc} */
	public function description() {
		return __( 'Publish a post on your Facebook Page.', 'quicksheet' );
	}

	/** {@inheritDoc} */
	public function docs_url() {
		return 'https://developers.facebook.com/docs/pages-api/getting-started';
	}

	/** {@inheritDoc} */
	public function account_fields() {
		return array(
			array(
				'key'         => 'page_id',
				'label'       => __( 'Page ID', 'quicksheet' ),
				'type'        => 'text',
				'placeholder' => '102345678901234',
				'help'        => __( 'Your Page → About → Page transparency, or Meta Business Suite → Settings.', 'quicksheet' ),
			),
			array(
				'key'         => 'access_token',
				'label'       => __( 'Page access token', 'quicksheet' ),
				'type'        => 'password',
				'placeholder' => 'EAAG…',
				'help'        => __( 'A long-lived Page token with pages_manage_posts and pages_read_engagement.', 'quicksheet' ),
			),
		);
	}

	/** {@inheritDoc} */
	public function verify_account( array $credentials ) {
		if ( ! Meta_Graph::is_id( $credentials['page_id'] ) || '' === $credentials['access_token'] ) {
			return new WP_Error( 'qswp_invalid', __( 'Enter a valid Page ID and access token.', 'quicksheet' ) );
		}
		$url  = add_query_arg( 'fields', 'name', Meta_Graph::url( $credentials['page_id'] ) );
		$data = $this->parse_response( wp_remote_get( $url, Meta_Graph::args( $credentials['access_token'] ) ) );
		if ( is_wp_error( $data ) ) {
			return $data;
		}
		return isset( $data['name'] ) ? sanitize_text_field( $data['name'] ) : $this->label();
	}

	/** {@inheritDoc} */
	public function sanitize_settings( array $raw ) {
		return array(
			'message' => isset( $raw['message'] ) ? sanitize_textarea_field( (string) $raw['message'] ) : '',
			'link'    => isset( $raw['link'] ) ? sanitize_text_field( (string) $raw['link'] ) : '',
		);
	}

	/** {@inheritDoc} */
	public function validate( array $feed ) {
		$account = $this->validate_account( $feed );
		if ( is_wp_error( $account ) ) {
			return $account;
		}
		if ( '' === trim( $feed['settings']['message'] ) ) {
			return new WP_Error( 'qswp_invalid', __( 'Write the post text.', 'quicksheet' ) );
		}
		return true;
	}

	/** {@inheritDoc} */
	public function build_payload( array $feed, array $tags ) {
		$s       = $feed['settings'];
		$message = $this->render( $s['message'], $tags );
		if ( '' === $message ) {
			return array();
		}
		$payload = array( 'message' => $this->limit( $message, 60000 ) );
		$link    = esc_url_raw( $this->render( $s['link'], $tags ), array( 'http', 'https' ) );
		if ( $link ) {
			$payload['link'] = $link;
		}
		return $payload;
	}

	/** {@inheritDoc} */
	public function send( array $feed, array $payload ) {
		$creds = $this->credentials( $feed );
		if ( is_wp_error( $creds ) ) {
			return $creds;
		}
		if ( ! Meta_Graph::is_id( $creds['page_id'] ) ) {
			return new WP_Error( 'qswp_invalid', __( 'The saved Facebook Page ID is invalid.', 'quicksheet' ) );
		}
		$data = $this->parse_response(
			wp_remote_post( Meta_Graph::url( $creds['page_id'] . '/feed' ), Meta_Graph::args( $creds['access_token'], $payload ) )
		);
		if ( is_wp_error( $data ) ) {
			return $data;
		}
		return array(
			/* translators: %s: post ID */
			'message' => sprintf( __( 'Posted to Facebook Page (post %s).', 'quicksheet' ), isset( $data['id'] ) ? $data['id'] : '–' ),
			'id'      => isset( $data['id'] ) ? $data['id'] : '',
		);
	}
}
