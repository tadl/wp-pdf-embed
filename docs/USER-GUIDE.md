# WP PDF Embed user guide

WP PDF Embed lets you display PDF documents directly on a WordPress page or post. Visitors can read the document without leaving the page, move between pages, zoom, search, follow links, open the viewer full screen, or download the original PDF when downloads are enabled.

## Before you begin

Upload the PDF to the WordPress Media Library. The plugin is designed primarily for PDFs stored on your WordPress site.

To upload a PDF in advance:

1. Open **Media → Add New Media File** in the WordPress dashboard.
2. Upload the PDF.
3. Give the file a clear title. The title may be used to identify the document in the editor and to label the viewer for assistive technology.

You can also upload a PDF while adding it to a page.

## Block editor

1. Edit the page or post where the PDF should appear.
2. Select the **+** block inserter.
3. Search for **PDF Embed** and add the block.
4. Select **Select PDF**.
5. Choose an existing PDF from the Media Library, or upload a new one.
6. Select **Select** to insert it.

The editor displays a preview of the document. Use the block settings in the right sidebar to change its dimensions and viewer behavior.

### PDF settings

- **Document title** changes the accessible name used for the viewer.
- **Width** accepts values such as `100%`, `800px`, or `60vw`. `100%` is a good default for responsive pages.
- **Height** controls the height of the embedded viewer.
- **Initial page** determines which page is shown when the document opens.
- **Show toolbar** displays or hides the viewer controls.
- **Allow download** displays or hides the download button.
- **Continuous page scrolling** lets readers scroll directly from one page to the next. When disabled, the viewer displays one page at a time.
- **Enable text search** adds document search to the toolbar.
- **Open external links in a new tab** controls links in the PDF that lead to other websites. Links to another location in the same PDF continue to open inside the viewer.
- **Track views and downloads** records activity for this PDF in the Media Library.

### Mobile settings

- **Full-screen prompt threshold** shows a full-screen prompt when the viewer is narrower than the selected width. Set it to `0` to disable the prompt.
- **Full-screen button text** changes the text shown in that prompt.
- **Disable pinch zoom inside viewer** prevents browser-level pinch zoom while a visitor is interacting with the document. The viewer's own zoom controls remain available.

To replace or remove the selected PDF, use the buttons below its preview.

## Classic editor

1. Place the cursor where the PDF should appear.
2. Select **Add PDF Embed** above the editor.
3. Choose or upload a PDF in the Media Library.
4. Select **Embed PDF**.

WordPress inserts a shortcode similar to:

```text
[wp_pdf_embed id="123"]
```

The number is the Media Library attachment ID. Leave it unchanged unless you intend to select a different file.

You can add options to the shortcode when a document needs different viewer settings:

```text
[wp_pdf_embed id="123" height="800" page="2" continuous="true" search="true" download="false"]
```

Available options include:

| Option | Purpose | Typical value |
| --- | --- | --- |
| `width` | Viewer width | `100%` |
| `height` | Viewer height in pixels | `700` |
| `page` | Initial page | `1` |
| `toolbar` | Show the toolbar | `true` or `false` |
| `download` | Show the download button | `true` or `false` |
| `continuous` | Enable continuous scrolling | `true` or `false` |
| `search` | Enable document search | `true` or `false` |
| `newwindow` | Open external PDF links in a new tab | `true` or `false` |
| `track` | Count views and downloads | `true` or `false` |
| `mobilewidth` | Full-screen prompt threshold | `500` or `0` |
| `mobiletext` | Full-screen prompt text | `View PDF full screen` |
| `disablezoom` | Disable browser pinch zoom inside the viewer | `true` or `false` |

## Elementor

When Elementor is active, the plugin provides a **PDF Embed** widget.

1. Edit the page with Elementor.
2. Search the widget panel for **PDF Embed**.
3. Drag the widget onto the page.
4. Choose a PDF from the Media Library.
5. Configure the height, initial page, scrolling, search, download, and tracking options in the widget settings.

## Avada Builder

When Avada Builder is active, the plugin provides a native **PDF Embed** design element.

1. Edit the page with Avada Builder or Avada Live.
2. Add a Container and Column if the page does not already have one.
3. Select **Add Element** inside the column.
4. Search for **PDF Embed** and select it.
5. Choose or upload a PDF in the element's **Document** settings.
6. Configure its layout, viewer controls, activity tracking, and mobile behavior in the other settings tabs.

If the element is not listed after updating the plugin, reload the builder. Also check **Avada → Options → Builder Options → Avada Builder Elements** to make sure PDF Embed has not been disabled for the current user role.

## Viewer controls

The toolbar can include the following controls:

- Previous and next page buttons
- A page-number field for jumping directly to a page
- Zoom out and zoom in
- Document search
- Full-screen viewing
- Download
- Open the original PDF in a new tab

With continuous scrolling enabled, the page-number field updates as the reader moves through the document.

### Searching a document

1. Select the search icon in the toolbar.
2. Enter a word or phrase.
3. Use the previous and next match buttons to move through the results.

Matches are highlighted in the document. Search works only when the PDF contains readable text. A scanned document made entirely from images must be processed with optical character recognition, commonly called OCR, before its text can be searched.

### Links inside a PDF

Links created in the original PDF remain interactive:

- Internal links can move to another page or section of the same document.
- External links can open websites, email addresses, or telephone links.

The plugin cannot create or repair links that are missing or incorrectly configured in the original PDF.

## Viewing activity counts

Activity counting is disabled by default and can be enabled for individual embeds.

To see the totals:

1. Open **Media → Library**.
2. Select the PDF.
3. Find **PDF Embed activity** in the attachment details.

The panel shows recorded views and downloads. These figures are simple activity counts and should not be treated as audited analytics.

## Updating a PDF

If a document changes, upload the revised PDF and replace the file selected in the block or widget. In the classic editor, insert the revised PDF and remove the old shortcode.

Uploading a new file normally gives it a new attachment ID. Existing embeds continue to show the previous file until they are updated.

## Troubleshooting

### The viewer is blank or reports that the PDF could not be loaded

- Confirm that the Media Library attachment still exists.
- Open the original PDF from the Media Library to make sure the file itself is readable.
- Clear any page or asset cache after installing or updating the plugin.
- If the PDF is password-protected, enter the password when prompted.

### Search finds no results

The PDF may contain scanned page images rather than searchable text. Open it in a desktop PDF reader and try selecting a sentence. If the text cannot be selected, the document probably needs OCR.

### Internal links do not work

Test the link in a desktop PDF reader. If it fails there as well, the destination was not saved correctly in the PDF and must be repaired in the source document.

### The viewer is too small on a phone

Use the full-screen button or increase the mobile full-screen prompt threshold in the block settings.

### A document still appears after the download button is hidden

Hiding the download button removes the convenient toolbar action. It does not prevent a visitor's browser from receiving or saving a PDF that is available on the page.
