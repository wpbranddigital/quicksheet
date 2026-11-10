<?php
/**
 * Google OAuth 2.0 + Sheets / Drive API client built on the WP HTTP API.
 *
 * @package QuickSheetWP
 */

namespace QuickSheetWP;

use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Google Client.
 */
class Google_Client {

	const OPTION       = 'qswp_google';
	const AUTH_URL     = 'https://accounts.google.com/o/oauth2/v2/auth';
	const TOKEN_URL    = 'https://oauth2.googleapis.com/token';
	const REVOKE_URL   = 'https://oauth2.googleapis.com/revoke';
	const USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';
	const SHEETS_API   = 'https://sheets.googleapis.com/v4/spreadsheets';
	const DRIVE_API    = 'https://www.googleapis.com/drive/v3/files';
	const SCOPES       = 'openid email https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.metadata.readonly';

	// ---- Settings ----

	private function settings() {
		$defaults = array(
			'client_id'     => '',
			'client_secret' => '',
			'access_token'  => '',
			'refresh_token' => '',
			'expires_at'    => 0,
			'email'         => '',
			'connected_at'  => '',
			'last_error'    => '',
		);
		return wp_parse_args( (array) get_option( self::OPTION, array() ), $defaults );
	}

	/**
	 * Merge changes into stored settings.
	 */
	private function update( array $changes ) {
		$settings = array_merge( $this->settings(), $changes );
		update_option( self::OPTION, $settings, false );
	}

	/**
	 * OAuth client ID.
	 */
	public function client_id() {
		return $this->settings()['client_id'];
	}

	/**
	 * Decrypted client secret.
	 */
	private function client_secret() {
		return Crypto::decrypt( $this->settings()['client_secret'] );
	}

	/**
	 * Save OAuth client credentials.
	 */
	public function save_credentials( $client_id, $client_secret = null ) {
		$changes = array( 'client_id' => trim( $client_id ) );
		if ( null !== $client_secret && '' !== $client_secret ) {
			$changes['client_secret'] = Crypto::encrypt( trim( $client_secret ) );
		}
		// Changing the OAuth app invalidates existing tokens.
		if ( $changes['client_id'] !== $this->client_id() ) {
			$changes = array_merge( $changes, $this->empty_tokens() );
		}
		$this->update( $changes );
	}

	/**
	 * Client ID and secret saved?
	 */
	public function is_configured() {
		return '' !== $this->client_id() && '' !== $this->client_secret();
	}

	/**
	 * Refresh token present?
	 */
	public function is_connected() {
		return '' !== $this->settings()['refresh_token'];
	}

	/**
	 * Public connection status.
	 */
	public function status() {
		$s = $this->settings();
		return array(
			'configured'   => $this->is_configured(),
			'connected'    => $this->is_connected(),
			'email'        => $s['email'],
			'connected_at' => $s['connected_at'],
			'client_id'    => $s['client_id'],
			'has_secret'   => '' !== $s['client_secret'],
			'redirect_uri' => $this->redirect_uri(),
			'last_error'   => $s['last_error'],
		);
	}

	/**
	 * OAuth redirect URI.
	 */
	public function redirect_uri() {
		return admin_url( 'admin-post.php?action=qswp_oauth_callback' );
	}

	/**
	 * Token fields reset.
	 */
	private function empty_tokens() {
		return array(
			'access_token'  => '',
			'refresh_token' => '',
			'expires_at'    => 0,
			'email'         => '',
			'connected_at'  => '',
		);
	}

	// ---- OAuth ----

	public function auth_url( $state ) {
		return add_query_arg(
			array(
				'client_id'              => rawurlencode( $this->client_id() ),
				'redirect_uri'           => rawurlencode( $this->redirect_uri() ),
				'response_type'          => 'code',
				'scope'                  => rawurlencode( self::SCOPES ),
				'access_type'            => 'offline',
				'prompt'                 => 'consent',
				'include_granted_scopes' => 'true',
				'state'                  => rawurlencode( $state ),
			),
			self::AUTH_URL
		);
	}

