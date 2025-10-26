# sv-pdf

A PDF viewer and acceptance component library for Svelte applications. Built with TypeScript and powered by PDF.js.

## Features

- **PDFViewer**: Full-featured PDF viewer with zoom, pan, and navigation controls
- **PDFAccept**: PDF acceptance component that tracks user progress through document
- **Modular Controls**: Override individual control sections (navigation, zoom, actions) with custom snippets
- **Flexible Customization**: Disable specific controls and customize all text/labels via props
- **Zoom Controls**: Zoom in/out, auto-fit, and reset functionality
- **Pan & Navigate**: Mouse and touch support for panning and navigation
- **Responsive**: Mobile-friendly with touch gestures and auto-fit scaling
- **Progress Tracking**: Built-in progress indicator for acceptance workflows
- **TypeScript**: Full TypeScript support with proper type definitions
- **Accessible**: Customizable ARIA labels and keyboard-friendly controls

## Installation

```bash
npm install sv-pdf pdfjs-dist
```

### Requirements

- **Tailwind CSS**: This library uses Tailwind CSS classes. You must have Tailwind CSS configured in your project.
- **PDF.js Worker**: Copy `pdf.worker.min.mjs` from `pdfjs-dist/build/` to your `static` (or `public`) folder.

If you don't have Tailwind CSS set up yet:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

Make sure your `tailwind.config.js` includes the library's components:

```js
export default {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    './node_modules/sv-pdf/dist/**/*.svelte'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## Basic Usage

### PDFViewer

```svelte
<script>
  import { PDFViewer } from 'sv-pdf';
</script>

<PDFViewer 
  src="/path/to/document.pdf" 
  width={800} 
  height={600}
/>
```

### PDFAccept

```svelte
<script>
  import { PDFAccept } from 'sv-pdf';
  
  function handleComplete() {
    console.log('User has accepted the document');
  }
</script>

<PDFAccept 
  src="/path/to/document.pdf" 
  width={800} 
  height={600}
  onComplete={handleComplete}
/>
```

## Component APIs

### PDFViewer Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | - | URL path to PDF file |
| `base64` | `string` | - | Base64 encoded PDF data |
| `width` | `number \| string` | `800` | Viewer width |
| `height` | `number \| string` | `600` | Viewer height |
| `autoFitHeight` | `boolean` | `false` | Auto-fit PDF to container height |
| `showControls` | `boolean` | `true` | Show navigation/zoom controls |
| `controlsPosition` | `'top' \| 'bottom'` | `'top'` | Position of controls |
| `controls` | `Snippet<[ControlsProps]>` | - | Custom controls snippet (full override) |
| `navigationControls` | `Snippet<[ControlsProps]>` | - | Custom navigation controls snippet |
| `zoomControls` | `Snippet<[ControlsProps]>` | - | Custom zoom controls snippet |
| `actionControls` | `Snippet<[ControlsProps]>` | - | Custom action controls snippet |
| `disableControls` | `DisableControls` | `{}` | Selectively disable control sections |
| `controlsContent` | `Record<string, string>` | `{}` | Customize button text and labels |

#### DisableControls Object

```typescript
{
  navigation?: boolean;  // Hide prev/next/page indicator
  zoom?: boolean;        // Hide zoom in/out/scale display
  actions?: boolean;     // Hide auto-fit and reset buttons
}
```

#### ControlsContent Keys (PDFViewer)

```typescript
{
  prevButton?: string;      // Default: "Prev"
  nextButton?: string;      // Default: "Next"
  zoomOutButton?: string;   // Default: "−"
  zoomInButton?: string;    // Default: "+"
  autoFitButton?: string;   // Default: "Auto Fit"
  resetButton?: string;     // Default: "Reset"
  loadingText?: string;     // Default: "Loading PDF..."
  errorText?: string;       // Default: "Error: {msg}" (use {msg} for error message)
  ariaLabel?: string;       // Default: "PDF viewer - Use mouse to pan and scroll to zoom"
}
```

### PDFAccept Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | - | URL path to PDF file |
| `base64` | `string` | - | Base64 encoded PDF data |
| `width` | `number \| string` | `800` | Viewer width |
| `height` | `number \| string` | `600` | Viewer height |
| `autoFitHeight` | `boolean` | `false` | Auto-fit PDF to container height |
| `controlsPosition` | `'top' \| 'bottom'` | `'bottom'` | Position of controls |
| `controls` | `Snippet<[AcceptControlsProps]>` | - | Custom controls snippet (full override) |
| `navigationControls` | `Snippet<[AcceptControlsProps]>` | - | Custom navigation controls snippet |
| `zoomControls` | `Snippet<[AcceptControlsProps]>` | - | Custom zoom controls snippet |
| `actionControls` | `Snippet<[AcceptControlsProps]>` | - | Custom action controls snippet |
| `progressIndicator` | `Snippet<[AcceptControlsProps]>` | - | Custom progress indicator snippet |
| `disableControls` | `DisableControls` | `{}` | Selectively disable control sections |
| `controlsContent` | `Record<string, string>` | `{}` | Customize button text and labels |
| `onComplete` | `() => void` | - | Callback when user completes acceptance |

#### DisableControls Object (PDFAccept)

```typescript
{
  navigation?: boolean;  // Hide prev/next/page indicator
  zoom?: boolean;        // Hide zoom in/out/scale display
  actions?: boolean;     // Hide reset and done buttons
  progress?: boolean;    // Hide progress indicator overlay
}
```

#### ControlsContent Keys (PDFAccept)

```typescript
{
  prevButton?: string;      // Default: "Prev"
  nextButton?: string;      // Default: "Next"
  zoomOutButton?: string;   // Default: "−"
  zoomInButton?: string;    // Default: "+"
  resetButton?: string;     // Default: "Reset"
  doneButton?: string;      // Default: "Done"
  completedText?: string;   // Default: "✓ Completed"
  progressText?: string;    // Default: "Progress: {current}/{total}" (use placeholders)
  loadingText?: string;     // Default: "Loading PDF..."
  errorText?: string;       // Default: "Error: {msg}"
  ariaLabel?: string;       // Default: "PDF viewer - Use mouse to pan and scroll to zoom"
}
```

## Advanced Usage

### Customizing Text and Labels

```svelte
<script>
  import { PDFViewer } from 'sv-pdf';
