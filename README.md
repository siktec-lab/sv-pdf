# sv-pdf

A PDF viewer and acceptance component library for Svelte applications. Built with TypeScript and powered by PDF.js.

## Features

- **PDFViewer**: Full-featured PDF viewer with zoom, pan, and navigation controls
- **PDFAccept**: PDF acceptance component that tracks user progress through document
- **Modular Controls**: Override individual control sections (navigation, zoom, actions) with custom snippets
- **Granular Control Disabling**: Disable entire control sections OR individual buttons (prev, next, zoom in/out, reset, etc.)
- **Flexible Customization**: Customize all button text, labels, and ARIA attributes via props
- **Reset Zoom Modes**: Configure reset button behavior (fit to width/height or 100% scale)
- **Zoom Controls**: Zoom in/out, auto-fit, and configurable reset functionality
- **Pan & Navigate**: Mouse and touch support for panning and navigation
- **Responsive**: Mobile-friendly with touch gestures and auto-fit scaling
- **Progress Tracking**: Built-in progress indicator for acceptance workflows with auto-completion
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
| `resetZoomMode` | `'width' \| 'height' \| '100%'` | `'width'` | Reset button zoom behavior |
| `controls` | `Snippet<[ControlsProps]>` | - | Custom controls snippet (full override) |
| `navigationControls` | `Snippet<[ControlsProps]>` | - | Custom navigation controls snippet |
| `zoomControls` | `Snippet<[ControlsProps]>` | - | Custom zoom controls snippet |
| `actionControls` | `Snippet<[ControlsProps]>` | - | Custom action controls snippet |
| `disableControls` | `PDFViewerDisableControls` | `{}` | Selectively disable control sections or individual buttons |
| `controlsContent` | `PDFViewerControlsContent` | `{}` | Customize button text and labels |
| `baseStyling` | `PDFViewerStyling` | `{}` | Customize component styling with Tailwind classes |
| `onPageChange` | `(page: number) => void` | - | Callback when page changes |
| `api` | `any` | - | Bindable API object for programmatic control |

#### PDFViewerDisableControls Object

```typescript
{
  // Section-level controls (hides entire section)
  navigation?: boolean;  // Hide entire navigation section
  zoom?: boolean;        // Hide entire zoom section
  actions?: boolean;     // Hide entire actions section
  
  // Granular button-level controls (hide individual buttons)
  prev?: boolean;        // Hide previous page button
  next?: boolean;        // Hide next page button
  zoomIn?: boolean;      // Hide zoom in button
  zoomOut?: boolean;     // Hide zoom out button
  reset?: boolean;       // Hide reset zoom button
  autoFit?: boolean;     // Hide auto-fit button
}
```

**Note:** Section-level flags take precedence over button-level flags. For example, if `navigation: true`, the `prev` and `next` flags are ignored since the entire navigation section is hidden.

#### PDFViewerControlsContent Object

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
| `showControls` | `boolean` | `true` | Show navigation/zoom controls |
| `controlsPosition` | `'top' \| 'bottom'` | `'bottom'` | Position of controls |
| `resetZoomMode` | `'width' \| 'height' \| '100%'` | `'width'` | Reset button zoom behavior |
| `controls` | `Snippet<[AcceptControlsProps]>` | - | Custom controls snippet (full override) |
| `navigationControls` | `Snippet<[AcceptControlsProps]>` | - | Custom navigation controls snippet |
| `zoomControls` | `Snippet<[AcceptControlsProps]>` | - | Custom zoom controls snippet |
| `actionControls` | `Snippet<[AcceptControlsProps]>` | - | Custom action controls snippet |
| `progressIndicator` | `Snippet<[AcceptControlsProps]>` | - | Custom progress indicator snippet |
| `disableControls` | `PDFAcceptDisableControls` | `{}` | Selectively disable control sections or individual buttons |
| `controlsContent` | `PDFAcceptControlsContent` | `{}` | Customize button text and labels |
| `baseStyling` | `PDFAcceptStyling` | `{}` | Customize component styling with Tailwind classes |
| `onPageChange` | `(page: number) => void` | - | Callback when page changes |
| `onComplete` | `() => void` | - | Callback when user completes acceptance |
| `api` | `any` | - | Bindable API object for programmatic control |

#### PDFAcceptDisableControls Object