	/**
	 * @return true|WP_Error
	 */
	public function exchange_code( $code ) {
		$response = wp_remote_post(
			self::TOKEN_URL,
			array(
				'timeout' => 20,
				'body'    => array(
					'code'          => $code,
					'client_id'     => $this->client_id(),
					'client_secret' => $this->client_secret(),
					'redirect_uri'  => $this->redirect_uri(),
					'grant_type'    => 'authorization_code',
				),
			)
		);

		$data = $this->parse_token_response( $response );
		if ( is_wp_error( $data ) ) {
			return $data;
		}
		if ( empty( $data['refresh_token'] ) ) {
			return new WP_Error( 'qswp_no_refresh', __( 'Google did not return a refresh token. Remove the app from your Google account permissions and try again.', 'quicksheet' ) );
		}

		$this->update(
			array(
				'access_token'  => Crypto::encrypt( $data['access_token'] ),
				'refresh_token' => Crypto::encrypt( $data['refresh_token'] ),
				'expires_at'    => time() + (int) $data['expires_in'],
				'email'         => $this->fetch_email( $data['access_token'] ),
				'connected_at'  => current_time( 'mysql' ),
				'last_error'    => '',
			)
		);
		return true;
	}

	/**
	 * Parse a token endpoint response.
	 */
	private function parse_token_response( $response ) {
		if ( is_wp_error( $response ) ) {
			return $response;
		}
		$data = json_decode( wp_remote_retrieve_body( $response ), true );
		if ( 200 !== wp_remote_retrieve_response_code( $response ) || empty( $data['access_token'] ) ) {
			$msg = isset( $data['error_description'] ) ? $data['error_description'] : ( isset( $data['error'] ) ? $data['error'] : __( 'Unknown token error.', 'quicksheet' ) );
			return new WP_Error( 'qswp_token', $msg, array( 'error' => isset( $data['error'] ) ? $data['error'] : '' ) );
		}
		return $data;
	}

	/**
	 * Email of the connected account.
	 */
	private function fetch_email( $access_token ) {
		$response = wp_remote_get(
			self::USERINFO_URL,
			array(
				'timeout' => 10,
				'headers' => array( 'Authorization' => 'Bearer ' . $access_token ),
			)
		);
		if ( is_wp_error( $response ) ) {
			return '';
		}
		$data = json_decode( wp_remote_retrieve_body( $response ), true );
		return isset( $data['email'] ) ? sanitize_email( $data['email'] ) : '';
	}

	/**
	 * Returns a valid access token, refreshing it when needed.
	 *
	 * @return string|WP_Error
	 */
	public function access_token() {
		$s = $this->settings();
		if ( '' === $s['refresh_token'] ) {
			return new WP_Error( 'qswp_not_connected', __( 'Google account is not connected.', 'quicksheet' ) );
		}
		if ( $s['access_token'] && (int) $s['expires_at'] > time() + 60 ) {
			return Crypto::decrypt( $s['access_token'] );
		}

		$response = wp_remote_post(
			self::TOKEN_URL,
			array(
				'timeout' => 20,
				'body'    => array(
					'client_id'     => $this->client_id(),
					'client_secret' => $this->client_secret(),
					'refresh_token' => Crypto::decrypt( $s['refresh_token'] ),
					'grant_type'    => 'refresh_token',
				),
			)
		);
		$data     = $this->parse_token_response( $response );

		if ( is_wp_error( $data ) ) {
			$err = $data->get_error_data();
			if ( isset( $err['error'] ) && 'invalid_grant' === $err['error'] ) {
				// Token revoked or expired: force reconnect.
				$this->update( array_merge( $this->empty_tokens(), array( 'last_error' => __( 'Google access was revoked or expired. Please reconnect.', 'quicksheet' ) ) ) );
			}
			return $data;
		}

		$this->update(
			array(
				'access_token' => Crypto::encrypt( $data['access_token'] ),
				'expires_at'   => time() + (int) $data['expires_in'],
				'last_error'   => '',
			)
		);
		return $data['access_token'];
	}