</script>

<PDFViewer 
  src="/document.pdf"
  controlsContent={{
    prevButton: '◀ Previous',
    nextButton: 'Next ▶',
    zoomInButton: '🔍+',
    zoomOutButton: '🔍−',
    resetButton: '↺ Reset View',
    autoFitButton: '⛶ Fit Screen',
    loadingText: 'Loading your document...',
    errorText: 'Failed to load: {msg}'
  }}
/>
```

### Disabling Specific Controls

```svelte
<script>
  import { PDFViewer } from 'sv-pdf';
</script>

<!-- Hide zoom controls, keep navigation only -->
<PDFViewer 
  src="/document.pdf"
  disableControls={{ zoom: true, actions: true }}
/>
```

### Modular Custom Controls

Override individual control sections while keeping others default:

```svelte
<script>
  import { PDFViewer } from 'sv-pdf';
</script>

<PDFViewer src="/document.pdf">
  {#snippet navigationControls({ currentPage, totalPages, nextPage, prevPage })}
    <div class="flex gap-2">
      <button onclick={prevPage} class="custom-btn">← Back</button>
      <span class="font-bold">{currentPage} of {totalPages}</span>
      <button onclick={nextPage} class="custom-btn">Forward →</button>
    </div>
  {/snippet}
  <!-- Zoom and action controls remain default -->
</PDFViewer>
```

### PDFAccept with Custom Progress Indicator

```svelte
<script>
  import { PDFAccept } from 'sv-pdf';
</script>

<PDFAccept 
  src="/terms.pdf"
  controlsContent={{
    doneButton: 'I Accept',
    completedText: '✅ Accepted',
    progressText: 'Read: {current}/{total} pages'
  }}
  onComplete={() => alert('Terms accepted!')}
>
  {#snippet progressIndicator({ isCompleted, maxPageReached, totalPages })}
    <div class="absolute top-2 left-2 px-3 py-1 bg-blue-500 text-white rounded-md">
      {#if isCompleted}
        ✓ Document Accepted
      {:else}
        📖 Pages read: {maxPageReached}/{totalPages}
      {/if}
    </div>
  {/snippet}
</PDFAccept>
```

### Full Custom Controls

```svelte
<script>
  import { PDFViewer } from 'sv-pdf';
</script>

<PDFViewer src="/document.pdf">
  {#snippet controls({ currentPage, totalPages, zoomIn, zoomOut, nextPage, prevPage })}
    <div class="custom-controls">
      <button onclick={prevPage}>Previous</button>
      <span>{currentPage} / {totalPages}</span>
      <button onclick={nextPage}>Next</button>
      <button onclick={zoomOut}>-</button>
      <button onclick={zoomIn}>+</button>
    </div>
  {/snippet}
</PDFViewer>
```

### Base64 PDF Data

```svelte
<script>
  import { PDFViewer } from 'sv-pdf';
  
  let base64Data = 'JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPD...';
</script>

<PDFViewer base64={base64Data} />
```

## Styling

The components use Tailwind CSS classes by default. You can override styles by targeting the component classes or providing your own CSS.

```css
/* Custom styling example */
.pdf-viewer canvas {
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

## Requirements

- Svelte 4.x or 5.x
- Tailwind CSS 3.x or 4.x
- PDF.js 4.x or 5.x
- Modern browser with ES6+ support

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build package
npm run package

# Run type checking
npm run check
```

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

