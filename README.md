# Certificator

**A modern, drag-and-drop certificate design and generation application. No backend. No database. No external servers.**

Certificator is a fully client-side web application built with Next.js 14 for creating, customizing, and generating professional certificates in bulk. All processing happens in your browser—design templates, produce PDFs, handle Excel data, and package results—everything offline and instantly.

**Latest Update (March 2026)**: Unified brand logo management system, enhanced loading states with animated skeleton, professional toast notifications, and improved TypeScript compatibility.

---

## ✨ Core Features

### Design & Customization
- **Drag-and-Drop Canvas Editor** — Freely position, resize, rotate, and snap-to-grid elements with pixel-perfect precision
- **Element Types** — Text (with variables), Images (PNG/SVG/JPG), and Shapes (rectangle, circle, triangle) with gradients
- **Advanced Controls** — Layers panel, multi-select, undo/redo (Ctrl+Z), copy/duplicate (Ctrl+V), alignment guides, and distance measurements (Alt key)
- **Responsive Layout** — Portrait and landscape A4 orientations with automatic fit-to-screen scaling

### Unified Brand Logo Management
- **Single Upload System** — All brand logos (issuer + sponsors) managed through unified interface
- **Logo Gallery** — Visual thumbnails with hover labels and easy removal
- **Smart Positioning** — Automatic distribution of multiple logos across certificate
- **Sponsor Logo Technique** — All logos use consistent positioning logic for scalability

### Template Management
- **Local Storage Persistence** — Templates saved in browser; never sent to any server
- **Import/Export** — Backup and share templates as JSON files
- **System Layouts** — Pre-built certificate templates with branded zones (issuer logo, sponsor logos, recipient name, date fields)

### PDF Generation
- **Instant PDF Export** — html2canvas + jsPDF, fully client-side, no size limits, no upload requirements
- **Live Preview** — See exactly how certificates will appear before downloading
- **WYSIWYG Scaling** — Canvas editor and PDF output match exactly at 150 DPI
- **Toast Notifications** — Real-time feedback for successful exports and error handling

### Bulk Certificate Production
- **Excel Integration** — Upload .xlsx files; intelligently map columns to template variables
- **Smart Column Mapping** — Levenshtein distance algorithm matches header names automatically
- **Batch ZIP Export** — Generate hundreds of PDFs in seconds; download as a single ZIP
- **Progress Tracking** — Real-time feedback during bulk processing

### Loading States & UX
- **Animated Loading Skeleton** — Gradient-based loading indicator for all wait states
- **Suspense Integration** — Smooth page transitions during template initialization
- **Toast System** — Non-blocking notifications for PDF exports, errors, and bulk operations

