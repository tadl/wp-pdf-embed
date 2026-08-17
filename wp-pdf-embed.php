<?php
/**
 * Plugin Name:       WP PDF Embed
 * Description:       Embed self-hosted PDF documents with a Gutenberg block or the [wp_pdf_embed] shortcode.
 * Version:           1.0.2
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            WP PDF Embed Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       wp-pdf-embed
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'WP_PDF_EMBED_VERSION', '1.0.2' );
define( 'WP_PDF_EMBED_FILE', __FILE__ );
define( 'WP_PDF_EMBED_DIR', plugin_dir_path( __FILE__ ) );
define( 'WP_PDF_EMBED_URL', plugin_dir_url( __FILE__ ) );

require_once WP_PDF_EMBED_DIR . 'includes/class-wp-pdf-embed.php';
require_once WP_PDF_EMBED_DIR . 'includes/class-wp-pdf-embed-avada.php';

WP_PDF_Embed::instance();
WP_PDF_Embed_Avada::instance();
