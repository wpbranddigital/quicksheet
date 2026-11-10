<?php
/**
 * Handles the "Connect with Google" redirect and the OAuth callback.
 *
 * @package QuickSheetWP
 */

namespace QuickSheetWP;

defined( 'ABSPATH' ) || exit;

/**
 * OAuth 2.0 authorization-code flow.
 */
class OAuth_Handler {

	const NOTICE = 'qswp_oauth_notice_';

	/**
	 * Google client.
	 *
	 * @var Google_Client
	 */
	private $google;

	/**
	 * Constructor.
	 *
	 * @param Google_Client $google Client.
	 */
	public function __construct( Google_Client $google ) {
		$this->google = $google;
	}

	/**
	 * Hooks.
	 */
	public function register() {
		add_action( 'admin_post_qswp_oauth_connect', array( $this, 'connect' ) );
		add_action( 'admin_post_qswp_oauth_callback', array( $this, 'callback' ) );
	}

	/**
	 * Allow redirecting to Google's consent screen.
	 *
	 * @param string[] $hosts Hosts.
	 * @return string[]
	 */
	public static function allow_google( $hosts ) {
		$hosts[] = 'accounts.google.com';
		return $hosts;
	}

	/**
	 * URL that starts the OAuth flow (consumed by JS, so "&" is not HTML-escaped).
	 *
	 * @return string
	 */
	public static function connect_url() {
		return add_query_arg(
			array(
				'action'   => 'qswp_oauth_connect',
				'_wpnonce' => wp_create_nonce( 'qswp_oauth_connect' ),
			),
			admin_url( 'admin-post.php' )
		);
	}

	/**
	 * Read and clear the one-time notice for the current user.
	 *
	 * @return array { connected: bool, error: string }
	 */
	public static function pop_notice() {
		$key    = self::NOTICE . get_current_user_id();
		$notice = get_transient( $key );
		delete_transient( $key );
		return array(
			'connected' => ! empty( $notice['connected'] ),
			'error'     => isset( $notice['error'] ) ? sanitize_text_field( $notice['error'] ) : '',
		);
	}

	/**
	 * Store a notice and go back to the Apps screen.
	 *
	 * @param array $notice Notice.
	 */
	private function back( array $notice ) {
		set_transient( self::NOTICE . get_current_user_id(), $notice, 5 * MINUTE_IN_SECONDS );
		wp_safe_redirect( admin_url( 'admin.php?page=' . QSWP_SLUG ) . '#/apps' );
		exit;
	}

	/**
	 * Step 1: redirect to Google.
	 */
	public function connect() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You are not allowed to do this.', 'quicksheet' ), 403 );
		}
		check_admin_referer( 'qswp_oauth_connect' );

		if ( ! $this->google->is_configured() ) {
			$this->back( array( 'error' => __( 'Save your Client ID and Client Secret first.', 'quicksheet' ) ) );
		}

		$state = wp_generate_password( 32, false );
		set_transient( 'qswp_oauth_state_' . get_current_user_id(), $state, 15 * MINUTE_IN_SECONDS );

		add_filter( 'allowed_redirect_hosts', array( __CLASS__, 'allow_google' ) );
		wp_safe_redirect( $this->google->auth_url( $state ) );
		exit;
	}

	/**
	 * Step 2: Google redirects back here.
	 */
	public function callback() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You are not allowed to do this.', 'quicksheet' ), 403 );
		}

		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- CSRF protection is the OAuth "state" value checked below.
		$state = isset( $_GET['state'] ) ? sanitize_text_field( wp_unslash( $_GET['state'] ) ) : '';
		$code  = isset( $_GET['code'] ) ? sanitize_text_field( wp_unslash( $_GET['code'] ) ) : '';
		$error = isset( $_GET['error'] ) ? sanitize_text_field( wp_unslash( $_GET['error'] ) ) : '';
		// phpcs:enable

		$key      = 'qswp_oauth_state_' . get_current_user_id();
		$expected = get_transient( $key );
		delete_transient( $key );

		if ( ! $expected || ! hash_equals( (string) $expected, $state ) ) {
			$this->back( array( 'error' => __( 'Invalid or expired authorization request. Please try again.', 'quicksheet' ) ) );
		}
		if ( $error ) {
			$this->back( array( 'error' => $error ) );
		}

		$result = $this->google->exchange_code( $code );
		if ( is_wp_error( $result ) ) {
			$this->back( array( 'error' => $result->get_error_message() ) );
		}
		$this->back( array( 'connected' => true ) );
	}
}