	/**
	 * Revoke and forget tokens.
	 */
	public function disconnect() {
		$s = $this->settings();
		if ( $s['refresh_token'] ) {
			wp_remote_post(
				self::REVOKE_URL,
				array(
					'timeout'  => 10,
					'blocking' => false,
					'body'     => array( 'token' => Crypto::decrypt( $s['refresh_token'] ) ),
				)
			);
		}
		$this->update( array_merge( $this->empty_tokens(), array( 'last_error' => '' ) ) );
	}

	// ---- HTTP ----

	/**
	 * Authorized JSON request to a Google API.
	 *
	 * @param string     $method HTTP method.
	 * @param string     $url    URL.
	 * @param array|null $body   JSON body.
	 * @param bool       $retry  Internal: refresh the token once on HTTP 401.
	 * @return array|WP_Error Decoded JSON.
	 */
	public function request( $method, $url, $body = null, $retry = true ) {
		$token = $this->access_token();
		if ( is_wp_error( $token ) ) {
			return $token;
		}

		$args = array(
			'method'  => $method,
			'timeout' => (int) apply_filters( 'qswp_http_timeout', 15 ),
			'headers' => array(
				'Authorization' => 'Bearer ' . $token,
				'Accept'        => 'application/json',
			),
		);
		if ( null !== $body ) {
			$args['headers']['Content-Type'] = 'application/json';
			$args['body']                    = wp_json_encode( $body );
		}

		$response = wp_remote_request( $url, $args );
		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$code = (int) wp_remote_retrieve_response_code( $response );
		$data = json_decode( wp_remote_retrieve_body( $response ), true );

		// The cached access token was revoked before it expired: refresh once and try again.
		if ( 401 === $code && $retry ) {
			$this->update( array( 'expires_at' => 0 ) );
			return $this->request( $method, $url, $body, false );
		}

		if ( $code < 200 || $code >= 300 ) {
			$message = isset( $data['error']['message'] ) ? $data['error']['message'] : sprintf( 'HTTP %d', $code );
			// Keep Google's code separate: forwarding 401/403 as REST status would confuse the admin app.
			return new WP_Error( 'qswp_google_api', $message, array( 'google_status' => $code ) );
		}
		return is_array( $data ) ? $data : array();
	}

	// ---- Sheets / Drive helpers ----

	public static function parse_spreadsheet_id( $value ) {
		$value = trim( (string) $value );
		if ( preg_match( '#/spreadsheets/d/([a-zA-Z0-9-_]+)#', $value, $m ) ) {
			return $m[1];
		}
		return preg_match( '#^[a-zA-Z0-9-_]{20,}$#', $value ) ? $value : '';
	}

	/**
	 * Quote a sheet name for A1 notation.
	 */
	public static function a1( $sheet, $range = '' ) {
		$quoted = "'" . str_replace( "'", "''", $sheet ) . "'";
		return $range ? $quoted . '!' . $range : $quoted;
	}

	/** @return array|WP_Error */
	public function list_spreadsheets( $search = '' ) {
		$q = "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false";
		if ( '' !== $search ) {
			$q .= " and name contains '" . str_replace( array( '\\', "'" ), array( '\\\\', "\\'" ), $search ) . "'";
		}
		$url  = add_query_arg(
			array(
				'q'                         => rawurlencode( $q ),
				'orderBy'                   => 'modifiedTime desc',
				'pageSize'                  => 100,
				'fields'                    => rawurlencode( 'files(id,name,modifiedTime)' ),
				'supportsAllDrives'         => 'true',
				'includeItemsFromAllDrives' => 'true',
			),
			self::DRIVE_API
		);
		$data = $this->request( 'GET', $url );
		if ( is_wp_error( $data ) ) {
			return $data;
		}
		return array_map(
			static function ( $f ) {
				return array(
					'id'       => $f['id'],
					'name'     => $f['name'],
					'modified' => isset( $f['modifiedTime'] ) ? $f['modifiedTime'] : '',
				);
			},
			isset( $data['files'] ) ? $data['files'] : array()
		);
	}