### Developer-Friendly
- **No Build Setup Required** — Just `npm run dev`
- **TypeScript Throughout** — Zero compilation errors, full type safety
- **Clean Architecture** — Separation of concerns: hooks for logic, components for UI, Zustand stores for state
- **Well-Documented** — Inline comments, clear naming, easy to extend

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** (Download from https://nodejs.org/)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/certificator.git
cd certificator/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Then open **http://localhost:3000** in your browser.

### Windows: Fast Launcher (EXE)

A desktop shortcut launcher is available for Windows users—no terminal needed:

1. **Download** the launcher from `/launcher/certificator-launch.exe` (or create one using the provided script)
2. **Double-click** `certificator-launch.exe` → your browser opens at http://localhost:3000
3. The dev server runs in the background; close the window to stop

**Note:** The EXE launcher is a convenience wrapper. To build it yourself:
```powershell
powershell -ExecutionPolicy Bypass -File .\launch-setup.ps1
```

### Docker

```bash
docker-compose up --build
# Opens http://localhost:3000
```

---

## 📁 Project Structure

```
certificator/
├── frontend/                          # Main Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # Dashboard — template library, import/export
│   │   │   ├── create/page.tsx       # New template redirect
│   │   │   ├── editor/[id]/page.tsx  # Main certificate editor
│   │   │   └── bulk-generate/page.tsx# Bulk certificate generation
│   │   │
│   │   ├── components/
│   │   │   ├── editor/
│   │   │   │   ├── Canvas.tsx              # Main viewport, guides, snap-to-grid
│   │   │   │   ├── DraggableItem_v3.tsx   # Element renderer with drag/resize
│   │   │   │   ├── Toolbar.tsx            # Zoom, guide toggle
│   │   │   │   ├── LayerPanel.tsx         # Element layers, visibility, z-index
│   │   │   │   ├── InlineElementEditor.tsx# Property panel for selected element
│   │   │   │   ├── SystemLayoutPicker.tsx # Pre-built templates + logo upload
│   │   │   │   ├── ExportModal.tsx        # PDF export dialog
│   │   │   │   └── QuickEdit.tsx         # Single-record quick generation
│   │   │   │
│   │   │   ├── excel/
│   │   │   │   ├── BulkGenerationWorkflow.tsx
│   │   │   │   ├── ExcelUploader.tsx
│   │   │   │   ├── ColumnMapper.tsx
│   │   │   │   └── DataPreview.tsx
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   └── CertCard.tsx       # Template preview card
│   │   │   │
│   │   │   ├── shared/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── CertificatePreview.tsx  # Live preview renderer
│   │   │   │   └── Spinner.tsx
│   │   │   │
│   │   │   └── shared/
│   │   │
│   │   ├── hooks/
│   │   │   ├── usePrinter.ts         # PDF/ZIP generation (client-side)
│   │   │   ├── useExcelParser.ts     # xlsx parsing + Levenshtein matching
│   │   │   ├── useCanvasScale.ts     # A4 pixel ↔ percentage conversions
│   │   │   ├── useConfetti.ts        # Celebration animation
│   │   │   ├── useCSSVariables.ts    # Dynamic CSS variable injection
│   │   │   └── useRealtimeCollaboration.ts
│   │   │
│   │   ├── store/
│   │   │   ├── useEditorStore.ts     # Canvas state (elements, selection, undo/redo)
│   │   │   └── useTemplateStore.ts   # Template list (persisted to localStorage)
│   │   │
│   │   ├── types/
│   │   │   └── CertificateTemplate.d.ts  # Core data models
│   │   │
│   │   ├── utils/
│   │   │   ├── htmlGenerator.ts      # Template → HTML conversion
│   │   │   ├── formatters.ts         # Number, date, text formatting
│   │   │   ├── validators.ts         # Input validation
│   │   │   ├── dom.ts                # DOM helpers
│   │   │   ├── pointerSensitivity.ts # Drag threshold & momentum
│   │   │   └── responsiveLayout.ts   # Viewport calculations
│   │   │
│   │   └── styles/
│   │       ├── globals.css
│   │       └── theme.ts              # TailwindCSS token overrides
│   │
│   ├── public/                       # Static assets
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── .env.local                    # (optional) Environment variables
│
├── launcher/
│   ├── certificator-launch.exe       # Windows desktop launcher
│   └── launch-setup.ps1              # Script to rebuild EXE
│
├── docker-compose.yml                 # Docker Compose configuration
├── ARCHITECTURE.md                   # Technical architecture details
└── README.md                         # This file
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend Framework** | Next.js 14, React 18, TypeScript |
| **Styling** | TailwindCSS 3.3, CSS custom properties |
| **State Management** | Zustand 4.4 (with localStorage persistence) |
| **Drag & Drop** | Custom pointer event handlers (momentum & acceleration) |
| **PDF Generation** | html2canvas 1.4, jsPDF 2.5 |
| **Excel Parsing** | xlsx (SheetJS) 0.18, Levenshtein distance |
| **Compression** | JSZip 3.x (ZIP export) |
| **Icons** | Lucide React 0.263 |
| **Build Tool** | Next.js (Webpack 5) |
| **Package Manager** | npm |

---

## 📊 Data Model

### CertificateTemplate
```typescript
{
  id:               string
  name:             string
  description:      string
  orientation:      'landscape' | 'portrait'
  width:            number          // mm (297 for landscape width)
  height:           number          // mm (210 for landscape height)
  backgroundColor:  string          // hex color
  elements:         CertificateElement[]
  variables:        string[]        // [recipient.name], [recipient.surname], etc.
  createdAt:        Date
  updatedAt:        Date
  isPremium:        boolean
}
```

### CertificateElement
```typescript
{
  id:           string
  type:         'text' | 'image' | 'shape'
  label:        string
  x, y:         number               // 0–100 (percentage, aspect-ratio preserved)
  width:        number               // 0–100 (%)
  height:       number               // 0–100 (%)
  rotation:     number               // degrees
  zIndex:       number               // layer depth
  visible:      boolean
  
  // For type='text'
  content?:        string
  fontSize?:       number            // pixels
  fontFamily?:     string
  fontWeight?:     'normal' | 'bold' | number
  color?:          string            // hex
  textAlign?:      'left' | 'center' | 'right'
  lineHeight?:     number
  letterSpacing?:  number
  
  // For type='image'
  src?:            string            // data URL
  objectFit?:      'contain' | 'cover' | 'fill'
  
  // For type='shape'
  shapeType?:      'rectangle' | 'circle' | 'triangle'
  backgroundColor?:string
  borderColor?:    string
  borderWidth?:    number
  borderRadius?:   number
  gradientEnabled?:boolean
  gradientAngle?:  number            // degrees
  gradientFrom?:   string            // hex
  gradientTo?:     string            // hex
  
  opacity?:        number            // 0–1
}
```

---

## 🎯 Core Workflows

### Creating a Certificate Template
1. **Dashboard** (`/`) → Click **Create Certificate**
2. **Template Selection** → Choose a pre-built system layout (Minimal, Modern, Digital)
3. **Orientation & Sizing** → Select landscape or portrait A4
4. **Element Customization** → 
   - Drag text/image/shape elements on canvas
   - Edit properties (font size, color, position) in the right panel
   - Multi-select with Shift+Click for batch operations
5. **Logo Management** → Upload issuer and sponsor logos in the sidebar
6. **Save** → Click **Save** in the header; template stored in localStorage

### Generating a Single Certificate
1. **Quick Edit** → Click **Quick** on template card
2. **Fill Data** → Enter recipient name, other variables
3. **Download PDF** → PDF generated instantly in browser
4. *No server involved; completely offline*

### Bulk Generating Certificates
1. **Editor** → Click **Bulk**
2. **Upload Excel** → Select .xlsx file with recipient data
3. **Column Mapping** → System auto-maps columns; manually adjust if needed
4. **Generate** → System creates PDF for each row
5. **Download ZIP** → All PDFs packaged; typically 100s in seconds

### Backing Up Templates
1. **Dashboard** → Click **Export**
2. **JSON Download** → Receive `certificator-templates.json`
3. **Share/Restore** → Send to colleagues or re-import anytime via **Import** button

---

## ⚙️ Architecture Highlights

### Canvas Coordinate System (150 DPI)
- **Editor Canvas**: 1754px (landscape width) × 1240px (landscape height) — represents A4 sheet
- **PDF Render**: Same 150 DPI—no scaling needed; WYSIWYG guarantee
- **Storage**: All positions as **percentages (0–100)** to adapt to any screen size
- **Conversion**: 
  ```
  canvasPixels = (percentage / 100) × canvasWidth
  percentage = (canvasPixels / canvasWidth) × 100
  ```

### State Management (Zustand)
Two stores, both in-memory:

| Store | Scope | Persistence |
|-------|-------|-------------|
| `useEditorStore` | Active canvas (elements, zoom, selection, undo/redo) | Memory only |
| `useTemplateStore` | Complete template library | localStorage (key: `certificator-templates`) |

**Undo/Redo**: History stack in `useEditorStore` tracks element array snapshots. Ctrl+Z/Y navigate history.

### PDF Generation Pipeline
```
CertificateTemplate + Data
    ↓
Off-screen DOM (1754×1240 px)
    ↓
Element → Absolute positioned divs
    ↓
Images load (batch await)
    ↓
html2canvas snapshot (canvas 2D)
    ↓
toDataURL('image/jpeg')
    ↓
jsPDF A4 document
    ↓
PDF Blob → triggerDownload()
```

### Excel Processing
```
.xlsx File
    ↓
ShareJS parser → rows + columns
    ↓
Levenshtein distance match headers to template variables
    ↓
For each row: generate PDF with substituted data
    ↓
JSZip package all PDFs
    ↓
ZIP Blob → download
```

---

## 🎮 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Shift + Click` | Multi-select element |
| `Ctrl/Cmd + A` | Select all non-boundary elements |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` / `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl/Cmd + D` | Duplicate selected element |
| `Ctrl/Cmd + C` | Copy element (contextual) |
| `Ctrl/Cmd + V` | Paste/duplicate |
| `Delete` / `Backspace` | Delete selected element(s) |
| `Arrow Keys` | Move selected element (±0.5%) |
| `Shift + Arrow` | Move selected element (±1.5%) |
| `Alt + Drag` | Show distance guides to edges |
| `Space + Drag` | Pan canvas |
| `Scroll` | Pan vertically; `Shift+Scroll` pans horizontally |
| `Ctrl/Cmd + Scroll` | Zoom in/out (20%–400%) |
| `Escape` | Clear selection |
| `Double-Click (Text)` | Enter inline edit mode |

---

## 🔧 Development

### Start Development Server
```bash
cd frontend
npm install
npm run dev
```

### Build for Production
```bash
npm run build
npm run start
```

### Type Checking
```bash
npx tsc --noEmit
```

### Troubleshooting

**Text appears clipped?**
- Ensure canvas zoom is at 100% (fit-to-screen)
- Check element height is sufficient for font size + padding
- Text elements default to 8px padding; adjust if needed

**PDF size doesn't match canvas?**
- Both editor and PDF use 150 DPI (1754×1240px for landscape A4)
- If text/elements appear different in PDF, check:
  - Element dimensions (resize slightly while watching PDF preview)
  - Font size (larger fonts may need more vertical space)
- Use the **Live Preview** in Export dialog to verify before downloading

**Shapes not rendering in PDF?**
- Gradient shapes: Ensure `gradientEnabled: true`
- Triangle shapes: Uses SVG `clipPath`; verify browser supports CSS clip-path
- Border radius: Applies correctly; check if radius > 50% of smallest dimension

---

## 🚀 Deployment

### Docker (Recommended)
```bash
docker-compose up --build
```
Runs both frontend on port 3000 and opens to localhost.

### Vercel (Next.js Native)
```bash
npm run build
# Push to GitHub, connect Vercel repo
# Auto-deploys on push
```

### Static Export (SSG)
Not recommended for this app (requires `getServerSideProps` for dynamic routes). Use Docker or Vercel.

---

## 📝 License

MIT License — See LICENSE file for details.

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit changes (`git commit -m "Add my feature"`)
4. Push to branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## � Planned Improvements & Enhancements

The following features and optimizations are planned for upcoming releases:

### Editor Features & UX
- **Advanced Text Formatting** — Rich text editor with bold, italic, underline, strikethrough
- **Smart Text Sizing** — Auto-shrink font size to fit element bounds
- **Template Variants** — Save multiple preset styles for each template
- **Collaborative Real-time Editing** — Multi-user simultaneous editing with Yjs/WebSocket

### Canvas Motor Enhancements
- **Performance Optimization** — Virtualization for large element counts (50+ elements)
- **Render Batching** — Reduce re-renders with requestAnimationFrame scheduling
- **Touch Support** — Full gesture recognition for mobile/tablet editing
- **GPU Acceleration** — CSS 3D transforms for smoother pan/zoom operations
- **Pointer Precision** — Sub-pixel accuracy for professional alignment

### Auto Numbering System
- **Sequence Generator** — Auto-increment certificate numbers (001, 002, etc.)
- **Custom Formats** — Date-based numbering (YYYYMMDD-001), prefixes/suffixes
- **Ranges** — Batch operation with starting number and increment patterns

### Advanced Alignment & Guides
- **Smart Guides** — Dynamic guides that appear as elements near alignment
- **Distribute Tools** — Equal spacing across multiple selected elements
- **Alignment Presets** — Quick buttons for common layouts (center, justify, etc.)
- **Baseline Alignment** — Typography-aware text alignment
- **Angle Lock** — Snap to 15°, 30°, 45° rotation presets

### Bulk Upload & Export Enhancements
- **Incremental Processing** — Stream ZIP creation to avoid memory overload
- **Drag-Drop Excel Upload** — Drag .xlsx file directly to browser
- **CSV Support** — Process comma/semicolon-separated values
- **Email Integration** — Batch send certificates via SMTP
- **FTP Export** — Direct upload to FTP servers for enterprise
- **Compression Control** — Adjustable PDF quality for file size vs. clarity trade-off

### Data Validation & Safety
- **Input Validation Presets** — Phone, email, address field validators
- **Duplicate Detection** — Warn on duplicate recipient names in bulk
- **Batch Dry-run** — Preview changes before committing
- **Undo on Bulk** — Rollback entire batch operation if needed

### Accessibility & Internationalization
- **WCAG 2.1 AA Compliance** — Full keyboard navigation, screen reader support
- **Dark Mode** — System preference detection and manual toggle
- **RTL Language Support** — Direction-aware layout for Arabic, Hebrew, Persian
- **Localization** — Turkish, German, French, Spanish, Russian translations

### Templates & Presets Marketplace
- **Template Library** — Browse 50+ professional certificate designs
- **Community Sharing** — Upload and download templates from community
- **Ratings & Reviews** — Community feedback on popular templates

---

---

## 📧 Support & Contributing

For issues, questions, or feature requests, please open a GitHub Issue.

### Contributing
Contributions welcome! Please:
1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit changes (`git commit -m "Add my feature"`)
4. Push to branch (`git push origin feature/my-feature`)
5. Open a Pull Request

Refer to [DEVELOPMENT.md](DEVELOPMENT.md) for detailed development setup.

---

## 📄 Documentation

Comprehensive guides available:
- **[USER_MANUAL_EN.md](USER_MANUAL_EN.md)** — Complete user guide in English
- **[USER_MANUAL_TR.md](USER_MANUAL_TR.md)** — Kapsamlı kullanıcı rehberi (Türkçe)
- **[DEVELOPMENT.md](DEVELOPMENT.md)** — Developer setup and contribution guide
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — Technical architecture deep-dive
- **[EDITOR_CANVAS_GUIDE.md](EDITOR_CANVAS_GUIDE.md)** — Canvas coordinate system and editor mechanics

---

## 📝 License

MIT License — See [LICENSE](LICENSE) file for details.

---

**Certificator** — Certificates made simple. No backend. No fuss. Just drag, design, and download.

*Version 2.0+ | March 2026 | Built with ❤️ for certificate enthusiasts*
