# sv-pdf

A PDF viewer and acceptance component library for Svelte applications. Built with TypeScript and powered by PDF.js.

## Features

- **PDFViewer**: Full-featured PDF viewer with zoom, pan, and navigation controls
- **PDFAccept**: PDF acceptance component that tracks user progress through document
- **Zoom Controls**: Zoom in/out, auto-fit, and reset functionality
- **Pan & Navigate**: Mouse and touch support for panning and navigation
- **Responsive**: Mobile-friendly with touch gestures
- **Customizable**: Flexible styling and custom control snippets
- **TypeScript**: Full TypeScript support with proper type definitions

## Installation

```bash
npm install sv-pdf pdfjs-dist
```

You'll also need to ensure the PDF.js worker file is accessible in your public directory. Copy `pdf.worker.min.mjs` from `pdfjs-dist/build/` to your `static` folder.

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
| `controls` | `Snippet<[ControlsProps]>` | - | Custom controls snippet |

### PDFAccept Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | - | URL path to PDF file |
| `base64` | `string` | - | Base64 encoded PDF data |
| `width` | `number \| string` | `800` | Viewer width |
| `height` | `number \| string` | `600` | Viewer height |
| `controls` | `Snippet<[AcceptControlsProps]>` | - | Custom controls snippet |
| `onComplete` | `() => void` | - | Callback when user completes acceptance |

## Advanced Usage

### Custom Controls

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