```typescript
{
  // Section-level controls (hides entire section)
  navigation?: boolean;  // Hide entire navigation section
  zoom?: boolean;        // Hide entire zoom section
  actions?: boolean;     // Hide entire actions section
  progress?: boolean;    // Hide progress indicator overlay
  
  // Granular button-level controls (hide individual buttons)
  prev?: boolean;        // Hide previous page button
  next?: boolean;        // Hide next page button
  zoomIn?: boolean;      // Hide zoom in button
  zoomOut?: boolean;     // Hide zoom out button
  reset?: boolean;       // Hide reset zoom button
  done?: boolean;        // Hide done/complete button
}
```

**Note:** When `done: true`, the progress indicator automatically shows "Completed" once the user reaches the last page, since there's no button to click.

#### PDFAcceptControlsContent Object

```typescript
{
  prevPage?: string;           // Default: "Prev"
  nextPage?: string;           // Default: "Next"
  prevPageAriaLabel?: string;  // Default: undefined
  nextPageAriaLabel?: string;  // Default: undefined
  pageIndicator?: string;      // Default: "{current} / {total}" (use {current} and {total} placeholders)
  zoomOutButton?: string;      // Default: "−"
  zoomInButton?: string;       // Default: "+"
  resetButton?: string;        // Default: "Reset"
  doneButton?: string;         // Default: "Done"
  completedText?: string;      // Default: "✓ Completed"
  progressText?: string;       // Default: "Progress: {current}/{total}" (use placeholders)
  loadingText?: string;        // Default: "Loading PDF..."
  errorText?: string;          // Default: "Error: {msg}"
  ariaLabel?: string;          // Default: "PDF viewer - Use mouse to pan and scroll to zoom"
}
```

## Advanced Usage

### Reset Zoom Modes

Control how the reset button behaves with the `resetZoomMode` prop:

```svelte
<script>
  import { PDFViewer } from 'sv-pdf';
</script>

<!-- Reset to fit width (default) -->
<PDFViewer 
  src="/document.pdf"
  resetZoomMode="width"
/>

<!-- Reset to fit height -->
<PDFViewer 
  src="/document.pdf"
  resetZoomMode="height"
/>

<!-- Reset to 100% scale -->
<PDFViewer 
  src="/document.pdf"
  resetZoomMode="100%"
/>
```

### Granular Control Disabling

Disable individual buttons without hiding entire control sections:

```svelte
<script>
  import { PDFViewer, PDFAccept } from 'sv-pdf';
</script>

<!-- PDFViewer: Hide only the previous button and zoom out -->
<PDFViewer 
  src="/document.pdf"
  disableControls={{ 
    prev: true,
    zoomOut: true 
  }}
/>

<!-- PDFViewer: Hide auto-fit but keep reset -->
<PDFViewer 
  src="/document.pdf"
  disableControls={{ 
    autoFit: true 
  }}
/>

<!-- PDFAccept: Hide done button (auto-completes on last page) -->
<PDFAccept 
  src="/terms.pdf"
  disableControls={{ 
    done: true 
  }}
  onComplete={() => console.log('Auto-completed')}
/>

<!-- PDFAccept: Forward-only navigation (no prev button) -->
<PDFAccept 
  src="/contract.pdf"
  disableControls={{ 
    prev: true 
  }}
/>

<!-- Mix section and button-level disabling -->
<PDFViewer 
  src="/document.pdf"
  disableControls={{ 
    navigation: false,  // Keep navigation section
    prev: true,         // But hide prev button
    actions: false,     // Keep actions section
    autoFit: true       // But hide autoFit button
  }}
/>
```

**Granular Control Behavior:**
- **Section-level flags** (`navigation`, `zoom`, `actions`) hide entire control groups
- **Button-level flags** (`prev`, `next`, `zoomIn`, `zoomOut`, `reset`, `autoFit`, `done`) hide individual buttons
- Section-level takes precedence: if `navigation: true`, individual `prev`/`next` flags are ignored
- **PDFAccept auto-completion:** When `done: true`, the progress indicator automatically shows "Completed" when the user reaches the last page

### Customizing Text and Labels

```svelte
<script>
  import { PDFViewer, PDFAccept } from 'sv-pdf';
</script>

<!-- PDFViewer with custom text -->
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

<!-- PDFAccept with custom text and placeholders -->
<PDFAccept 
  src="/terms.pdf"
  controlsContent={{
    prevPage: '← Back',
    nextPage: 'Continue →',
    pageIndicator: '{current} of {total}',
    doneButton: 'I Accept',
    completedText: '✅ Accepted',
    progressText: 'Read: {current}/{total} pages',
    prevPageAriaLabel: 'Go to previous page',
    nextPageAriaLabel: 'Go to next page'
  }}
/>
```

