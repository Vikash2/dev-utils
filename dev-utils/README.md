# DevUtils — Developer Utilities Platform

A modern, production-ready React application providing four essential developer tools in a single platform: a full-featured Code Editor, Code Difference Checker, JSON Formatter & Validator, and XML Formatter & Validator.

---

## Tools

### ✏️ Code Editor (`/universal-editor`)
A focused, distraction-free code editing environment powered by Monaco Editor (the engine behind VS Code).

**Features**
- **Multi-tab editing** — open multiple files simultaneously; tabs scroll horizontally when many are open
- **Active file indicator** — a subtle breadcrumb bar shows `Editing: filename.ext` above the editor
- **Auto-restore** — open tabs and content are saved to `localStorage` and restored on reload
- **Language support** — 17 languages: JavaScript, TypeScript, JSX, TSX, HTML, CSS, SCSS, JSON, XML, YAML, SQL, Python, Java, PHP, C, C++, C#, Markdown, and Plain Text
- **Format** — auto-format code using Prettier / js-beautify
- **Minify** — compress code to a single line
- **Beautify** — indent and clean up code structure
- **Validate** — syntax validation with inline error reporting
- **Word wrap toggle** — `WrapText` icon when on, `AlignLeft` when off
- **Minimap toggle** — `Map` icon when on, `MapMinus` when off
- **Font size control** — adjustable from 10–24px via the Advanced panel
- **Editor theme** — independent dark/light toggle inside the toolbar (does not affect the global site theme)
- **File operations** — open files from disk, paste code via modal, save/download the active file
- **Keyboard shortcuts** — `Cmd/Ctrl+S` to download the active file
- **Auto-save** — content is continuously written to `localStorage`

> The global dark/light toggle in the navbar is hidden on this route to avoid conflicting with the editor's own theme control.

---

### 🔄 Diff Checker (`/diff-checker`)
Compare two code snippets with character-, word-, and line-level precision.

**Features**
- **Side-by-side editors** — paste or upload Original and Modified code independently
- **Language selector** — JavaScript, TypeScript, JSON, XML, HTML, CSS, Python, Java, C++, Plain Text
- **File upload** — drag-and-drop or click to upload; language is auto-detected
- **Statistics panel** — four cards showing Added chars, Removed chars, Modified lines, Total changes
- **Difference summary badge** — inline `+N additions, −N deletions` indicator
- **Action buttons with tooltips**
  - **Swap** — exchange left and right editors
  - **Copy Left / Copy Right** — copy either side to clipboard
  - **Download** — export both sides as a `.txt` diff file
  - **Clear** — reset both editors

**Visual Diff section** (appears automatically when content is present)
- **Split View** *(default)* — aligned two-column table where every row pairs the corresponding original and modified line
  - Deleted lines: `bg-red-900/20` row background + red `−` gutter indicator
  - Added lines: `bg-green-900/20` row background + green `+` gutter indicator
  - Modified lines: `bg-yellow-900/10` row background + yellow `~` gutter indicator; word-level changes highlighted inline with `bg-red-500` (deleted words) and `bg-green-500` (added words)
  - Empty spacer rows keep both columns vertically aligned when one side has no counterpart
- **Unified View** — single-column stream of all changes; unchanged blocks of 3+ lines collapse into a clickable "N unchanged lines" button
- **View toggle** — switch between Split and Unified at any time

---

### 📋 JSON Formatter (`/json-formatter`)
- Format JSON with 2-space, 4-space, or tab indentation
- Minify JSON to a single line
- Validate JSON with detailed error messages
- Tree view for exploring nested structure
- File upload and drag-and-drop support
- Copy and download formatted output

---

### 🏷️ XML Formatter (`/xml-formatter`)
- Format XML with configurable indentation
- Minify XML for compact output
- Validate XML with line and column error reporting
- Tree view for hierarchical structure exploration
- File upload and drag-and-drop support
- Copy and download formatted output

---

## Navigation & Theme

- **Navbar** — brand logo on the left; all four tool tabs and the global theme toggle pushed to the right via `ml-auto`
- **Global theme toggle** — positioned immediately left of the nav tabs, separated by a vertical divider; hidden on `/universal-editor` (the editor manages its own theme)
- **Mobile menu** — hamburger button collapses all nav items and the theme toggle into a dropdown on small screens
- **Active route** — highlighted tab with blue background

---

## Tech Stack

| Concern | Library |
|---|---|
| UI framework | React 19 |
| Build tool | Vite |
| Type safety | TypeScript |
| Styling | Tailwind CSS 3 |
| Code editor | Monaco Editor 0.55 |
| State management | Zustand 5 |
| Routing | React Router 7 |
| Animations | Framer Motion 12 |
| Icons | Lucide React |
| Diff algorithm | diff-match-patch |
| XML parsing | fast-xml-parser |
| XML formatting | xml-formatter |
| Code formatting | Prettier, js-beautify |
| SQL formatting | sql-formatter |

---

## Project Structure