	/** @return array|WP_Error { title, sheets: [ {id,title} ] } */
	public function get_spreadsheet( $spreadsheet_id ) {
		$url  = self::SHEETS_API . '/' . rawurlencode( $spreadsheet_id ) . '?fields=' . rawurlencode( 'properties.title,sheets.properties(sheetId,title)' );
		$data = $this->request( 'GET', $url );
		if ( is_wp_error( $data ) ) {
			return $data;
		}
		$sheets = array();
		foreach ( isset( $data['sheets'] ) ? $data['sheets'] : array() as $sheet ) {
			$sheets[] = array(
				'id'    => $sheet['properties']['sheetId'],
				'title' => $sheet['properties']['title'],
			);
		}
		return array(
			'title'  => isset( $data['properties']['title'] ) ? $data['properties']['title'] : '',
			'sheets' => $sheets,
		);
	}

	/** @return array|WP_Error Header row values. */
	public function get_headers( $spreadsheet_id, $sheet ) {
		$url  = self::SHEETS_API . '/' . rawurlencode( $spreadsheet_id ) . '/values/' . rawurlencode( self::a1( $sheet, '1:1' ) );
		$data = $this->request( 'GET', $url );
		if ( is_wp_error( $data ) ) {
			return $data;
		}
		return isset( $data['values'][0] ) ? array_map( 'strval', $data['values'][0] ) : array();
	}

	/** @return true|WP_Error */
	public function set_headers( $spreadsheet_id, $sheet, array $headers ) {
		$url  = self::SHEETS_API . '/' . rawurlencode( $spreadsheet_id ) . '/values/' . rawurlencode( self::a1( $sheet, 'A1' ) ) . '?valueInputOption=RAW';
		$data = $this->request(
			'PUT',
			$url,
			array(
				'range'          => self::a1( $sheet, 'A1' ),
				'majorDimension' => 'ROWS',
				'values'         => array( array_values( $headers ) ),
			)
		);
		return is_wp_error( $data ) ? $data : true;
	}

	/**
	 * Append a row after the last row of the table that starts at A1.
	 *
	 * @return array|WP_Error { range }
	 */
	public function append_row( $spreadsheet_id, $sheet, array $values ) {
		$url  = self::SHEETS_API . '/' . rawurlencode( $spreadsheet_id ) . '/values/' . rawurlencode( self::a1( $sheet, 'A1' ) ) . ':append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS';
		$data = $this->request(
			'POST',
			$url,
			array(
				'majorDimension' => 'ROWS',
				'values'         => array( array_values( $values ) ),
			)
		);
		if ( is_wp_error( $data ) ) {
			return $data;
		}
		return array( 'range' => isset( $data['updates']['updatedRange'] ) ? $data['updates']['updatedRange'] : '' );
	}

	/** @return array|WP_Error { id, title } */
	public function create_spreadsheet( $title, $sheet_title = 'Sheet1' ) {
		$data = $this->request(
			'POST',
			self::SHEETS_API,
			array(
				'properties' => array( 'title' => $title ),
				'sheets'     => array( array( 'properties' => array( 'title' => $sheet_title ) ) ),
			)
		);
		if ( is_wp_error( $data ) ) {
			return $data;
		}
		return array(
			'id'   => $data['spreadsheetId'],
			'name' => $data['properties']['title'],
		);
	}
}
