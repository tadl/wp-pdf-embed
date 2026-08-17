# WP PDF Embed guide for Avada users

WP PDF Embed adds a native **PDF Embed** design element to Avada Builder and Avada Live. Use it to place a PDF from the WordPress Media Library inside an Avada page layout without writing a shortcode.

The embedded viewer supports continuous scrolling, page navigation, zoom, search, internal and external links, full-screen viewing, optional downloads, and optional activity counts.

## Enable the PDF Embed element

Avada allows individual Builder elements to be enabled or disabled. After installing or updating WP PDF Embed, confirm that the element is available to your role:

1. Open the WordPress dashboard.
2. Go to **Avada → Options → Builder Options**.
3. Find **Avada Builder Elements**.
4. Enable **PDF Embed** for the roles that should be able to use it.
5. Save the Avada options.

If a Builder window was already open, reload it after changing this setting.

## Add a PDF with Avada Builder

1. Edit the page with Avada Builder.
2. Add a **Container** and **Column**, or use an existing column.
3. Select **Add Element** inside the column.
4. Search for **PDF Embed**.
5. Select the element to open its settings.
6. In the **General** tab, choose an existing PDF from the Media Library or upload a new one.
7. Adjust any viewer settings you need.
8. Select **Save** in the element window.
9. Update or publish the page.

The selected file is represented by a PDF document tile in the element settings. This tile confirms the selection; it is not the first page of the PDF.

## Add a PDF with Avada Live

1. Open the page in Avada Live.
2. Add a Container and Column if needed.
3. Add a new element inside the column.
4. Search for and select **PDF Embed**.
5. Choose the PDF and configure the element.
6. Save the element, then save the page.

The editing canvas may show a simplified or delayed preview while the PDF viewer initializes. Use Avada's preview controls or view the published page to confirm the final result.

## Element settings

### General

- **PDF document** selects a PDF from the WordPress Media Library.
- **Document title** provides an accessible name for the viewer. A concise, descriptive title is recommended.

The plugin is designed for PDFs stored in the Media Library. If a PDF is replaced with a newly uploaded file, edit the element and select the new attachment.

### Layout

- **Width** accepts a CSS dimension. `100%` allows the viewer to fill the available Avada column. Fixed values such as `800px` are also supported.
- **Height in pixels** sets the visible height of the viewer. Visitors scroll inside this area when the PDF is taller than the viewer.

The Avada Column controls the space available to the element. If the viewer looks narrower than expected, check the Column width, padding, and responsive settings before increasing the PDF Embed width.

### Viewer

- **Initial page** determines which page is shown when the PDF opens.
- **Show toolbar** controls the navigation bar above the document.
- **Show download button** allows visitors to download the original PDF from the toolbar.
- **Continuous page scrolling** displays all pages in a vertical sequence. When disabled, one page is displayed at a time.
- **Enable text search** adds document search to the toolbar.
- **Open external links in a new tab** controls links in the PDF that lead to other websites. Internal links continue to navigate within the embedded document.

Hiding the toolbar also hides the controls it contains. Consider leaving it enabled when the document has multiple pages.

### Activity

- **Track views and downloads** records a view when the PDF loads and a download when the viewer's download button is used.

Tracking is disabled by default. To see the totals:

1. Go to **Media → Library** in the WordPress dashboard.
2. Select the PDF.
3. Find **PDF Embed activity** in the attachment details.

These are simple activity totals rather than audited analytics. Downloads made directly from the Media Library URL are not counted.

### Mobile

- **Full-screen prompt threshold** shows a full-screen prompt when the viewer is narrower than the specified width. The default is `500`. Use `0` to disable the prompt.
- **Full-screen button text** changes the wording of the mobile prompt.
- **Disable pinch zoom inside viewer** prevents browser-level pinch zoom while the visitor interacts with the PDF. The viewer's zoom controls remain available.

Use Avada's responsive preview modes to check the element at desktop, tablet, and phone widths.

### Extras

- **CSS class** adds one or more custom classes to the element wrapper.
- **CSS ID** assigns a unique ID to the element wrapper.

These fields can be used with Avada's custom CSS features. A CSS ID should be unique on the page.

## Viewer controls

Depending on the element settings, the toolbar includes:

- Previous and next page
- Current page number and total page count
- Zoom out and zoom in
- Document search
- Full-screen viewing
- Download
- Open the original PDF in a new tab

Visitors can enter a page number directly into the current-page field. With continuous scrolling enabled, that field updates as they move through the document.

## Search and links

Search works when the PDF contains readable text. A scanned PDF made from page images must be processed with optical character recognition, commonly called OCR, before its text can be searched.

Links saved in the original PDF remain interactive:

- Internal links can move to another page or section in the same document.
- External links can open supported web, email, or telephone destinations.

If a link does not work in a desktop PDF reader, it must be corrected in the source document before the plugin can use it.

## Replace or remove a PDF

To replace the document:

1. Edit the PDF Embed element.
2. Open **General**.
3. Remove the current selection.
4. Choose the replacement PDF.
5. Save the element and update the page.

To remove the viewer entirely, delete the PDF Embed element from the Avada layout.

## Troubleshooting

### PDF Embed does not appear in Add Element

- Confirm that WP PDF Embed is active under **Plugins**.
- Enable **PDF Embed** under **Avada → Options → Builder Options → Avada Builder Elements**.
- Confirm that the current user role is allowed to use the element.
- Reload Avada Builder after changing Builder Options.
- Clear Avada's generated asset cache and any site caching layer after updating the plugin.

### The selected PDF shows a broken preview image

Update WP PDF Embed to version `1.0.3` or later. Current versions replace Avada's image-only upload preview with a PDF document tile. If the old preview persists, reload the Builder and clear its generated asset cache.

### The PDF displays in the editor but not on the published page

- Update or publish the WordPress page after saving the element.
- Confirm that the selected Media Library attachment still exists.
- Open the PDF directly from the Media Library to verify that the file is readable.
- Clear Avada, page, and browser caches.

### The PDF viewer is too narrow or too short

- Set the element width to `100%`.
- Check the Avada Column width and padding.
- Increase the viewer height in the **Layout** tab.
- Review Avada's responsive settings for the Container and Column.

### The toolbar page field is stretched across the viewer

Update WP PDF Embed to version `1.0.3` or later, then clear Avada's generated CSS cache and reload the page.

### Search returns no results

Try selecting text in the original PDF using a desktop PDF reader. If the text cannot be selected, the document probably requires OCR.

### A password prompt appears

The selected PDF is password-protected. Visitors must enter its password before the browser can render it.

## Download visibility

Turning off the download button removes the convenient toolbar action. It does not prevent a visitor from saving a PDF that their browser is able to display. Use appropriate publishing and access controls when a document should not be publicly available.
