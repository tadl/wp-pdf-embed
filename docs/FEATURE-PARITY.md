# PDF Embedder Basic feature parity

This project targets the viewer features advertised for the PDF Embedder Basic plan as of August 17, 2026. It is an independent implementation and does not reuse that plugin's code.

| Basic feature | WP PDF Embed implementation |
| --- | --- |
| Unlimited embeds | No embed or site limits |
| Continuous page scrolling | On by default; configurable per block, shortcode, or Elementor widget |
| Jump to page | Toolbar page-number field plus previous/next buttons |
| Internal PDF links | PDF.js annotation destinations navigate within the embedded viewer |
| External links | PDF annotations support safe HTTP(S), email, and telephone links; new-tab behavior is configurable |
| Elementor widget | Registered automatically when Elementor is active |
| Text search | Optional search toolbar with next/previous results and visual highlighting |
| View/download counts | Opt-in per embed; totals appear in Media Library attachment details |
| Mobile customizations | Configurable full-screen threshold and button text, plus optional pinch-zoom suppression inside the viewer |

The plugin is designed around PDFs uploaded to the WordPress Media Library. A legacy `url` shortcode attribute remains for compatibility, but the block, classic-editor button, and Elementor widget all select local Media Library files.

Not included because they belong to higher advertised tiers: secure storage/access controls, watermark management, automatic thumbnails, and configurable annotation visibility.
