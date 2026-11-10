<?php
/**
 * Submission log storage.
 *
 * @package QuickSheetWP
 */

namespace QuickSheetWP;

defined( 'ABSPATH' ) || exit;

/**
 * Log repository.
 */
class Logger {

	const SUCCESS = 'success';
	const FAILED  = 'failed';
	const PENDING = 'pending'; // Failed, waiting for automatic retry.

	/**
	 * Table name.
	 *
	 * @return string
	 */
	private static function table() {
		global $wpdb;
		return $wpdb->prefix . 'qswp_logs';
	}

	/**
	 * Add a log entry.
	 *
	 * @param array  $feed    Feed.
	 * @param string $status  Status.
	 * @param string $message Message.
	 * @param array  $payload Sent payload (stored for retries).
	 * @return int
	 */
	public static function add( array $feed, $status, $message, array $payload ) {
		global $wpdb;
		$now = current_time( 'mysql' );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$wpdb->insert(
			self::table(),
			array(
				'feed_id'    => (int) $feed['id'],
				'source'     => (string) $feed['source'],
				'form_id'    => (string) $feed['form_id'],
				'action'     => isset( $feed['action'] ) ? (string) $feed['action'] : '',
				'status'     => $status,
				'message'    => wp_strip_all_tags( (string) $message ),
				'row_data'   => wp_json_encode( $payload ),
				'attempts'   => 1,
				'created_at' => $now,
				'updated_at' => $now,
			)
		);
		return (int) $wpdb->insert_id;
	}

	/**
	 * Update status after an attempt.
	 *
	 * @param int    $id                 Log ID.
	 * @param string $status             Status.
	 * @param string $message            Message.
	 * @param bool   $increment_attempts Count this as an attempt.
	 */
	public static function update( $id, $status, $message, $increment_attempts = true ) {
		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->query(
			$wpdb->prepare(
				'UPDATE %i SET status = %s, message = %s, attempts = attempts + %d, updated_at = %s WHERE id = %d',
				self::table(),
				$status,
				wp_strip_all_tags( (string) $message ),
				$increment_attempts ? 1 : 0,
				current_time( 'mysql' ),
				$id
			)
		);
	}

	/**
	 * One entry.
	 *
	 * @param int $id Log ID.
	 * @return array|null
	 */
	public static function get( $id ) {
		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$row = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE id = %d', self::table(), $id ), ARRAY_A );
		return $row ? self::format( $row ) : null;
	}

	/**
	 * Format a row.
	 *
	 * @param array $row Row.
	 * @return array
	 */
	private static function format( $row ) {
		$data = json_decode( (string) $row['row_data'], true );
		return array(
			'id'         => (int) $row['id'],
			'feed_id'    => (int) $row['feed_id'],
			'source'     => $row['source'],
			'form_id'    => $row['form_id'],
			'action'     => isset( $row['action'] ) ? $row['action'] : '',
			'status'     => $row['status'],
			'message'    => $row['message'],
			'row_data'   => is_array( $data ) ? $data : array(),
			'attempts'   => (int) $row['attempts'],
			'created_at' => $row['created_at'],
			'updated_at' => $row['updated_at'],
			'feed_name'  => isset( $row['feed_name'] ) ? $row['feed_name'] : '',
		);
	}