### Disabling Specific Controls

```svelte
<script>
  import { PDFViewer, PDFAccept } from 'sv-pdf';
</script>

<!-- Hide entire zoom section -->
<PDFViewer 
  src="/document.pdf"
  disableControls={{ zoom: true, actions: true }}
/>

<!-- Hide specific buttons only -->
<PDFViewer 
  src="/document.pdf"
  disableControls={{ 
    prev: true,      // Hide previous button
    zoomOut: true,   // Hide zoom out button
    autoFit: true    // Hide auto-fit button
  }}
/>

<!-- PDFAccept: Read-only mode (no done button, auto-completes) -->
<PDFAccept 
  src="/document.pdf"
  disableControls={{ done: true }}
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

### Programmatic Control with API Binding

Access the PDF viewer's API to control it programmatically:

```svelte
<script>
  import { PDFViewer } from 'sv-pdf';
  
  let pdfApi;
  
  function jumpToPage(page: number) {
    pdfApi?.setPage(page);
  }
  
  function handlePageChange(page: number) {
    console.log('Current page:', page);
  }
</script>

<PDFViewer 
  src="/document.pdf"
  bind:api={pdfApi}
  onPageChange={handlePageChange}
/>

<div class="controls">
  <button onclick={() => jumpToPage(1)}>Go to Page 1</button>
  <button onclick={() => pdfApi?.zoomIn()}>Zoom In</button>
  <button onclick={() => pdfApi?.zoomOut()}>Zoom Out</button>
  <button onclick={() => pdfApi?.resetZoom()}>Reset Zoom</button>
  <button onclick={() => pdfApi?.toggleAutoFit()}>Toggle Auto Fit</button>
  
  {#if pdfApi}
    <p>Current Page: {pdfApi.currentPage} / {pdfApi.totalPages}</p>
    <p>Zoom: {Math.round(pdfApi.scale * 100)}%</p>
    <p>Auto Fit: {pdfApi.autoFitEnabled ? 'On' : 'Off'}</p>
  {/if}
</div>
```

**Available API Methods:**
- `setPage(page: number): Promise<void>` - Navigate to specific page
- `prevPage(): Promise<void>` - Go to previous page
- `nextPage(): Promise<void>` - Go to next page
- `zoomIn(): Promise<void>` - Zoom in
- `zoomOut(): Promise<void>` - Zoom out
- `resetZoom(): Promise<void>` - Reset zoom (behavior based on `resetZoomMode` prop)
- `toggleAutoFit(): Promise<void>` - Toggle auto-fit mode

**Available API Properties (read-only):**
- `currentPage: number` - Current page number
- `totalPages: number` - Total number of pages
- `scale: number` - Current zoom scale
- `autoFitEnabled: boolean` - Auto-fit mode state
- `isRendering: boolean` - Whether currently rendering
- `isLoading: boolean` - Whether PDF is loading
- `error: string` - Error message if any

### TypeScript Support

All types are exported from the package for full type safety:

```typescript
import { 
  PDFViewer, 
  PDFAccept,
  type PDFViewerProps,
  type PDFAcceptProps,
  type PDFViewerDisableControls,
  type PDFAcceptDisableControls,
  type PDFViewerControlsContent,
  type PDFAcceptControlsContent,
  type ControlsProps,
  type AcceptControlsProps,
  type PDFBaseStyling,
  type PDFViewerStyling,
  type PDFAcceptStyling
} from 'sv-pdf';

// Use types in your code
const viewerControls: PDFViewerDisableControls = {
  prev: true,
  zoomOut: true,
  autoFit: false
};

const acceptContent: PDFAcceptControlsContent = {
  prevPage: 'Back',
  nextPage: 'Continue',
  doneButton: 'I Accept',
  pageIndicator: 'Page {current} of {total}'
};

// Custom snippet with typed props
function MyCustomControls(props: ControlsProps) {
  // props.currentPage, props.totalPages, etc. are all typed
}
```

### Custom Styling with Tailwind CSS

Both `PDFViewer` and `PDFAccept` support complete style customization through the `baseStyling` prop. You can override any element's Tailwind classes while keeping the default styling for elements you don't customize.

#### How It Works

Each styling property accepts an array of Tailwind class strings. When provided, it **completely replaces** the default classes for that element:

```svelte
<script>
  import { PDFViewer, type PDFViewerStyling } from 'sv-pdf';
  
  const customStyling: PDFViewerStyling = {
    // Replace wrapper classes (default is removed, these apply instead)
    wrapper: ['flex', 'flex-col', 'bg-blue-50', 'rounded-xl', 'shadow-2xl'],
    
    // Replace navigation button classes
    navigationButton: ['px-4', 'py-2', 'bg-purple-500', 'text-white', 'rounded-lg'],
    
    // Leave other elements with default styling by not specifying them
  };
</script>

<PDFViewer 
  src="/document.pdf"
  baseStyling={customStyling}
/>
```

#### PDFViewerStyling Interface

```typescript
interface PDFViewerStyling {
  // Inherited from PDFBaseStyling (affects PDF canvas and container)
  container?: string[];        // PDF canvas container
  loadingIndicator?: string[]; // Loading state display
  errorMessage?: string[];     // Error state display
  canvasWrapper?: string[];    // Canvas wrapper with pan transform
  canvas?: string[];           // PDF canvas element
  
  // PDFViewer specific elements
  wrapper?: string[];           // Main component wrapper
  controls?: string[];          // Controls bar container
  navigationSection?: string[]; // Navigation buttons container
  navigationButton?: string[];  // Previous/Next buttons
  pageIndicator?: string[];     // Page counter display
  zoomSection?: string[];       // Zoom controls container
  zoomButton?: string[];        // Zoom in/out buttons
  zoomScale?: string[];         // Zoom percentage display
  actionsSection?: string[];    // Action buttons container
  autoFitButton?: string[];     // Auto-fit toggle button
  resetButton?: string[];       // Reset zoom button
}
```

**Default Classes:**
```typescript
{
  wrapper: ['flex', 'flex-col', 'bg-gray-50', 'rounded-lg', 'shadow-lg', 'overflow-hidden'],
  controls: ['flex', 'items-center', 'justify-between', 'gap-4', 'p-4', 'bg-white', 'border-gray-200'],
  navigationSection: ['flex', 'items-center', 'gap-2', 'flex-shrink-0'],
  navigationButton: ['px-3', 'py-2', 'text-sm', 'font-semibold', 'bg-blue-50', 'text-blue-700', 'rounded-full', 'hover:bg-blue-100', 'disabled:bg-gray-100', 'disabled:text-gray-400', 'disabled:cursor-not-allowed', 'transition-colors'],
  pageIndicator: ['text-sm', 'font-medium', 'text-gray-700', 'text-center', 'bg-gray-50', 'px-3', 'py-2', 'rounded-full', 'whitespace-nowrap'],
  // ... see source code for complete defaults
}
```

#### PDFAcceptStyling Interface

```typescript
interface PDFAcceptStyling extends PDFViewerStyling {
  // All PDFViewerStyling properties plus:
  doneButton?: string[];         // Done/Accept button
  progressIndicator?: string[];  // Progress overlay container
  progressCompleted?: string[];  // Completed state text
}
```

**Additional Defaults:**
```typescript
{
  doneButton: ['px-4', 'py-2', 'text-sm', 'font-semibold', 'bg-emerald-50', 'text-emerald-700', 'rounded-full', 'hover:bg-emerald-100', 'transition-colors', 'border-2', 'border-emerald-200', 'whitespace-nowrap'],
  progressIndicator: ['absolute', 'top-4', 'right-4', 'bg-white/90', 'backdrop-blur-sm', 'rounded-full', 'px-3', 'py-1', 'text-xs', 'font-medium', 'text-gray-600', 'shadow-md'],
  progressCompleted: ['text-emerald-600']
}
```

#### Styling Examples

**Example 1: Custom Theme Colors**

```svelte
<script>
  import { PDFViewer } from 'sv-pdf';
</script>

<PDFViewer 
  src="/document.pdf"
  baseStyling={{
    wrapper: ['flex', 'flex-col', 'bg-indigo-50', 'rounded-2xl', 'shadow-xl'],
    navigationButton: ['px-4', 'py-2', 'bg-indigo-500', 'text-white', 'rounded-lg', 'hover:bg-indigo-600'],
    zoomButton: ['px-3', 'py-2', 'bg-purple-500', 'text-white', 'rounded-lg', 'hover:bg-purple-600'],
    resetButton: ['px-4', 'py-2', 'bg-gray-600', 'text-white', 'rounded-lg', 'hover:bg-gray-700']
  }}
/>
```

**Example 2: Minimalist Dark Theme**

```svelte
<script>
  import { PDFAccept } from 'sv-pdf';
</script>

<PDFAccept 
  src="/terms.pdf"
  baseStyling={{
    wrapper: ['flex', 'flex-col', 'bg-gray-900', 'rounded-lg'],
    controls: ['flex', 'items-center', 'justify-between', 'p-4', 'bg-gray-800', 'border-t', 'border-gray-700'],
    navigationButton: ['px-3', 'py-2', 'bg-gray-700', 'text-gray-200', 'rounded', 'hover:bg-gray-600'],
    pageIndicator: ['text-gray-300', 'bg-gray-700', 'px-3', 'py-1', 'rounded'],
    zoomButton: ['px-2', 'py-1', 'bg-gray-700', 'text-gray-200', 'rounded', 'hover:bg-gray-600'],
    doneButton: ['px-4', 'py-2', 'bg-green-600', 'text-white', 'rounded', 'hover:bg-green-500'],
    progressIndicator: ['absolute', 'top-4', 'right-4', 'bg-gray-800', 'text-gray-200', 'px-3', 'py-1', 'rounded', 'text-xs'],
    container: ['bg-gray-800'],
    canvas: ['shadow-2xl']
  }}
/>
```

**Example 3: Partial Styling Override**

```svelte
<script>
  import { PDFViewer } from 'sv-pdf';
</script>

<!-- Only customize specific elements, others keep defaults -->
<PDFViewer 
  src="/document.pdf"
  baseStyling={{
    // Custom wrapper
    wrapper: ['flex', 'flex-col', 'bg-gradient-to-br', 'from-blue-50', 'to-purple-50', 'rounded-3xl', 'shadow-2xl', 'p-2'],
    
    // Custom navigation buttons with animations
    navigationButton: ['px-4', 'py-2', 'bg-blue-500', 'text-white', 'rounded-full', 'hover:scale-105', 'transform', 'transition-all', 'duration-200', 'disabled:opacity-50', 'disabled:hover:scale-100'],
    
    // Everything else uses defaults
  }}
/>
```

**Example 4: Compact Mobile-Friendly Styling**

```svelte
<script>
  import { PDFAccept } from 'sv-pdf';
</script>

<PDFAccept 
  src="/contract.pdf"
  baseStyling={{
    controls: ['flex', 'items-center', 'justify-between', 'p-2', 'bg-white', 'border-t', 'text-xs'],
    navigationButton: ['px-2', 'py-1', 'text-xs', 'bg-blue-50', 'text-blue-700', 'rounded'],
    pageIndicator: ['text-xs', 'bg-gray-100', 'px-2', 'py-1', 'rounded'],
    zoomButton: ['px-2', 'py-1', 'text-xs', 'bg-green-50', 'text-green-700', 'rounded'],
    zoomScale: ['text-xs', 'bg-gray-100', 'px-2', 'py-1', 'rounded', 'min-w-[50px]'],
    doneButton: ['px-3', 'py-1', 'text-xs', 'bg-emerald-500', 'text-white', 'rounded'],
    progressIndicator: ['absolute', 'top-2', 'right-2', 'bg-white', 'px-2', 'py-1', 'text-xs', 'rounded', 'shadow']
  }}
/>
```

#### Styling Best Practices

1. **Use Tailwind's Design System**: Stick to Tailwind's spacing, color, and typography scales for consistency
2. **Consider States**: Include hover, disabled, and active states in your custom classes
3. **Responsive Design**: Add responsive prefixes (`sm:`, `md:`, `lg:`) for different screen sizes
4. **Accessibility**: Maintain sufficient color contrast and interactive element sizing
5. **Transitions**: Add transition classes for smooth interactions
6. **Test Thoroughly**: Verify your styling works in all component states (loading, error, rendering)

#### Working with Tailwind JIT

Since the library uses Tailwind classes, make sure your `tailwind.config.js` includes the library:

```js
export default {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    './node_modules/sv-pdf/dist/**/*.svelte'  // Include library components
  ],
  // ... rest of config
}
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

