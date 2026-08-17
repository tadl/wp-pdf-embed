# WP PDF Embed

A self-contained WordPress plugin for embedding local Media Library PDFs with a Gutenberg block, classic-editor media button, Elementor widget, or the `[wp_pdf_embed]` shortcode. PDFs are rendered in the browser with a vendored copy of Mozilla PDF.js; there is no hosted service or subscription.

The viewer includes continuous scrolling, jump-to-page navigation, text search and highlighting, internal and external PDF links, full-screen/mobile behavior, optional downloads, and opt-in view/download counts.

See [`docs/USER-GUIDE.md`](docs/USER-GUIDE.md) for instructions written for site editors and content managers.

## Shortcode

```text
[wp_pdf_embed id="123" width="100%" height="700" page="1" toolbar="true" download="true" continuous="true" search="true" newwindow="true" track="false"]
```

Additional mobile attributes are `mobilewidth`, `mobiletext`, and `disablezoom`. Tracking is deliberately opt-in; counts appear in the PDF attachment details in the Media Library.

## Development

There is no JavaScript build step. Install this directory directly as a plugin, or create a clean release ZIP in `dist/`:

```sh
./scripts/build-release.sh
```

The release contains the plugin runtime files, `README.md`, and WordPress `readme.txt`. Development scripts, tests, and the `docs/` directory are excluded.

Update all plugin version fields before building a new release:

```sh
./scripts/bump-version.sh 1.0.1
./scripts/build-release.sh
```

Add the release notes to the changelog in `readme.txt` before committing the version bump.

Run basic syntax checks:

```sh
find . -name '*.php' -not -path './node_modules/*' -exec php -l {} \;
node --check assets/js/viewer.js
node --check assets/js/classic-editor.js
node --check block/editor.js
```

For an interactive viewer check, serve the repository over HTTP and open `tests/manual-viewer.html`. The harness uses Mozilla's public PDF.js sample document.

PDF.js 3.11.174 is distributed under the Apache License 2.0. Its license is included at `assets/vendor/LICENSE`.
