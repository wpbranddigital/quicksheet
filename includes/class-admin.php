<?php
/**
 * Admin menu + React app bootstrap.
 *
 * @package QuickSheetWP
 */

namespace QuickSheetWP;

defined( 'ABSPATH' ) || exit;

/**
 * Admin screens.
 */
class Admin {

	/**
	 * Page hook suffix.
	 *
	 * @var string
	 */
	private $hook = '';

	/**
	 * Hooks.
	 */
	public function register() {
		add_action( 'admin_menu', array( $this, 'menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'assets' ) );
		add_filter( 'plugin_action_links_' . plugin_basename( QSWP_FILE ), array( $this, 'action_links' ) );
	}

	/**
	 * Register menu + hash-routed submenus.
	 */
	public function menu() {
		$this->hook = add_menu_page(
			__( 'QuickSheet', 'quicksheet' ),
			__( 'QuickSheet', 'quicksheet' ),
			'manage_options',
			QSWP_SLUG,
			array( $this, 'render' ),
			'dashicons-media-spreadsheet',
			58
		);

		$subs  = array(
			''              => __( 'Dashboard', 'quicksheet' ),
			'/integrations' => __( 'Integrations', 'quicksheet' ),
			'/apps'         => __( 'Apps', 'quicksheet' ),
			'/logs'         => __( 'Logs', 'quicksheet' ),
			'/settings'     => __( 'Settings', 'quicksheet' ),
		);
		$first = true;
		foreach ( $subs as $route => $label ) {
			add_submenu_page(
				QSWP_SLUG,
				$label,
				$label,
				'manage_options',
				$first ? QSWP_SLUG : QSWP_SLUG . '#' . $route,
				$first ? array( $this, 'render' ) : '__return_null'
			);
			$first = false;
		}
	}

	/**
	 * Plugins screen link.
	 *
	 * @param string[] $links Links.
	 * @return string[]
	 */
	public function action_links( $links ) {
		array_unshift(
			$links,
			sprintf( '<a href="%s">%s</a>', esc_url( admin_url( 'admin.php?page=' . QSWP_SLUG ) ), esc_html__( 'Dashboard', 'quicksheet' ) )
		);
		return $links;
	}

	/**
	 * Enqueue the admin app on our screen only.
	 *
	 * @param string $hook Hook suffix.
	 */
	public function assets( $hook ) {
		if ( $hook !== $this->hook ) {
			return;
		}

		$asset_file = QSWP_PATH . 'build/admin.asset.php';
		$asset      = file_exists( $asset_file ) ? require $asset_file : array(
			'dependencies' => array(),
			'version'      => QSWP_VERSION,
		);

		wp_enqueue_style( 'wp-components' );
		wp_enqueue_style( 'qswp-admin', QSWP_URL . 'build/admin.css', array( 'wp-components' ), $asset['version'] );
		wp_enqueue_script(
			'qswp-admin',
			QSWP_URL . 'build/admin.js',
			array_unique( array_merge( array( 'wp-element', 'wp-components', 'wp-api-fetch', 'wp-i18n' ), $asset['dependencies'] ) ),
			$asset['version'],
			true
		);
		wp_set_script_translations( 'qswp-admin', 'quicksheet', QSWP_PATH . 'languages' );

		wp_localize_script(
			'qswp-admin',
			'QSWP',
			array(
				'version'   => QSWP_VERSION,
				'adminUrl'  => admin_url(),
				'pageUrl'   => admin_url( 'admin.php?page=' . QSWP_SLUG ),
				'notice'    => OAuth_Handler::pop_notice(),
				'serverNow' => current_time( 'mysql' ),
			)
		);
	}

	/**
	 * App mount point.
	 */
	public function render() {
		echo '<div class="wrap qswp-wrap"><div id="qswp-app"><div class="qswp-boot">' . esc_html__( 'Loading QuickSheet…', 'quicksheet' ) . '</div></div></div>';
	}
}
