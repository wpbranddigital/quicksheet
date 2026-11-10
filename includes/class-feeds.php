<?php
/**
 * Integration (trigger → action flow) repository.
 *
 * @package QuickSheetWP
 */

namespace QuickSheetWP;

use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Feed storage. A "feed" is one integration flow: form → app.
 */
class Feeds {

	/**
	 * Table name.
	 *
	 * @return string
	 */
	private static function table() {
		global $wpdb;
		return $wpdb->prefix . 'qswp_feeds';
	}

	/**
	 * Convert a DB row into an array.
	 *
	 * @param array|null $row Row.
	 * @return array|null
	 */
	private static function hydrate( $row ) {
		if ( ! $row ) {
			return null;
		}
		$map      = json_decode( (string) $row['field_map'], true );
		$settings = json_decode( (string) $row['settings'], true );
		return array(
			'id'               => (int) $row['id'],
			'name'             => $row['name'],
			'source'           => $row['source'],
			'form_id'          => $row['form_id'],
			'form_title'       => $row['form_title'],
			'action'           => $row['action'] ? $row['action'] : 'google_sheets',
			'account_id'       => (int) $row['account_id'],
			'spreadsheet_id'   => $row['spreadsheet_id'],
			'spreadsheet_name' => $row['spreadsheet_name'],
			'sheet_name'       => $row['sheet_name'],
			'field_map'        => is_array( $map ) ? $map : array(),
			'settings'         => is_array( $settings ) ? $settings : array(),
			'status'           => (bool) $row['status'],
			'created_at'       => $row['created_at'],
			'updated_at'       => $row['updated_at'],
		);
	}

	/**
	 * All feeds.
	 *
	 * @return array[]
	 */
	public static function all() {
		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$rows = $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM %i ORDER BY id DESC', self::table() ), ARRAY_A );
		return array_map( array( __CLASS__, 'hydrate' ), (array) $rows );
	}

