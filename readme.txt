=== WP PDF Embed ===
Contributors: wp-pdf-embed-contributors
Tags: pdf, embed, document, viewer, block
Requires at least: 5.8
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 1.0.1
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Embed PDFs from the Media Library with a Gutenberg block or classic-editor shortcode. No external service is required.

== Description ==

WP PDF Embed renders local Media Library PDFs in a responsive, self-hosted PDF.js viewer. It includes the quality-of-life features normally associated with paid PDF viewers.

Features:

* PDF Embed block for the block editor.
* "Add PDF Embed" button for the classic editor.
* `[wp_pdf_embed]` shortcode.
* Responsive page rendering with zoom and navigation.
* Continuous page scrolling and direct page-number navigation.
* Text search with highlighted matches.
* Working internal PDF links and configurable external links.
* Optional toolbar and download button.
* Optional view and download counts shown in Media Library details.
* Full-screen viewing and configurable mobile behavior.
* Elementor widget when Elementor is active.
* Native Avada Builder design element when Avada Builder is active.
* Password-protected PDF support.
* No CDN, account, tracking, or subscription.

== Installation ==

1. Copy the `wp-pdf-embed` directory to `/wp-content/plugins/`.
2. Activate "WP PDF Embed" in the Plugins screen.
3. Add a "PDF Embed" block, or click "Add PDF Embed" above the classic editor.

== Shortcode ==

Embed a Media Library PDF:

`[wp_pdf_embed id="123"]`

Configure a Media Library PDF with options:

`[wp_pdf_embed id="123" width="100%" height="700" page="1" toolbar="true" download="true" continuous="true" search="true" newwindow="true" track="false"]`

Supported attributes are `id`, `title`, `width`, `height`, `page`, `toolbar`, `download`, `continuous`, `search`, `newwindow`, `track`, `mobilewidth`, `mobiletext`, and `disablezoom`. A legacy `url` attribute remains available for compatibility, but Media Library attachment IDs are recommended.

== Frequently Asked Questions ==

= Does this send PDFs to another service? =

No. The included PDF.js library renders the file in the visitor's browser.

= Why does a PDF hosted on another domain fail to load? =

Browsers require the remote server to allow your site's origin with CORS headers. Upload the PDF to the WordPress Media Library if you do not control the remote server.

== Changelog ==

= 1.0.1 =

* Add repeatable release packaging and version-bump tools.
* Add an end-user guide for site editors and content managers.

= 1.0.0 =

* Initial release.
