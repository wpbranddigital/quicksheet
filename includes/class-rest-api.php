<?php
/**
 * REST endpoints powering the admin app. All routes require manage_options.
 *
 * @package QuickSheetWP
 */

namespace QuickSheetWP;

use WP_Error;
use WP_REST_Request;
use WP_REST_Server;

defined( 'ABSPATH' ) || exit;

/**
 * REST controller.
 */
class Rest_Api {

	const NS = 'quicksheet/v1';

	/**
	 * Plugin.
	 *
	 * @var Plugin
	 */
	private $plugin;

	/**
	 * Constructor.
	 *
	 * @param Plugin $plugin Plugin.
	 */
	public function __construct( Plugin $plugin ) {
		$this->plugin = $plugin;
	}

	/**
	 * Hook routes.
	 */
	public function register() {
		add_action( 'rest_api_init', array( $this, 'routes' ) );
	}

	/**
	 * Permission check for every route.
	 *
	 * @return bool
	 */
	public function can_manage() {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Register a route.
	 *
	 * @param string $path     Path.
	 * @param string $methods  Methods.
	 * @param string $callback Method name.
	 * @param array  $args     Args schema.
	 */
	private function route( $path, $methods, $callback, $args = array() ) {
		register_rest_route(
			self::NS,
			$path,
			array(
				'methods'             => $methods,
				'callback'            => array( $this, $callback ),
				'permission_callback' => array( $this, 'can_manage' ),
				'args'                => $args,
			)
		);
	}

	/**
	 * Declare routes.
	 */
	public function routes() {
		$r = WP_REST_Server::READABLE;
		$c = WP_REST_Server::CREATABLE;
		$d = WP_REST_Server::DELETABLE;

		$id     = array(
			'id' => array(
				'type'              => 'integer',
				'required'          => true,
				'sanitize_callback' => 'absint',
			),
		);
		$sheet  = array(
			'sheet' => array(
				'type'              => 'string',
				'required'          => true,
				'sanitize_callback' => 'sanitize_text_field',
			),
		);
		$status = array(
			'status' => array(
				'type'    => 'string',
				'enum'    => array( '', Logger::SUCCESS, Logger::FAILED, Logger::PENDING ),
				'default' => '',
			),
		);

		// Google account & general settings.
		$this->route( '/status', $r, 'get_status' );
		$this->route(
			'/credentials',
			$c,
			'save_credentials',
			array(
				'client_id'     => array(
					'type'              => 'string',
					'required'          => true,
					'sanitize_callback' => 'sanitize_text_field',
				),
				'client_secret' => array(
					'type'              => 'string',
					'default'           => '',
					'sanitize_callback' => 'sanitize_text_field',
				),
			)
		);
		$this->route( '/disconnect', $c, 'disconnect' );
		$this->route( '/settings', $r, 'get_settings' );
		$this->route( '/settings', $c, 'save_settings' );

		// Triggers.
		$this->route( '/sources', $r, 'get_sources' );
		$this->route( '/sources/(?P<source>[a-z0-9_-]+)/forms', $r, 'get_forms' );
		$this->route( '/sources/(?P<source>[a-z0-9_-]+)/forms/(?P<form_id>[A-Za-z0-9_-]+)/fields', $r, 'get_fields' );

		// Actions & accounts.
		$this->route( '/actions', $r, 'get_actions' );
		$this->route(
			'/accounts',
			$r,
			'get_accounts',
			array(
				'service' => array(
					'type'              => 'string',
					'default'           => '',
					'sanitize_callback' => 'sanitize_key',
				),
			)
		);
		$this->route(
			'/accounts',
			$c,
			'create_account',
			array(
				'service'     => array(
					'type'              => 'string',
					'required'          => true,
					'sanitize_callback' => 'sanitize_key',
				),
				'name'        => array(
					'type'              => 'string',
					'default'           => '',
					'sanitize_callback' => 'sanitize_text_field',
				),
				'credentials' => array(
					'type'     => 'object',
					'required' => true,
				),
			)
		);
		$this->route( '/accounts/(?P<id>\d+)', $d, 'delete_account', $id );
		$this->route( '/accounts/(?P<id>\d+)/verify', $c, 'verify_account', $id );

		// Google Sheets helpers.
		$this->route(
			'/spreadsheets',
			$r,
			'get_spreadsheets',
			array(
				'search' => array(
					'type'              => 'string',
					'default'           => '',
					'sanitize_callback' => 'sanitize_text_field',
				),
			)
		);
		$this->route(
			'/spreadsheets',
			$c,
			'create_spreadsheet',
			array(
				'title' => array(
					'type'              => 'string',
					'required'          => true,
					'sanitize_callback' => 'sanitize_text_field',
				),
			)
		);
		$this->route( '/spreadsheets/(?P<sid>[a-zA-Z0-9_-]+)', $r, 'get_spreadsheet' );
		$this->route( '/spreadsheets/(?P<sid>[a-zA-Z0-9_-]+)/headers', $r, 'get_headers', $sheet );
		$this->route(
			'/spreadsheets/(?P<sid>[a-zA-Z0-9_-]+)/headers',
			$c,
			'set_headers',
			array_merge(
				$sheet,
				array(
					'headers' => array(
						'type'     => 'array',
						'required' => true,
						'items'    => array( 'type' => 'string' ),
					),
				)
			)
		);

		// Integrations (feeds).
		$this->route( '/feeds', $r, 'get_feeds' );
		$this->route( '/feeds', $c, 'create_feed' );
		$this->route( '/feeds/(?P<id>\d+)', $r, 'get_feed', $id );
		$this->route( '/feeds/(?P<id>\d+)', $c, 'update_feed', $id );
		$this->route( '/feeds/(?P<id>\d+)', $d, 'delete_feed', $id );
		$this->route(
			'/feeds/(?P<id>\d+)/status',
			$c,
			'toggle_feed',
			array_merge(
				$id,
				array(
					'status' => array(
						'type'     => 'boolean',
						'required' => true,
					),
				)
			)
		);
		$this->route(
			'/feeds/(?P<id>\d+)/test',
			$c,
			'test_feed',
			array_merge(
				$id,
				array(
					'recipient' => array(
						'type'              => 'string',
						'default'           => '',
						'sanitize_callback' => 'sanitize_text_field',
					),
				)
			)
		);

		// Logs.
		$this->route(
			'/logs',
			$r,
			'get_logs',
			array_merge(
				$status,
				array(
					'page'     => array(
						'type'    => 'integer',
						'default' => 1,
						'minimum' => 1,
					),
					'per_page' => array(
						'type'    => 'integer',
						'default' => 20,
						'minimum' => 1,
						'maximum' => 100,
					),
					'feed_id'  => array(
						'type'    => 'integer',
						'default' => 0,
					),
				)
			)
		);
		$this->route( '/logs', $d, 'clear_logs', $status );
		$this->route( '/logs/(?P<id>\d+)', $d, 'delete_log', $id );
		$this->route( '/logs/(?P<id>\d+)/retry', $c, 'retry_log', $id );
		$this->route( '/logs/retry-failed', $c, 'retry_all_failed' );

		$this->route( '/dashboard', $r, 'get_dashboard' );
	}

	/* ------------------------------------------------------------------ */

	/**
	 * Ensure an error carries a REST status.
	 *
	 * @param WP_Error $error  Error.
	 * @param int      $status Status.
	 * @return WP_Error
	 */
	private function err( $error, $status = 400 ) {
		$data = $error->get_error_data();
		if ( ! is_array( $data ) || empty( $data['status'] ) ) {
			$error->add_data( array_merge( is_array( $data ) ? $data : array(), array( 'status' => $status ) ) );
		}
		return $error;
	}

	/**
	 * Not-found error.
	 *
	 * @return WP_Error
	 */
	private function not_found() {
		return new WP_Error( 'qswp_not_found', __( 'Not found.', 'quicksheet' ), array( 'status' => 404 ) );
	}

	/**
	 * Google connection status.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_status() {
		return rest_ensure_response(
			array_merge(
				$this->plugin->google->status(),
				array( 'connect_url' => OAuth_Handler::connect_url() )
			)
		);
	}

	/**
	 * Save Google OAuth client credentials.
	 *
	 * @param WP_REST_Request $req Request.
	 * @return \WP_REST_Response|WP_Error
	 */
	public function save_credentials( WP_REST_Request $req ) {
		$client_id = (string) $req['client_id'];
		if ( '' === $client_id || ! preg_match( '/^[A-Za-z0-9._-]+$/', $client_id ) ) {
			return new WP_Error( 'qswp_invalid', __( 'Enter a valid Client ID.', 'quicksheet' ), array( 'status' => 400 ) );
		}
		$secret = (string) $req['client_secret'];
		$this->plugin->google->save_credentials( $client_id, '' === $secret ? null : $secret );
		return $this->get_status();
	}

	/**
	 * Disconnect Google.
	 *
	 * @return \WP_REST_Response
	 */
	public function disconnect() {
		$this->plugin->google->disconnect();
		return $this->get_status();
	}

	/**
	 * General settings.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_settings() {
		return rest_ensure_response( Options::all() );
	}

	/**
	 * Save general settings.
	 *
	 * @param WP_REST_Request $req Request.
	 * @return \WP_REST_Response
	 */
	public function save_settings( WP_REST_Request $req ) {
		$params = $req->get_json_params();
		return rest_ensure_response( Options::save( is_array( $params ) ? $params : array() ) );
	}

	/**
	 * Triggers.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_sources() {
		$out = array();
		foreach ( $this->plugin->integrations() as $integration ) {
			$out[] = $integration->to_array();
		}
		return rest_ensure_response( $out );
	}

	/**
	 * Resolve an active trigger.
	 *
	 * @param string $slug Slug.
	 * @return Integrations\Integration|WP_Error
	 */
	private function integration_or_error( $slug ) {
		$integration = $this->plugin->integration( $slug );
		if ( ! $integration ) {
			return new WP_Error( 'qswp_unknown_source', __( 'Unknown form source.', 'quicksheet' ), array( 'status' => 404 ) );
		}
		if ( ! $integration->is_active() ) {
			/* translators: %s: plugin name */
			return new WP_Error( 'qswp_inactive_source', sprintf( __( '%s is not active.', 'quicksheet' ), $integration->label() ), array( 'status' => 400 ) );
		}
		return $integration;
	}

	/**
	 * Forms of a trigger.
	 *
	 * @param WP_REST_Request $req Request.
	 * @return \WP_REST_Response|WP_Error
	 */
	public function get_forms( WP_REST_Request $req ) {
		$i = $this->integration_or_error( $req['source'] );
		return is_wp_error( $i ) ? $i : rest_ensure_response( $i->forms() );
	}

	/**
	 * Fields of a form.
	 *
	 * @param WP_REST_Request $req Request.
	 * @return \WP_REST_Response|WP_Error
	 */
	public function get_fields( WP_REST_Request $req ) {
		$i = $this->integration_or_error( $req['source'] );
		return is_wp_error( $i ) ? $i : rest_ensure_response( $i->fields( (string) $req['form_id'] ) );
	}

	/**
	 * Actions with their connected accounts.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_actions() {
		$out = array();
		foreach ( $this->plugin->actions() as $action ) {
			$item             = $action->to_array();
			$item['accounts'] = $item['uses_accounts'] ? Accounts::all( $action->slug() ) : array();
			$out[]            = $item;
		}
		return rest_ensure_response( $out );
	}

	/**
	 * Accounts.
	 *
	 * @param WP_REST_Request $req Request.
	 * @return \WP_REST_Response
	 */
	public function get_accounts( WP_REST_Request $req ) {
		return rest_ensure_response( Accounts::all( (string) $req['service'] ) );
	}

	/**
	 * Verify credentials with the provider and store them encrypted.
	 *
	 * @param WP_REST_Request $req Request.
	 * @return \WP_REST_Response|WP_Error
	 */
	public function create_account( WP_REST_Request $req ) {
		$action = $this->plugin->action( (string) $req['service'] );
		if ( ! $action || ! $action->account_fields() ) {
			return new WP_Error( 'qswp_invalid', __( 'Unknown app.', 'quicksheet' ), array( 'status' => 400 ) );
		}
		$raw   = $req['credentials'];
		$creds = $action->sanitize_credentials( is_array( $raw ) ? $raw : array() );
		$name  = $action->verify_account( $creds );
		if ( is_wp_error( $name ) ) {
			return $this->err( $name );
		}
		$label = '' !== (string) $req['name'] ? (string) $req['name'] : $name;
		$id    = Accounts::add( $action->slug(), $label, $creds );
		if ( ! $id ) {
			return new WP_Error( 'qswp_db', __( 'Could not save the account. Please try again.', 'quicksheet' ), array( 'status' => 500 ) );
		}
		$all = Accounts::all( $action->slug() );
		foreach ( $all as $account ) {
			if ( $account['id'] === $id ) {
				return rest_ensure_response( $account );
			}
		}
		return $this->not_found();
	}

	/**
	 * Re-check stored credentials.
	 *
	 * @param WP_REST_Request $req Request.
	 * @return \WP_REST_Response|WP_Error
	 */
	public function verify_account( WP_REST_Request $req ) {
		$account = Accounts::get( (int) $req['id'] );
		$action  = $account ? $this->plugin->action( $account['service'] ) : null;
		if ( ! $account || ! $action ) {
			return $this->not_found();
		}
		$name = $action->verify_account( $account['credentials'] );
		if ( is_wp_error( $name ) ) {
			return $this->err( $name );
		}
		return rest_ensure_response(
			array(
				'ok'   => true,
				'name' => $name,
			)
		);
	}

	/**
	 * Delete an account (refused while integrations use it).
	 *
	 * @param WP_REST_Request $req Request.
	 * @return \WP_REST_Response|WP_Error
	 */
	public function delete_account( WP_REST_Request $req ) {
		$id    = (int) $req['id'];
		$count = Feeds::count_for_account( $id );
		if ( $count ) {
			return new WP_Error(
				'qswp_in_use',
				/* translators: %d: number of integrations */
				sprintf( _n( 'This account is used by %d integration. Change or delete it first.', 'This account is used by %d integrations. Change or delete them first.', $count, 'quicksheet' ), $count ),
				array( 'status' => 409 )
			);
		}
		return rest_ensure_response( array( 'deleted' => Accounts::delete( $id ) ) );
	}

	/**
	 * Drive spreadsheets.
	 *
	 * @param WP_REST_Request $req Request.
	 * @return \WP_REST_Response|WP_Error
	 */
	public function get_spreadsheets( WP_REST_Request $req ) {
		$res = $this->plugin->google->list_spreadsheets( (string) $req['search'] );
		return is_wp_error( $res ) ? $this->err( $res ) : rest_ensure_response( $res );
	}

	/**
	 * Create a spreadsheet.
	 *
	 * @param WP_REST_Request $req Request.
	 * @return \WP_REST_Response|WP_Error
	 */
	public function create_spreadsheet( WP_REST_Request $req ) {
		$title = (string) $req['title'];
		if ( '' === $title ) {
			return new WP_Error( 'qswp_invalid', __( 'Title is required.', 'quicksheet' ), array( 'status' => 400 ) );
		}
		$res = $this->plugin->google->create_spreadsheet( $title );
		return is_wp_error( $res ) ? $this->err( $res ) : rest_ensure_response( $res );
	}

	/**
	 * Spreadsheet tabs.
	 *
	 * @param WP_REST_Request $req Request.
	 * @return \WP_REST_Response|WP_Error
	 */
	public function get_spreadsheet( WP_REST_Request $req ) {
		$res = $this->plugin->google->get_spreadsheet( (string) $req['sid'] );
		return is_wp_error( $res ) ? $this->err( $res ) : rest_ensure_response( $res );
	}

	/**
	 * Header row.
	 *
	 * @param WP_REST_Request $req Request.
	 * @return \WP_REST_Response|WP_Error
	 */
	public function get_headers( WP_REST_Request $req ) {
		$res = $this->plugin->google->get_headers( (string) $req['sid'], (string) $req['sheet'] );
		return is_wp_error( $res ) ? $this->err( $res ) : rest_ensure_response( $res );
	}

	/**
	 * Write the header row.
	 *
	 * @param WP_REST_Request $req Request.
	 * @return \WP_REST_Response|WP_Error
	 */
	public function set_headers( WP_REST_Request $req ) {
		$headers = array_slice( array_map( 'sanitize_text_field', (array) $req['headers'] ), 0, 200 );
		$res     = $this->plugin->google->set_headers( (string) $req['sid'], (string) $req['sheet'], $headers );
		return is_wp_error( $res ) ? $this->err( $res ) : rest_ensure_response( $headers );
	}

	/**
	 * Add display labels to a feed.
	 *
	 * @param array $feed Feed.
	 * @return array
	 */
	private function decorate( array $feed ) {
		$source               = $this->plugin->integration( $feed['source'] );
		$action               = $this->plugin->action( $feed['action'] );
		$feed['source_label'] = $source ? $source->label() : $feed['source'];
		$feed['action_label'] = $action ? $action->label() : $feed['action'];
		$feed['account_name'] = '';
		if ( $feed['account_id'] ) {
			$account              = Accounts::get( $feed['account_id'] );
			$feed['account_name'] = $account ? $account['name'] : '';
		}
		return $feed;
	}

	/**
	 * All integrations.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_feeds() {
		return rest_ensure_response( array_map( array( $this, 'decorate' ), Feeds::all() ) );
	}

	/**
	 * One integration.
	 *
	 * @param WP_REST_Request $req Request.
	 * @return \WP_REST_Response|WP_Error
	 */
	public function get_feed( WP_REST_Request $req ) {
		$feed = Feeds::get( (int) $req['id'] );
		return $feed ? rest_ensure_response( $this->decorate( $feed ) ) : $this->not_found();
	}

	/**
	 * Create.
	 *
	 * @param WP_REST_Request $req Request.
	 * @return \WP_REST_Response|WP_Error
	 */
	public function create_feed( WP_REST_Request $req ) {
		$params = $req->get_json_params();
		$id     = Feeds::save( is_array( $params ) ? $params : array() );
		return is_wp_error( $id ) ? $id : rest_ensure_response( $this->decorate( Feeds::get( $id ) ) );
	}

	/**
	 * Update.
	 *
	 * @param WP_REST_Request $req Request.
	 * @return \WP_REST_Response|WP_Error
	 */
	public function update_feed( WP_REST_Request $req ) {
		if ( ! Feeds::get( (int) $req['id'] ) ) {
			return $this->not_found();
		}
		$params = $req->get_json_params();
		$id     = Feeds::save( is_array( $params ) ? $params : array(), (int) $req['id'] );
		return is_wp_error( $id ) ? $id : rest_ensure_response( $this->decorate( Feeds::get( $id ) ) );
	}

	/**
	 * Delete.
	 *
	 * @param WP_REST_Request $req Request.
	 * @return \WP_REST_Response
	 */
	public function delete_feed( WP_REST_Request $req ) {
		return rest_ensure_response( array( 'deleted' => Feeds::delete( (int) $req['id'] ) ) );
	}

	/**
	 * Enable / pause.
	 *
	 * @param WP_REST_Request $req Request.
	 * @return \WP_REST_Response|WP_Error
	 */
	public function toggle_feed( WP_REST_Request $req ) {
		if ( ! Feeds::get( (int) $req['id'] ) ) {
			return $this->not_found();
		}
		Feeds::set_status( (int) $req['id'], (bool) $req['status'] );
		return rest_ensure_response( $this->decorate( Feeds::get( (int) $req['id'] ) ) );
	}

	/**
	 * Send sample data through an integration (conditions are ignored).
	 *
	 * @param WP_REST_Request $req Request.
	 * @return \WP_REST_Response|WP_Error
	 */
	public function test_feed( WP_REST_Request $req ) {
		$feed = Feeds::get( (int) $req['id'] );
		if ( ! $feed ) {
			return $this->not_found();
		}
		$action = $this->plugin->action( $feed['action'] );
		if ( ! $action ) {
			return $this->not_found();
		}

		$sample      = array();
		$integration = $this->plugin->integration( $feed['source'] );
		if ( $integration && $integration->is_active() ) {
			foreach ( $integration->fields( $feed['form_id'] ) as $field ) {
				$type = isset( $field['type'] ) ? $field['type'] : '';
				if ( 'email' === $type ) {
					$sample[ $field['key'] ] = 'test@example.com';
				} else {
					/* translators: %s: field label */
					$sample[ $field['key'] ] = sprintf( __( 'Test %s', 'quicksheet' ), $field['label'] );
				}
			}
		}

		$recipient = (string) $req['recipient'];
		if ( 'whatsapp' === $feed['action'] && '' !== $recipient ) {
			$feed['settings']['recipient'] = $recipient;
		}

		$tags    = $this->plugin->dispatcher->build_tags(
			$sample,
			array(
				'form_id'    => $feed['form_id'],
				'form_title' => $feed['form_title'],
				'entry_id'   => 'TEST',
				'page_url'   => home_url( '/' ),
			)
		);
		$payload = $action->build_payload( $feed, $tags );
		if ( ! $payload ) {
			return new WP_Error( 'qswp_empty', __( 'Nothing to send – check the mapping or message.', 'quicksheet' ), array( 'status' => 400 ) );
		}
		$res = $this->plugin->dispatcher->send( $feed, $payload );
		return is_wp_error( $res ) ? $this->err( $res ) : rest_ensure_response( $res );
	}

	/**
	 * Logs.
	 *
	 * @param WP_REST_Request $req Request.
	 * @return \WP_REST_Response
	 */
	public function get_logs( WP_REST_Request $req ) {
		return rest_ensure_response(
			Logger::query(
				array(
					'page'     => (int) $req['page'],
					'per_page' => (int) $req['per_page'],
					'status'   => (string) $req['status'],
					'feed_id'  => (int) $req['feed_id'],
				)
			)
		);
	}

	/**
	 * Clear logs.
	 *
	 * @param WP_REST_Request $req Request.
	 * @return \WP_REST_Response
	 */
	public function clear_logs( WP_REST_Request $req ) {
		Logger::clear( (string) $req['status'] );
		return rest_ensure_response( array( 'cleared' => true ) );
	}

	/**
	 * Delete one log.
	 *
	 * @param WP_REST_Request $req Request.
	 * @return \WP_REST_Response
	 */
	public function delete_log( WP_REST_Request $req ) {
		return rest_ensure_response( array( 'deleted' => Logger::delete( (int) $req['id'] ) ) );
	}

	/**
	 * Retry one log.
	 *
	 * @param WP_REST_Request $req Request.
	 * @return \WP_REST_Response|WP_Error
	 */
	public function retry_log( WP_REST_Request $req ) {
		$res = $this->plugin->dispatcher->retry( (int) $req['id'] );
		if ( is_wp_error( $res ) ) {
			return $this->err( $res );
		}
		return rest_ensure_response( Logger::get( (int) $req['id'] ) );
	}

	/**
	 * Retry all failed/pending entries (max 100 each per call).
	 *
	 * @return \WP_REST_Response
	 */
	public function retry_all_failed() {
		$ok   = 0;
		$fail = 0;
		foreach ( array( Logger::FAILED, Logger::PENDING ) as $status ) {
			$page = Logger::query(
				array(
					'status'   => $status,
					'per_page' => 100,
				)
			);
			foreach ( $page['items'] as $log ) {
				if ( is_wp_error( $this->plugin->dispatcher->retry( $log['id'] ) ) ) {
					++$fail;
				} else {
					++$ok;
				}
			}
		}
		return rest_ensure_response(
			array(
				'success' => $ok,
				'failed'  => $fail,
			)
		);
	}

	/**
	 * Dashboard data.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_dashboard() {
		$feeds  = Feeds::all();
		$active = count(
			array_filter(
				$feeds,
				static function ( $f ) {
					return $f['status'];
				}
			)
		);
		$apps   = array();
		foreach ( $this->plugin->actions() as $action ) {
			$apps[] = array(
				'slug'      => $action->slug(),
				'label'     => $action->label(),
				'connected' => $action->is_connected(),
			);
		}
		$recent = Logger::query( array( 'per_page' => 5 ) );
		return rest_ensure_response(
			array(
				'feeds'        => count( $feeds ),
				'active_feeds' => $active,
				'stats'        => Logger::stats(),
				'google'       => $this->plugin->google->status(),
				'sources'      => $this->get_sources()->get_data(),
				'apps'         => $apps,
				'recent'       => $recent['items'],
			)
		);
	}
}