	/**
	 * One feed.
	 *
	 * @param int $id Feed ID.
	 * @return array|null
	 */
	public static function get( $id ) {
		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		return self::hydrate( $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE id = %d', self::table(), $id ), ARRAY_A ) );
	}

	/**
	 * Active feeds for a given form.
	 *
	 * @param string $source  Trigger slug.
	 * @param string $form_id Form ID.
	 * @return array[]
	 */
	public static function for_form( $source, $form_id ) {
		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$rows = $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM %i WHERE source = %s AND form_id = %s AND status = 1', self::table(), $source, (string) $form_id ), ARRAY_A );
		return array_map( array( __CLASS__, 'hydrate' ), (array) $rows );
	}

	/**
	 * Sanitize a template string (merge tags + text). Keeps line breaks.
	 *
	 * @param mixed $value Raw.
	 * @return string
	 */
	public static function sanitize_template( $value ) {
		return sanitize_textarea_field( (string) $value );
	}

	/**
	 * Sanitize the column map.
	 *
	 * @param mixed $map Raw map.
	 * @return array[]
	 */
	public static function sanitize_map( $map ) {
		$clean = array();
		foreach ( (array) $map as $item ) {
			if ( ! is_array( $item ) || ! isset( $item['col'] ) ) {
				continue;
			}
			$value = isset( $item['value'] ) ? self::sanitize_template( $item['value'] ) : '';
			if ( '' === trim( $value ) ) {
				continue;
			}
			$clean[] = array(
				'col'    => max( 0, min( 701, absint( $item['col'] ) ) ), // A..ZZ.
				'header' => isset( $item['header'] ) ? sanitize_text_field( $item['header'] ) : '',
				'value'  => $value,
			);
		}
		usort(
			$clean,
			static function ( $a, $b ) {
				return $a['col'] - $b['col'];
			}
		);
		return $clean;
	}

	/**
	 * Create or update a feed.
	 *
	 * @param array $data Raw input.
	 * @param int   $id   Feed ID (0 to create).
	 * @return int|WP_Error Feed ID.
	 */
	public static function save( array $data, $id = 0 ) {
		global $wpdb;

		$get = static function ( $key, $fallback = '' ) use ( $data ) {
			return isset( $data[ $key ] ) && is_scalar( $data[ $key ] ) ? (string) $data[ $key ] : $fallback;
		};

		$action_slug = sanitize_key( $get( 'action', 'google_sheets' ) );
		$action      = Plugin::instance()->action( $action_slug );
		if ( ! $action ) {
			return new WP_Error( 'qswp_invalid', __( 'Please choose an action app.', 'quicksheet' ), array( 'status' => 400 ) );
		}

		$raw_settings          = isset( $data['settings'] ) && is_array( $data['settings'] ) ? $data['settings'] : array();
		$settings              = $action->sanitize_settings( $raw_settings );
		$settings['condition'] = Conditions::sanitize( isset( $raw_settings['condition'] ) ? $raw_settings['condition'] : array() );

		$row = array(
			'name'             => sanitize_text_field( $get( 'name' ) ),
			'source'           => sanitize_key( $get( 'source' ) ),
			'form_id'          => sanitize_text_field( $get( 'form_id' ) ),
			'form_title'       => sanitize_text_field( $get( 'form_title' ) ),
			'action'           => $action_slug,
			'account_id'       => absint( $get( 'account_id', '0' ) ),
			'spreadsheet_id'   => '',
			'spreadsheet_name' => '',
			'sheet_name'       => '',
			'field_map'        => wp_json_encode( array() ),
			'settings'         => wp_json_encode( $settings ),
			'updated_at'       => current_time( 'mysql' ),
		);
		// On update, keep the current status unless one was sent.
		if ( isset( $data['status'] ) ) {
			$row['status'] = rest_sanitize_boolean( $data['status'] ) ? 1 : 0;
		} elseif ( ! $id ) {
			$row['status'] = 1;
		}

		if ( 'google_sheets' === $action_slug ) {
			$row['spreadsheet_id']   = Google_Client::parse_spreadsheet_id( $get( 'spreadsheet_id' ) );
			$row['spreadsheet_name'] = sanitize_text_field( $get( 'spreadsheet_name' ) );
			$row['sheet_name']       = sanitize_text_field( $get( 'sheet_name' ) );
			$row['field_map']        = wp_json_encode( self::sanitize_map( isset( $data['field_map'] ) ? $data['field_map'] : array() ) );
		}

		if ( '' === $row['source'] || '' === $row['form_id'] ) {
			return new WP_Error( 'qswp_invalid', __( 'Please select a trigger form.', 'quicksheet' ), array( 'status' => 400 ) );
		}

		$valid = $action->validate(
			array_merge(
				$row,
				array(
					'settings'  => $settings,
					'field_map' => json_decode( $row['field_map'], true ),
				)
			)
		);
		if ( is_wp_error( $valid ) ) {
			$valid->add_data( array( 'status' => 400 ) );
			return $valid;
		}

		if ( '' === $row['name'] ) {
			$row['name'] = $row['form_title']
				/* translators: 1: form title, 2: app name */
				? sprintf( __( '%1$s → %2$s', 'quicksheet' ), $row['form_title'], $action->label() )
				: __( 'Untitled integration', 'quicksheet' );
		}

		if ( $id ) {
			$updated = $wpdb->update( self::table(), $row, array( 'id' => (int) $id ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			if ( false === $updated ) {
				return new WP_Error( 'qswp_db', __( 'Could not save the integration. Please try again.', 'quicksheet' ), array( 'status' => 500 ) );
			}
			return (int) $id;
		}

		$row['created_at'] = $row['updated_at'];
		$inserted          = $wpdb->insert( self::table(), $row ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		if ( ! $inserted || ! $wpdb->insert_id ) {
			return new WP_Error( 'qswp_db', __( 'Could not save the integration. Please try again.', 'quicksheet' ), array( 'status' => 500 ) );
		}
		return (int) $wpdb->insert_id;
	}

	/**
	 * Enable / pause.
	 *
	 * @param int  $id     Feed ID.
	 * @param bool $status Active.
	 * @return bool
	 */
	public static function set_status( $id, $status ) {
		global $wpdb;
		return false !== $wpdb->update( self::table(), array( 'status' => $status ? 1 : 0 ), array( 'id' => (int) $id ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
	}

	/**
	 * Delete.
	 *
	 * @param int $id Feed ID.
	 * @return bool
	 */
	public static function delete( $id ) {
		global $wpdb;
		return (bool) $wpdb->delete( self::table(), array( 'id' => (int) $id ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
	}

	/**
	 * Count feeds using an account.
	 *
	 * @param int $account_id Account ID.
	 * @return int
	 */
	public static function count_for_account( $account_id ) {
		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		return (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM %i WHERE account_id = %d', self::table(), $account_id ) );
	}
}
