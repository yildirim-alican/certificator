# Certificator — User Manual (English)

**Complete guide to designing, generating, and managing professional certificates.**

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Creating Templates](#creating-templates)
4. [The Canvas Editor](#the-canvas-editor)
5. [Element Management](#element-management)
6. [Generating Single Certificates](#generating-single-certificates)
7. [Bulk Certificate Generation](#bulk-certificate-generation)
8. [Template Management](#template-management)
9. [Keyboard Shortcuts](#keyboard-shortcuts)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### System Requirements
- **Modern web browser** (Chrome, Firefox, Safari, Edge — 2020+)
- **Internet connection** (one-time; then works offline)
- **Minimum 4GB RAM** for bulk operations (100+ certificates)

### Installation

#### Option 1: Browser (Easiest)
1. Open [https://certificator.example.com](https://certificator.example.com) in your browser
2. Bookmark the site for quick access
3. Start creating!

#### Option 2: Local Development
```bash
git clone https://github.com/yourusername/certificator.git
cd certificator/frontend
npm install
npm run dev
```
Then open **http://localhost:3000**

#### Option 3: Windows Desktop Launcher
1. Download `certificator-launcher.exe` from `/launcher/` folder
2. Double-click to launch → Browser opens automatically
3. Dev server runs in background; close to stop

### First Time Setup
1. **Create a Certificate** → Click "+ Create Certificate" on dashboard
2. **Choose Layout** → Select from Digital, Minimal, or Modern presets
3. **Customize** → Edit text, add logos, adjust colors
4. **Save** → Click "Save" to store in browser storage
5. **Download** → Export as PDF or generate in bulk

---

## Dashboard Overview

The **main page (/)** shows your certificate template library and quick actions.

### Key Areas

**Left Panel — Template List**
- Displays all your saved certificates
- Cards show template preview, name, and modification date
- Click card to open in editor
- Search by name using the search box

**Top Bar — Actions**
- **Create + icon** → Start new template
- **Import button** → Load templates from JSON file
- **Export button** → Download all templates as JSON backup

**Template Card — Quick Actions**
- **Edit** → Open template in editor
- **Quick** → Generate single certificate with live data entry
- **Duplicate** → Create a copy of the template
- **Delete** → Remove template (with confirmation)

### Filtering & Search
```
Search Box: Type part of template name
Results update in real-time
Leave blank to show all
```

---

## Creating Templates

### Step 1: Select a Preset Layout

When you click "Create Certificate," you see three preset categories:

#### Orientation & Sizing
- **Landscape (A4)** — 297mm × 210mm (horizontal)
- **Portrait (A4)** — 210mm × 297mm (vertical)

#### Layout Categories
1. **Digital** — Modern, colorful, tech-focused designs
2. **Minimal** — Clean, professional, minimalist aesthetic
3. **Modern** — Contemporary, geometric shapes, gradients

**How to Choose:**
- Corporate/Professional? → Choose **Minimal**
- Educational/Training? → Choose **Modern**
- Awards/Recognition? → Choose **Digital**

### Step 2: Add Brand Logos

In the left sidebar, click **"Logo Management"** to expand the logo section.

#### Logo Gallery
- Shows thumbnails of uploaded logos
- Hover over logo to see "Logo 1", "Logo 2" labels
- Click **×** button (red circle) to remove logo
- Logos are positioned automatically

#### Uploading Logos
- Click the **"+ Add Logo"** button
- Select image file (PNG, JPG, SVG recommended)
- Logo appears as thumbnail in gallery
- First logo = Issuer Logo (left/center position)
- Additional logos = Sponsor Logos (distributed across certificate)

**Best Practices:**
- Use square or landscape logos (e.g., 1:1 or 2:1 aspect ratio)
- Resolution: At least 150×150 pixels
- PNG with transparency works best
- Keep file size under 1 MB

### Step 3: Edit Template Details

At the top of the editor:
- **Template Name** — Give your certificate a descriptive name
- **Save** — Persist template to browser storage
- **Export** → Download as PDF (single-page template preview)

---

## The Canvas Editor

### Canvas Overview

The main editing area shows your certificate at actual size (150 DPI).

#### Reference Elements
- **Boundary** — Thin gray outline showing safe print area
- **Guides** — Yellow lines indicating snap-to-grid alignment
- **Elements** — Text, images, shapes positioned on canvas

### Pan & Zoom

#### Zooming
| Action | Result |
|--------|--------|
| `Ctrl + Scroll` | Zoom in/out (20%–400%) |
| `100%` button | Fit to screen *(recommended)* |
| Scroll wheel | Pan vertically |
| `Shift + Scroll` | Pan horizontally |

#### Panning
| Action | Result |
|--------|--------|
| Space + Drag | Pan to move view |
| Right-click drag | Alternative pan method |

### Alignment Guides

As you drag elements, colored guides appear:

- **Yellow lines** — Snap to grid
- **Blue lines** — Align with other elements
- **Green lines** — Center alignment
- **Hold Alt** — Show distance measurements to edges

---

## Element Management

### Types of Elements

#### 1. Text Elements
```
Content Types:
- Static text: "Certificate of Achievement"
- Variables: [recipient.name], [recipient.surname]
- Mixed: "This certifies that [recipient.name] has completed..."

Variable Options:
[recipient.name] — Person's first name
[recipient.surname] — Person's last name
[certificate.success_rate] — Custom variable (e.g., test score)
```

**Editing Text:**
1. Click text element to select
2. Right panel shows properties
3. Type in **Content** field
4. Adjust font, size, color, alignment

**Font Properties:**
- Font family (Arial, Verdana, Georgia, etc.)
- Size (8px–72px)
- Weight (Normal, Bold, or custom)
- Color (click to open color picker)
- Alignment (Left, Center, Right)

#### 2. Image Elements
- Logos, seals, borders, watermarks
- Supported: PNG, JPG, SVG, GIF
- Click to upload or replace
- Properties: Scale, aspect ratio lock, transparency

#### 3. Shape Elements
- **Rectangle** — Colored box, borders, rounded corners
- **Circle** — Badges, seals, borders
- **Triangle** — Decorative elements
- **Gradients** — Color transitions (linear or radial)

**Shape Properties:**
- Background color
- Border color & width
- Border radius (roundness)
- Gradient (on/off + angle)
- Opacity (transparency)

### Selecting Elements

#### Single Select
```
Click on element → Highlights blue
Right panel shows properties
```

#### Multi-Select
```
Shift + Click multiple elements
Ctrl+A selects all non-boundary elements
Double-click deselects
```

#### Multi-Select Operations
- Move together
- Align (left, center, right, top, middle, bottom)
- Delete batch
- Change opacity together

### Positioning & Sizing

#### Move
```
Click & drag element
Arrow keys move ±0.5%
Shift + Arrow keys move ±1.5%
```

#### Resize
```
Grab corner/edge handle & drag
Shift + Drag maintains aspect ratio
Double-click to auto-fit text
```

#### Rotation
```
Cmd/Ctrl + Drag corner
Or type angle in properties panel
Snap angles: 0°, 15°, 30°, 45°, 90°
```

#### Layer Panel (Z-Index)
```
Right sidebar → "Layers" tab
Drag to reorder (top = front)
Click eye icon to hide/show
Double-click to rename element
```

### Duplicating & Copying

```
Ctrl+D — Duplicate selected element (stays nearby)
Ctrl+C — Copy element
Ctrl+V — Paste (may overlap original)

Multiple Duplicates:
1. Select element
2. Ctrl+D multiple times
3. Drag each to position
```

### Deleting Elements

```
Select element + Delete key
Or Backspace
Or right-click → Delete option
Undo (Ctrl+Z) if you delete by mistake
```

---

## Generating Single Certificates

### Quick Generate (Fast)

1. **From Dashboard:**
   - Find certificate card
   - Click **Quick** button

2. **Enter Data:**
   - Recipient name, surname, other variables
   - Each field corresponds to template variable
   - Live preview updates as you type

3. **Download:**
   - Click **Generate PDF**
   - File downloads immediately
   - Toast notification confirms success

### Full Generate (From Editor)

1. **In Editor:**
   - Fill variables at top info panel
   - Click **Export** button

2. **Export Dialog:**
   - Live preview shows certificate with data
   - Filename (auto-filled from template name)
   - Click **Download PDF**

3. **File Handling:**
   - Saves to Downloads folder (standard location)
   - Filename: `[TemplateName]_[Date].pdf`

---

## Bulk Certificate Generation

### Workflow Overview

```
Dashboard → Template Card → Click "Bulk"
    ↓
Bulk Page opens
    ↓
Upload Excel file (.xlsx)
    ↓
Column Mapping (auto-detected or manual)
    ↓
Data Preview (verify before generating)
    ↓
Generate Certificates (batch processing)
    ↓
Download ZIP (all PDFs packaged)
```

### Step-by-Step

#### Step 1: Upload Excel File

1. **Open Bulk Page:**
   - From editor, click **Bulk** button
   - Or from template card, click **Bulk**

2. **Select File:**
   - Click upload area or drag .xlsx file
   - Supported format: Excel 97-2016 (.xlsx, .xls)
   - Max 10,000 rows for stable performance

3. **File Requirements:**
   - First row = column headers
   - Headers should name recipient fields
   - Example headers:
     ```
     Name         Surname    Date       Score
     John         Smith      2024-01-15 95
     Maria        Garcia     2024-01-16 88
     ```

#### Step 2: Column Mapping

The system automatically matches Excel columns to template variables using intelligent algorithm.

**Auto-Mapping Examples:**
```
Excel Header          → Template Variable
"First Name"          → [recipient.name]
"Last Name"           → [recipient.surname]
"Completion Date"     → [certificate.date]
"Score" / "Points"    → [certificate.success_rate]
```

**Manual Mapping (If Needed):**
1. Review auto-mapped columns
2. Click dropdown for any column
3. Select correct template variable
4. Leave unmapped columns as "Skip"
5. Click **Continue**

#### Step 3: Data Preview

Shows sample of data to be processed:

- First 5 rows displayed
- Column headers with mapped variables
- Verify alignment before proceeding
- Click **Back** to adjust mapping
- Click **Generate** to start batch

#### Step 4: Certificate Generation

Processing starts; see real-time progress:

```
Generating: [████████░░] 8/10 certificates
⏱ Elapsed: 12.5s
📊 Speed: ~0.8 certificates/sec
```

**During Processing:**
- Do not close browser
- Do not refresh page
- Can see progress percentage
- Toast notifications on completion

#### Step 5: Download Results

When complete:
```
✓ Generated 10 certificates
📦 certificator-batch-[timestamp].zip

[Download ZIP]
```

**File Structure:**
```
certificator-batch-2024-01-20_143022.zip
├── 001_John_Smith.pdf
├── 002_Maria_Garcia.pdf
├── 003_Ahmed_Hassan.pdf
└── ...
```

### Bulk Generation Tips

**File Size Estimates:**
- 10 certificates ≈ 2-5 MB (depends on images)
- 100 certificates ≈ 20-50 MB
- 1000 certificates ≈ 200-500 MB

**Performance:**
- Process time ≈ 1-2 seconds per certificate
- 100 certificates ≈ 2-3 minutes
- Keep file sizes under 5 MB per certificate

**Character Encoding:**
- UTF-8 supported (English, Turkish, Chinese, etc.)
- Special characters: ü, ç, ş, ğ, ı → handled correctly
- Emoji: Not recommended (may not render in PDF)

---

## Template Management

### Saving Templates

**Auto-Save:**
Templates save to browser storage automatically when you click **Save**.

**Storage Location:**
- Chrome/Edge/Firefox: Local storage (5-50 MB limit)
- Save browser data to keep templates

**Backup Strategy:**
1. Regularly **Export** templates as JSON
2. Store backups on cloud (Google Drive, OneDrive, etc.)
3. Export after major edits

### Exporting Templates

**Export All:**
1. **Dashboard** → Click **Export** button
2. File `certificator-templates.json` downloads
3. Contains all templates with styles, fonts, elements

**Via Email:**
- Share .json file with colleagues
- They click **Import** on their dashboard
- Templates appear instantly

### Importing Templates

**Import Process:**
1. **Dashboard** → Click **Import** button
2. Select .json file (from export or colleague)
3. System merges with existing templates
4. Duplicate IDs are skipped; new templates added

**Bulk Import:**
```
Download from cloud
Import multiple .json files one by one
Mix and match template libraries
```

### Sharing with Team

**Method 1: Direct Export/Import**
```
You              Colleague
  ↓                 ↓
Export JSON    Import JSON
  ↓                 ↓
Send via Email    Saves locally
  ↓                 ↓
They get templates instantly
```

**Method 2: Cloud Sync (Recommended)**
```
You                    Colleague
 ↓                        ↓
Save to OneDrive    Sync from OneDrive
 ↓                        ↓
All changes synced real-time
```

---

## Keyboard Shortcuts

### Canvas Navigation
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Scroll` | Zoom in/out |
| `Space + Drag` | Pan canvas |
| `Shift + Scroll` | Horizontal pan |

### Element Editing
| Shortcut | Action |
|----------|--------|
| `Click` | Select element |
| `Shift + Click` | Multi-select |
| `Ctrl/Cmd + A` | Select all (non-boundary) |
| `Double-Click` | Inline text edit |
| `Delete` / `Backspace` | Delete selected |
| `Escape` | Clear selection |

### Operations
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` | Redo |
| `Ctrl/Cmd + Shift + Z` | Redo (alternative) |
| `Ctrl/Cmd + D` | Duplicate selected |
| `Ctrl/Cmd + C` | Copy selected |
| `Ctrl/Cmd + V` | Paste |

### Movement
| Shortcut | Action |
|----------|--------|
| Arrow keys | Move ±0.5% |
| `Shift + Arrow` | Move ±1.5% |
| `Alt + Drag` | Show distance guides |

---

## Troubleshooting

### Common Issues

#### "Dashboard shows 404 error"
**Solution:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache: Settings → Privacy → Clear browsing data
3. Try incognito/private mode
4. If persists, check browser console (F12) for errors

#### "Templates not showing after refresh"
**Solution:**
1. Check browser local storage is enabled
2. In DevTools (F12) → Application → Local Storage → look for "certificator"
3. If empty, export templates first before clearing data
4. Use Import to restore from backup JSON

#### "Text is clipped in PDF but looks fine in editor"
**Solution:**
1. Check text element height is sufficient
2. Reduce font size (or use line breaks)
3. Enlarge element bounds
4. Use Live Preview before downloading
5. Verify zoom is 100% when editing

#### "Logo appears pixelated in PDF"
**Solution:**
1. Use higher resolution source image (300+ DPI)
2. Or increase image element size in editor
3. Check image format: PNG is best quality
4. Avoid extreme zoom when editing (use 100%)

#### "Bulk PDF generation is slow"
**Solution:**
1. Reduce image size in certificates (compress images)
2. Process smaller batches (100-500 at a time)
3. Use modern browser (Chrome/Firefox are fastest)
4. Close other apps to free RAM
5. Check browser doesn't have memory leak (restart if >500MB)

#### "Export ZIP is too large"
**Solution:**
1. Reduce template image dimensions
2. Compress images to 200×200px where possible
3. Remove unused elements
4. Or split into smaller batches (50-100 certificates each)

#### "Can't import custom fonts"
**Current Limitation:**
- System fonts only (Arial, Verdana, Georgia, Times, Courier)
- Custom fonts planned for v2.1+

**Workaround:**
- Use Web Safe fonts listed above
- Or create text as image element (PNG/SVG) with fonts baked in
- Upload logo image with text pre-rendered

#### "Browser runs out of memory with 1000+ certificates"
**Solution:**
1. Generate in smaller batches (max 500)
2. Use modern browser with good memory management (Chrome)
3. Increase browser memory: Not possible; use different device
4. Consider server-side generation for enterprise scale

### Getting Help

**Check These First:**
1. [README.md](README.md) — Architecture overview
2. [DEVELOPMENT.md](DEVELOPMENT.md) — Tech setup
3. [EDITOR_CANVAS_GUIDE.md](EDITOR_CANVAS_GUIDE.md) — Canvas mechanics

**Report Issues:**
- Open GitHub Issue with:
  - Browser & version
  - Error message (F12 console)
  - Steps to reproduce
  - Screenshots if possible

---

## Tips & Best Practices

### Design Tips
- Use sans-serif fonts (Arial, Verdana) for clarity
- Maintain 0.5–1cm margin from edges
- Test with multiple zoom levels (80%, 100%, 120%)
- Use consistent spacing between elements
- Limit color palette to 3–4 main colors

### Performance
- Keep templates under 5 elements for best speed
- Compress background images to 500KB max
- Batch logo uploads before saving
- Export templates monthly for backup

### Quality Control
- Always use Live Preview before downloading
- Test with sample data before bulk run
- Verify column mapping with first 5 rows
- Check recipient names for special characters (ü, ç, etc.)

### Accessibility
- Ensure sufficient color contrast (AA standard)
- Use readable font sizes (minimum 11pt)
- Provide alt text for important images
- Test in light and dark environments

---

## Frequently Asked Questions (FAQ)

**Q: Can I use my own fonts?**
A: Not yet. Currently limited to system fonts. Planned for v2.1.

**Q: How many certificates can I generate at once?**
A: Tested up to 5,000. Recommend batches of 500 for stability.

**Q: Is my data safe?**
A: 100% — Everything stays in your browser. Nothing sent to servers.

**Q: Can I edit certificates after generating them?**
A: Edit template, then regenerate. Individual PDFs can't be edited directly.

**Q: What's the size limit for logos?**
A: No hard limit, but keep under 1 MB each. Compression recommended.

**Q: Can I use this offline?**
A: Yes, after loading the page once. Works completely offline.

**Q: How long do templates stay saved?**
A: Until browser storage is cleared. Export for permanent backup.

**Q: Can multiple people edit the same template?**
A: No (not yet). Real-time collaboration planned for v2.2.

**Q: Do you collect any data?**
A: No. This is a privacy-first application. No analytics, no tracking.

---

**Welcome to Certificator!** 🎓

Start creating professional certificates today. Questions? Open an issue on GitHub.

*Last updated: March 2026*
