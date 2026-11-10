<?php
/**
 * Connected app accounts (WhatsApp, Facebook, Discord…). Credentials are encrypted.
 *
 * @package QuickSheetWP
 */

namespace QuickSheetWP;

defined( 'ABSPATH' ) || exit;

/**
 * Account repository.
 */
class Accounts {

	/**
	 * Object cache group.
	 */
	const CACHE_GROUP = 'qswp_accounts';

	/**
	 * Cache key salted with the group's last-changed time, so one
	 * invalidation clears every cached list and row.
	 *
	 * @param string $key Base key.
	 * @return string
	 */
	private static function cache_key( $key ) {
		return $key . ':' . wp_cache_get_last_changed( self::CACHE_GROUP );
	}

	/**
	 * Invalidate all cached account data.
	 */
	private static function flush_cache() {
		wp_cache_delete( 'last_changed', self::CACHE_GROUP );
	}

	/**
	 * Table name.
	 *
	 * @return string
	 */
	private static function table() {
		global $wpdb;
		return $wpdb->prefix . 'qswp_accounts';
	}

	/**
	 * Public (credential-free) representation.
	 *
	 * @param array $row DB row.
	 * @return array
	 */
	private static function to_public( $row ) {
		return array(
			'id'         => (int) $row['id'],
			'service'    => $row['service'],
			'name'       => $row['name'],
			'created_at' => $row['created_at'],
		);
	}

	/**
	 * List accounts, optionally for one service. Never includes credentials.
	 *
	 * @param string $service Optional service slug.
	 * @return array[]
	 */
	public static function all( $service = '' ) {
		global $wpdb;
		$key  = self::cache_key( 'all:' . $service );
		$rows = wp_cache_get( $key, self::CACHE_GROUP );
		if ( false === $rows ) {
			if ( $service ) {
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
				$rows = $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM %i WHERE service = %s ORDER BY id DESC', self::table(), $service ), ARRAY_A );
			} else {
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
				$rows = $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM %i ORDER BY id DESC', self::table() ), ARRAY_A );
			}
			$rows = (array) $rows;
			wp_cache_set( $key, $rows, self::CACHE_GROUP );
		}
		return array_map( array( __CLASS__, 'to_public' ), $rows );
	}

	/**
	 * Get an account with decrypted credentials (server-side use only).
	 *
	 * @param int $id Account ID.
	 * @return array|null
	 */
	public static function get( $id ) {
		global $wpdb;
		$key = self::cache_key( 'row:' . (int) $id );
		$row = wp_cache_get( $key, self::CACHE_GROUP );
		if ( false === $row ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$row = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE id = %d', self::table(), $id ), ARRAY_A );
			// Credentials stay encrypted in the cache; they are decrypted below.
			wp_cache_set( $key, $row ? $row : 0, self::CACHE_GROUP );
		}
		if ( ! $row ) {
			return null;
		}
		$creds              = json_decode( (string) Crypto::decrypt( $row['credentials'] ), true );
		$out                = self::to_public( $row );
		$out['credentials'] = is_array( $creds ) ? $creds : array();
		return $out;
	}

	/**
	 * Insert an account.
	 *
	 * @param string $service     Service slug.
	 * @param string $name        Display name.
	 * @param array  $credentials Raw credentials.
	 * @return int
	 */
	public static function add( $service, $name, array $credentials ) {
		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$wpdb->insert(
			self::table(),
			array(
				'service'     => sanitize_key( $service ),
				'name'        => sanitize_text_field( $name ),
				'credentials' => Crypto::encrypt( wp_json_encode( $credentials ) ),
				'created_at'  => current_time( 'mysql' ),
			)
		);
		self::flush_cache();
		return (int) $wpdb->insert_id;
	}

	/**
	 * Delete an account.
	 *
	 * @param int $id Account ID.
	 * @return bool
	 */
	public static function delete( $id ) {
		global $wpdb;
		$deleted = $wpdb->delete( self::table(), array( 'id' => (int) $id ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		wp_cache_delete( 'last_changed', self::CACHE_GROUP );
		return (bool) $deleted;
	}
}