```
src/
├── components/
│   ├── UniversalEditor/
│   │   ├── UniversalEditor.tsx      # Main editor shell
│   │   ├── EditorToolbar.tsx        # Toolbar with all actions
│   │   ├── EditorTabs.tsx           # Scrollable tab bar
│   │   ├── MonacoEditorWrapper.tsx  # Monaco integration
│   │   ├── FileUploader.tsx         # File open modal
│   │   ├── PasteModal.tsx           # Paste code modal
│   │   ├── ValidationPanel.tsx      # Inline error panel
│   │   ├── IconButtonWithTooltip.tsx # Reusable icon button
│   │   └── index.ts
│   ├── Navigation.tsx               # Top navbar
│   ├── ThemeToggle.tsx              # Global dark/light toggle
│   ├── Editor.tsx                   # Simple Monaco wrapper (Diff Checker)
│   ├── VisualDiffViewer.tsx         # Split + Unified diff viewer
│   ├── DifferenceSummary.tsx        # Additions/deletions badge
│   ├── ActionButton.tsx             # Button with tooltip support
│   ├── FileUploader.tsx             # Drag-and-drop uploader
│   └── Alert.tsx                    # Toast notifications
├── pages/
│   ├── DiffChecker.tsx
│   ├── JSONFormatter.tsx
│   └── XMLFormatter.tsx
├── store/
│   ├── editorStore.ts               # Editor tabs, theme, font, wrap, minimap
│   ├── themeStore.ts                # Global site theme
│   ├── diffStore.ts                 # Diff checker state
│   └── formatterStore.ts            # JSON/XML formatter state
├── utils/
│   ├── diffUtils.ts                 # computeDiff, computeSplitViewDiff, word diff
│   ├── formatter.ts                 # formatCode, minifyCode, beautifyCode
│   ├── validator.ts                 # validateCode
│   ├── languageDetector.ts          # Auto-detect language from content
│   ├── jsonUtils.ts                 # JSON formatting and validation
│   ├── fileUtils.ts                 # copyToClipboard, downloadFile
│   └── xmlUtils.ts                  # XML formatting and validation (legacy)
├── types/
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install & run

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:5173
```

### Other commands

```bash
npm run build        # Production build → dist/
npm run preview      # Preview production build locally
npm run type-check   # TypeScript check without emitting
npm run lint         # ESLint
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd/Ctrl + S` | Download active file (Code Editor) |
| Double-click tab | Rename tab inline |

---

## Persistent State

The following settings survive page reloads via `localStorage`:

| Key | What is stored |
|---|---|
| `editor-store` | Editor theme, font size, word wrap, minimap, recent files, auto-save preference |
| `editor-autosave` | All open tab names, content, and language |
| `theme-storage` | Global site theme (dark / light) |
| `diff-store` | Left and right editor content, selected language |

---

## Browser Support

| Browser | Minimum version |
|---|---|
| Chrome / Edge | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| iOS Safari | 14+ |
| Chrome Mobile | 90+ |

---

## Building for Production

```bash
npm run build
```

Output goes to `dist/`. The app is a standard SPA — serve `index.html` for all routes.

### Vercel

```bash
npx vercel
```

### Netlify

```bash
npx netlify deploy --prod --dir=dist
```

### Nginx (self-hosted)

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

---

## Troubleshooting

**Monaco Editor blank or not loading**
Clear the browser cache and reload. Ensure JavaScript is enabled and no browser extension is blocking module scripts.

**Tabs lost after reload**
Check that `localStorage` is not blocked (private browsing mode in some browsers disables it).

**Theme toggle missing on Code Editor page**
This is intentional — the editor has its own independent theme control in the toolbar.

**Diff alignment looks off**
The split view uses a row-based alignment algorithm. If you see misalignment, try switching to Unified View and back; the diff is recomputed on each render.

---

## Changelog

### v2.0.0
- **New**: Code Editor (`/universal-editor`) with multi-tab support, Monaco integration, format/minify/beautify/validate, auto-save, and file breadcrumb
- **New**: Visual Diff Viewer with aligned Split View and collapsible Unified View
- **New**: Word-level diff highlighting — changed words highlighted with `bg-red-500` / `bg-green-500` inside modified lines
- **New**: Difference summary badge showing line-level additions and deletions
- **New**: Tooltips on all action buttons (Diff Checker and Code Editor toolbar)
- **New**: Context-aware navbar — global theme toggle hidden on `/universal-editor`
- **New**: Mobile hamburger menu replacing the always-visible horizontal tab strip
- **Changed**: Navbar layout — all tabs and theme toggle right-aligned with `ml-auto`
- **Changed**: Word wrap icon changed to `WrapText` / `AlignLeft` (was `Eye` / `EyeOff`)
- **Changed**: Minimap icon changed to `Map` / `MapMinus` (was `Eye` / `EyeOff`)
- **Removed**: Split view feature from Code Editor (toolbar button and store state)
- **Removed**: Sidebar / Recent Files panel from Code Editor

### v1.0.0
- Code Difference Checker with real-time diff detection
- JSON Formatter & Validator with tree view
- XML Formatter & Validator with tree view
- Dark/light mode with persistence
- File upload support
- Responsive design

---

**Made with ❤️ for developers**
