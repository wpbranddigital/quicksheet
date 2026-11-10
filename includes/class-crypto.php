<?php
/**
 * Encrypts secrets (client secret, OAuth tokens) at rest in wp_options.
 *
 * @package QuickSheetWP
 */

namespace QuickSheetWP;

defined( 'ABSPATH' ) || exit;

/**
 * Crypto.
 */
class Crypto {

	const METHOD = 'aes-256-cbc';
	const PREFIX = 'qswp:';

	/**
	 * Derive the encryption key.
	 */
	private static function key() {
		$salt = defined( 'QSWP_ENCRYPTION_KEY' ) ? QSWP_ENCRYPTION_KEY : wp_salt( 'auth' );
		return hash( 'sha256', $salt, true );
	}

	/**
	 * Encrypt a string.
	 */
	public static function encrypt( $value ) {
		if ( '' === $value || null === $value ) {
			return '';
		}
		if ( ! function_exists( 'openssl_encrypt' ) ) {
			return $value;
		}
		$iv     = random_bytes( openssl_cipher_iv_length( self::METHOD ) );
		$cipher = openssl_encrypt( $value, self::METHOD, self::key(), OPENSSL_RAW_DATA, $iv );
		if ( false === $cipher ) {
			return $value;
		}
		$mac = hash_hmac( 'sha256', $iv . $cipher, self::key(), true );
		return self::PREFIX . bin2hex( $iv . $mac . $cipher );
	}

	/**
	 * Decrypt a string.
	 */
	public static function decrypt( $value ) {
		if ( ! is_string( $value ) || 0 !== strpos( $value, self::PREFIX ) ) {
			return $value; // Plain value (openssl missing when saved).
		}
		if ( ! function_exists( 'openssl_decrypt' ) ) {
			return '';
		}
		$hex   = substr( $value, strlen( self::PREFIX ) );
		$raw   = ( '' !== $hex && ctype_xdigit( $hex ) && 0 === strlen( $hex ) % 2 ) ? hex2bin( $hex ) : false;
		$ivlen = openssl_cipher_iv_length( self::METHOD );
		if ( false === $raw || strlen( $raw ) <= $ivlen + 32 ) {
			return '';
		}
		$iv     = substr( $raw, 0, $ivlen );
		$mac    = substr( $raw, $ivlen, 32 );
		$cipher = substr( $raw, $ivlen + 32 );
		if ( ! hash_equals( $mac, hash_hmac( 'sha256', $iv . $cipher, self::key(), true ) ) ) {
			return '';
		}
		$plain = openssl_decrypt( $cipher, self::METHOD, self::key(), OPENSSL_RAW_DATA, $iv );
		return false === $plain ? '' : $plain;
	}
}
