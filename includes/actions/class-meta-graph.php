<?php
/**
 * Shared Meta Graph API helper (WhatsApp Cloud API & Facebook Pages).
 *
 * @package QuickSheetWP
 */

namespace QuickSheetWP\Actions;

defined( 'ABSPATH' ) || exit;

/**
 * Builds Graph API requests. Only graph.facebook.com is ever contacted.
 */
class Meta_Graph {

	const HOST    = 'https://graph.facebook.com/';
	const VERSION = 'v23.0';

	/**
	 * Build a Graph API URL.
	 *
	 * @param string $path Path such as "123/messages" (IDs are validated by callers).
	 * @return string
	 */
	public static function url( $path ) {
		$version = (string) apply_filters( 'qswp_graph_api_version', self::VERSION );
		if ( ! preg_match( '/^v\d{1,2}\.\d$/', $version ) ) {
			$version = self::VERSION;
		}
		return self::HOST . $version . '/' . ltrim( $path, '/' );
	}

	/**
	 * Request arguments with bearer auth.
	 *
	 * @param string     $token Access token.
	 * @param array|null $body  JSON body.
	 * @return array
	 */
	public static function args( $token, $body = null ) {
		$args = array(
			'timeout' => 15,
			'headers' => array(
				'Authorization' => 'Bearer ' . $token,
				'Accept'        => 'application/json',
			),
		);
		if ( null !== $body ) {
			$args['headers']['Content-Type'] = 'application/json';
			$args['body']                    = wp_json_encode( $body );
		}
		return $args;
	}

	/**
	 * Numeric Graph object IDs only.
	 *
	 * @param string $id ID.
	 * @return bool
	 */
	public static function is_id( $id ) {
		return (bool) preg_match( '/^\d{5,25}$/', (string) $id );
	}
}