	/**
	 * Paginated query.
	 *
	 * @param array $args page, per_page, status, feed_id.
	 * @return array { items, total, pages }
	 */
	public static function query( $args = array() ) {
		global $wpdb;
		$args = wp_parse_args(
			$args,
			array(
				'page'     => 1,
				'per_page' => 20,
				'status'   => '',
				'feed_id'  => 0,
			)
		);

		$status  = in_array( $args['status'], array( self::SUCCESS, self::FAILED, self::PENDING ), true ) ? $args['status'] : '';
		$feed_id = (int) $args['feed_id'];
		$per     = max( 1, min( 100, (int) $args['per_page'] ) );
		$page    = max( 1, (int) $args['page'] );
		$offset  = ( $page - 1 ) * $per;
		$logs    = self::table();
		$feeds   = $wpdb->prefix . 'qswp_feeds';

		// Empty string / 0 disable the filter.
		// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$total = (int) $wpdb->get_var(
			$wpdb->prepare(
				'SELECT COUNT(*) FROM %i l WHERE ( %s = \'\' OR l.status = %s ) AND ( %d = 0 OR l.feed_id = %d )',
				$logs,
				$status,
				$status,
				$feed_id,
				$feed_id
			)
		);
		$rows  = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT l.*, f.name AS feed_name FROM %i l LEFT JOIN %i f ON f.id = l.feed_id WHERE ( %s = \'\' OR l.status = %s ) AND ( %d = 0 OR l.feed_id = %d ) ORDER BY l.id DESC LIMIT %d OFFSET %d',
				$logs,
				$feeds,
				$status,
				$status,
				$feed_id,
				$feed_id,
				$per,
				$offset
			),
			ARRAY_A
		);
		// phpcs:enable

		return array(
			'items' => array_map( array( __CLASS__, 'format' ), (array) $rows ),
			'total' => $total,
			'pages' => (int) ceil( $total / $per ),
		);
	}

	/**
	 * Dashboard statistics.
	 *
	 * @return array
	 */
	public static function stats() {
		global $wpdb;
		$table = self::table();
		$now   = strtotime( current_time( 'mysql' ) );
		$since = gmdate( 'Y-m-d H:i:s', $now - 30 * DAY_IN_SECONDS );
		$today = current_time( 'Y-m-d' ) . ' 00:00:00';
		$from  = gmdate( 'Y-m-d', $now - 13 * DAY_IN_SECONDS ) . ' 00:00:00';

		// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$counts      = $wpdb->get_results( $wpdb->prepare( 'SELECT status, COUNT(*) c FROM %i WHERE created_at >= %s GROUP BY status', $table, $since ), ARRAY_A );
		$today_count = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM %i WHERE created_at >= %s AND status = %s', $table, $today, self::SUCCESS ) );
		$daily       = $wpdb->get_results( $wpdb->prepare( 'SELECT DATE(created_at) d, status, COUNT(*) c FROM %i WHERE created_at >= %s GROUP BY DATE(created_at), status', $table, $from ), ARRAY_A );
		$by_action   = $wpdb->get_results( $wpdb->prepare( 'SELECT action, COUNT(*) c FROM %i WHERE created_at >= %s AND status = %s GROUP BY action', $table, $since, self::SUCCESS ), ARRAY_A );
		// phpcs:enable

		$out = array(
			'success' => 0,
			'failed'  => 0,
			'pending' => 0,
		);
		foreach ( (array) $counts as $c ) {
			$out[ $c['status'] ] = (int) $c['c'];
		}
		$out['today'] = $today_count;

		$by_day = array();
		foreach ( (array) $daily as $d ) {
			if ( ! isset( $by_day[ $d['d'] ] ) ) {
				$by_day[ $d['d'] ] = array( 0, 0 );
			}
			$by_day[ $d['d'] ][ self::SUCCESS === $d['status'] ? 0 : 1 ] += (int) $d['c'];
		}
		$series = array();
		$base   = strtotime( current_time( 'Y-m-d' ) );
		for ( $i = 13; $i >= 0; $i-- ) {
			$day      = gmdate( 'Y-m-d', $base - $i * DAY_IN_SECONDS );
			$series[] = array(
				'date'    => $day,
				'success' => isset( $by_day[ $day ] ) ? $by_day[ $day ][0] : 0,
				'failed'  => isset( $by_day[ $day ] ) ? $by_day[ $day ][1] : 0,
			);
		}
		$out['series']    = $series;
		$out['by_action'] = array();
		foreach ( (array) $by_action as $row ) {
			$out['by_action'][ $row['action'] ? $row['action'] : 'google_sheets' ] = (int) $row['c'];
		}
		return $out;
	}

	/**
	 * Delete one entry.
	 *
	 * @param int $id Log ID.
	 * @return bool
	 */
	public static function delete( $id ) {
		global $wpdb;
		// Drop any queued automatic retry for this entry.
		wp_clear_scheduled_hook( 'qswp_retry_log', array( (int) $id ) );
		return (bool) $wpdb->delete( self::table(), array( 'id' => (int) $id ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
	}

	/**
	 * Clear logs (optionally by status).
	 *
	 * @param string $status Status filter.
	 * @return int|bool
	 */
	public static function clear( $status = '' ) {
		global $wpdb;
		// Pending entries have queued retries; remove them with the rows.
		if ( '' === $status || self::PENDING === $status ) {
			wp_unschedule_hook( 'qswp_retry_log' );
		}
		if ( $status ) {
			return $wpdb->delete( self::table(), array( 'status' => $status ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		}
		return $wpdb->query( $wpdb->prepare( 'DELETE FROM %i', self::table() ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
	}

	/**
	 * Daily cron: purge old successful entries.
	 */
	public static function cleanup() {
		global $wpdb;
		$days  = (int) Options::get( 'log_retention_days' );
		$limit = gmdate( 'Y-m-d H:i:s', strtotime( current_time( 'mysql' ) ) - $days * DAY_IN_SECONDS );
		// Failures stay until handled.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->query( $wpdb->prepare( 'DELETE FROM %i WHERE status = %s AND created_at < %s', self::table(), self::SUCCESS, $limit ) );
	}
}
