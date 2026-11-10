<?php
/**
 * Plugin Name:       QuickSheet – Send Form Submissions to Google Sheets & Apps
 * Description:       Connect Contact Form 7, WPForms and Elementor Forms to Google Sheets, WhatsApp, Discord and Facebook Pages. Map fields, add conditions and track every submission.
 * Version:           1.0.0
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * Author:            WPBrand Digital
 * Author URI:        https://wpbranddigital.org
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       quicksheet
 * Domain Path:       /languages
 *
 * @package QuickSheetWP
 */

defined('ABSPATH') || exit;

define('QSWP_VERSION', '1.0.0');
define('QSWP_DB_VERSION', '1.0.0');
define('QSWP_FILE', __FILE__);
define('QSWP_PATH', plugin_dir_path(__FILE__));
define('QSWP_URL', plugin_dir_url(__FILE__));
define('QSWP_SLUG', 'quicksheet');

/**
 * Autoloader for the QuickSheetWP namespace.
 * QuickSheetWP\Actions\Google_Sheets -> includes/actions/class-google-sheets.php
 */
spl_autoload_register(
	static function ($class_name) {
		$prefix = 'QuickSheetWP\\';
		if (0 !== strpos($class_name, $prefix)) {
			return;
		}
		$parts = explode('\\', substr($class_name, strlen($prefix)));
		$name = array_pop($parts);
		$file = 'class-' . strtolower(str_replace('_', '-', $name)) . '.php';
		$dir = $parts ? strtolower(implode('/', $parts)) . '/' : '';
		$path = QSWP_PATH . 'includes/' . $dir . $file;
		if (is_readable($path)) {
			require_once $path;
		}
	}
);

register_activation_hook(__FILE__, array('QuickSheetWP\\Installer', 'activate'));
register_deactivation_hook(__FILE__, array('QuickSheetWP\\Installer', 'deactivate'));

add_action(
	'plugins_loaded',
	static function () {
		QuickSheetWP\Plugin::instance();
	}
);
