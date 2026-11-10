<?php
/**
 * Main plugin bootstrap.
 *
 * @package QuickSheetWP
 */

namespace QuickSheetWP;

defined( 'ABSPATH' ) || exit;

/**
 * Service container / bootstrap.
 */
final class Plugin {

	/**
	 * Singleton.
	 *
	 * @var Plugin|null
	 */
	private static $instance = null;

	/**
	 * Triggers (form plugins).
	 *
	 * @var Integrations\Integration[]
	 */
	private $integrations = array();

	/**
	 * Actions (destination apps).
	 *
	 * @var Actions\Action[]
	 */
	private $actions = array();

	/**
	 * Google client.
	 *
	 * @var Google_Client
	 */
	public $google;

	/**
	 * Dispatcher.
	 *
	 * @var Dispatcher
	 */
	public $dispatcher;

	/**
	 * Get the instance.
	 *
	 * @return Plugin
	 */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Boot.
	 */
	private function __construct() {
		Installer::maybe_upgrade();

		$this->google     = new Google_Client();
		$this->dispatcher = new Dispatcher( $this );

		$this->register_actions();
		$this->register_integrations();

		( new Rest_Api( $this ) )->register();
		( new OAuth_Handler( $this->google ) )->register();

		if ( is_admin() ) {
			( new Admin() )->register();
		}

		add_action( 'qswp_retry_log', array( $this->dispatcher, 'retry' ) );
		add_action( 'qswp_cleanup_logs', array( Logger::class, 'cleanup' ) );
	}

	/**
	 * Register destination apps.
	 */
	private function register_actions() {
		$classes = apply_filters(
			'qswp_actions',
			array(
				Actions\Google_Sheets::class,
				Actions\Whatsapp::class,
				Actions\Discord::class,
				Actions\Facebook_Page::class,
			)
		);
		foreach ( $classes as $class_name ) {
			if ( class_exists( $class_name ) ) {
				$action                           = new $class_name( $this );
				$this->actions[ $action->slug() ] = $action;
			}
		}
	}

	/**
	 * Register form-plugin triggers.
	 */
	private function register_integrations() {
		$classes = apply_filters(
			'qswp_integrations',
			array(
				Integrations\Contact_Form_7::class,
				Integrations\Wpforms::class,
				Integrations\Elementor_Forms::class,
			)
		);

		foreach ( $classes as $class_name ) {
			if ( ! class_exists( $class_name ) ) {
				continue;
			}
			$integration                                = new $class_name( $this->dispatcher );
			$this->integrations[ $integration->slug() ] = $integration;
			add_action( 'init', array( $integration, 'maybe_boot' ), 20 );
		}
	}

	/**
	 * All triggers.
	 *
	 * @return Integrations\Integration[]
	 */
	public function integrations() {
		return $this->integrations;
	}

	/**
	 * One trigger.
	 *
	 * @param string $slug Slug.
	 * @return Integrations\Integration|null
	 */
	public function integration( $slug ) {
		return isset( $this->integrations[ $slug ] ) ? $this->integrations[ $slug ] : null;
	}

	/**
	 * All actions.
	 *
	 * @return Actions\Action[]
	 */
	public function actions() {
		return $this->actions;
	}

	/**
	 * One action.
	 *
	 * @param string $slug Slug.
	 * @return Actions\Action|null
	 */
	public function action( $slug ) {
		return isset( $this->actions[ $slug ] ) ? $this->actions[ $slug ] : null;
	}
}
