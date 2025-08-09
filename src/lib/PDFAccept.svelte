<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { BROWSER as browser } from 'esm-env';
    import type { Snippet } from 'svelte';

    interface AcceptControlsProps {
        currentPage: number;
        totalPages: number;
        scale: number;
        maxPageReached: number;
        canGoNext: boolean;
        canGoPrev: boolean;
        isCompleted: boolean;
        isRendering: boolean;
        prevPage: () => void;
        nextPage: () => void;
        zoomIn: () => void;
        zoomOut: () => void;
        resetZoom: () => void;
        markComplete: () => void;
    }

    interface Props {
        src?: string;
        base64?: string;
        width?: number | string;
        height?: number | string;
        controls?: Snippet<[AcceptControlsProps]>;
        onComplete?: () => void;
    }

    let { 
        src, 
        base64, 
        width = 800, 
        height = 600,
        controls,
        onComplete
    }: Props = $props();

    let containerWidth = $state(0);
    let containerHeight = $state(0);
    let resizeObserver: ResizeObserver;
    let isRendering = $state(false);
    let renderTask: any = null;
    let hasRenderedInitial = false;

    let canvasElement = $state<HTMLCanvasElement>();
    let containerElement: HTMLDivElement;
    let pdfDocument: any = null;
    let pdfjsLib: any = null;
    let currentPage = $state(1);
    let totalPages = $state(0);
    let scale = $state(1);
    let isLoading = $state(true);
    let error = $state('');

    // PDFAccept specific state
    let maxPageReached = $state(1);
    let isCompleted = $state(false);

    let isPanning = $state(false);
    let panStart = { x: 0, y: 0 };
    let panOffset = $state({ x: 0, y: 0 });
    let lastPanOffset = { x: 0, y: 0 };

    // Computed properties for navigation control
    let canGoNext = $derived(currentPage < totalPages && currentPage < maxPageReached + 1);
    let canGoPrev = $derived(currentPage > 1);
    let canMarkComplete = $derived(maxPageReached >= totalPages && !isCompleted);

    async function initPdfJs() {
        if (!browser || pdfjsLib) return;
        try {
            pdfjsLib = await import('pdfjs-dist');
            pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        } catch (err) {
            error = 'Failed to load PDF library';
        }
    }

    async function loadPDF() {
        if (!browser || !pdfjsLib) return;
        try {
            isLoading = true;
            error = '';
            
            // Reset acceptance state for new PDF
            maxPageReached = 1;
            isCompleted = false;

            // Destroy existing PDF document if it exists
            if (pdfDocument) {
                pdfDocument.destroy();
                pdfDocument = null;
            }
            
            // Reset render flag for new PDF
            hasRenderedInitial = false;

            let loadingTask: any;

            if (base64) {
                const binaryString = atob(base64);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                loadingTask = pdfjsLib.getDocument({ data: bytes });
            } else if (src) {
                loadingTask = pdfjsLib.getDocument(src);
            } else {
                throw new Error('No PDF source provided');
            }

            pdfDocument = await loadingTask.promise;
            totalPages = pdfDocument.numPages;
            currentPage = 1;
            
            // Always auto-fit to height for PDFAccept
            await calculateAutoFitScale();
            
            // Wait a bit for canvas element to be available, then render
            setTimeout(async () => {
                if (canvasElement && pdfDocument && !hasRenderedInitial) {
                    hasRenderedInitial = true;
                    await renderPage();
                }
            }, 50);
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to load PDF';
        } finally {
            isLoading = false;
        }
    }

    async function calculateAutoFitScale() {
        if (!pdfDocument || !containerElement) return;
        
        try {
            const page = await pdfDocument.getPage(currentPage);
            const viewport = page.getViewport({ scale: 1 });
            
            const controlsHeight = 60; // Controls at bottom
            const padding = 32;
            
            // Use actual container dimensions if available, otherwise fall back to props
            const actualHeight = containerHeight || (typeof height === 'number' ? height : 600);
            
            const availableHeight = actualHeight - controlsHeight - padding;
            const scaleToFitHeight = availableHeight / viewport.height;
            
            scale = Math.min(scaleToFitHeight, 3);
        } catch (err) {
            scale = 1;
        }
    }

    async function renderPage() {
        if (!pdfDocument || !canvasElement) return;

        // Cancel any ongoing render task
        if (renderTask) {
            renderTask.cancel();
            renderTask = null;
        }

        // Prevent concurrent renders
        if (isRendering) {
            return;
        }

        try {
            isRendering = true;
            const page = await pdfDocument.getPage(currentPage);
            const viewport = page.getViewport({ scale });
            
            canvasElement.width = viewport.width;
            canvasElement.height = viewport.height;
            
            const context = canvasElement.getContext('2d')!;
            context.clearRect(0, 0, canvasElement.width, canvasElement.height);
            
            const renderContext = {
                canvasContext: context,
                viewport: viewport,
            };

            renderTask = page.render(renderContext);
            await renderTask.promise;
            renderTask = null;
        } catch (err: any) {
            if (err?.name !== 'RenderingCancelledException') {
                error = err instanceof Error ? err.message : 'Failed to render page';
            }
        } finally {
            isRendering = false;
        }
    }

    async function nextPage() {
        if (canGoNext && !isRendering) {
            currentPage++;
            maxPageReached = Math.max(maxPageReached, currentPage);
            await renderPage();
        }
    }

    async function prevPage() {
        if (canGoPrev && !isRendering) {
            currentPage--;
            await renderPage();
        }
    }

    async function zoomIn() {
        if (!isRendering) {
            scale = Math.min(scale * 1.25, 3);
            await renderPage();
        }
    }

    async function zoomOut() {
        if (!isRendering) {
            scale = Math.max(scale * 0.8, 0.25);
            await renderPage();
        }
    }

    async function resetZoom() {
        if (!isRendering) {
            await calculateAutoFitScale();
            panOffset = { x: 0, y: 0 };
            lastPanOffset = { x: 0, y: 0 };
            await renderPage();
        }
    }

    function markComplete() {
        if (canMarkComplete) {
            isCompleted = true;
            if (onComplete) {
                onComplete();
            }
        }
    }

    function handleMouseDown(event: MouseEvent) {
        if (event.button === 0) {
            isPanning = true;
            panStart = { x: event.clientX, y: event.clientY };
            lastPanOffset = { ...panOffset };
        }
    }

    function handleMouseMove(event: MouseEvent) {
        if (isPanning) {
            const deltaX = event.clientX - panStart.x;
            const deltaY = event.clientY - panStart.y;
            panOffset = {
                x: lastPanOffset.x + deltaX,
                y: lastPanOffset.y + deltaY
            };
        }
    }

    function handleMouseUp() {
        isPanning = false;
    }

    function handleWheel(event: WheelEvent) {
        event.preventDefault();
        if (event.ctrlKey || event.metaKey) {
            const delta = event.deltaY > 0 ? 0.9 : 1.1;
            scale = Math.max(0.25, Math.min(3, scale * delta));
            renderPage();
        }
    }

    onMount(async () => {
        await initPdfJs();
        if (src || base64) {
            await loadPDF();
        }
    });

    $effect(() => {
        if (browser && pdfjsLib && (src || base64)) {
            loadPDF();
        }
    });

    // Set up ResizeObserver when container becomes available
    $effect(() => {
        if (browser && containerElement && !resizeObserver) {
            resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const { width: newWidth, height: newHeight } = entry.contentRect;
                    containerWidth = newWidth;
                    containerHeight = newHeight;
                    
                    // Recalculate autofit if enabled (debounced)
                    setTimeout(() => {
                        if (pdfDocument && !isRendering) {
                            calculateAutoFitScale().then(() => {
                                if (canvasElement && !isRendering) {
                                    renderPage();
                                }
                            });
                        }
                    }, 200);
                }
            });
            resizeObserver.observe(containerElement);
        }
    });

    onDestroy(() => {
        // Cancel any ongoing render task
        if (renderTask) {
            renderTask.cancel();
            renderTask = null;
        }
        
        if (pdfDocument) {
            pdfDocument.destroy();
        }
        if (resizeObserver) {
            resizeObserver.disconnect();
        }
    });
</script>

{#snippet defaultControls()}
    <div class="flex items-center justify-between gap-4 p-4 bg-white border-t border-gray-200">
        <!-- Page Navigation -->
        <div class="flex items-center gap-2 flex-shrink-0">
            <button
                onclick={prevPage}
                disabled={!canGoPrev || isRendering}
                class="px-3 py-2 text-sm font-semibold bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
                Prev
            </button>
            <span class="text-sm font-medium text-gray-700 text-center bg-gray-50 px-3 py-2 rounded-full whitespace-nowrap">
                {currentPage} / {totalPages}
            </span>
            <button
                onclick={nextPage}
                disabled={!canGoNext || isRendering}
                class="px-3 py-2 text-sm font-semibold bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
                Next
            </button>
        </div>

        <!-- Zoom Controls & Complete Button -->
        <div class="flex items-center gap-2 flex-wrap justify-end">
            <div class="flex items-center gap-1">
                <button
                    onclick={zoomOut}
                    disabled={isRendering}
                    class="px-3 py-2 text-sm font-semibold bg-green-50 text-green-700 rounded-full hover:bg-green-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    −
                </button>
                <span class="text-sm font-medium text-gray-700 text-center bg-gray-50 px-3 py-2 rounded-full min-w-[60px]">
                    {Math.round(scale * 100)}%
                </span>
                <button
                    onclick={zoomIn}
                    disabled={isRendering}
                    class="px-3 py-2 text-sm font-semibold bg-green-50 text-green-700 rounded-full hover:bg-green-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    +
                </button>
            </div>
            <button
                onclick={resetZoom}
                disabled={isRendering}
                class="px-3 py-2 text-sm font-semibold bg-gray-50 text-gray-700 rounded-full hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
                Reset
            </button>
            
            <!-- Complete Button (only show when user has seen all pages) -->
            {#if canMarkComplete}
                <button
                    onclick={markComplete}
                    class="px-4 py-2 text-sm font-semibold bg-emerald-50 text-emerald-700 rounded-full hover:bg-emerald-100 transition-colors border-2 border-emerald-200 whitespace-nowrap"
                >
                    Done
                </button>
            {/if}
        </div>
    </div>
{/snippet}

<div class="flex flex-col bg-gray-50 rounded-lg shadow-lg overflow-hidden" style="width: {typeof width === 'number' ? width + 'px' : width}; height: {typeof height === 'number' ? height + 'px' : height};">
    <!-- PDF Display Area -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
        bind:this={containerElement}
        class="flex-1 overflow-hidden relative bg-gray-100"
        role="application"
        tabindex="0"
        aria-label="PDF acceptance viewer - Navigate through all pages to complete"
        onmousedown={handleMouseDown}
        onmousemove={handleMouseMove}
        onmouseup={handleMouseUp}
        onmouseleave={handleMouseUp}
        onwheel={handleWheel}
    >
        {#if isLoading}
            <div class="flex items-center justify-center h-full">
                <div class="text-gray-500">Loading PDF...</div>
            </div>
        {:else if error}
            <div class="flex items-center justify-center h-full">
                <div class="text-red-500">Error: {error}</div>
            </div>
        {:else}
            <div
                class="flex items-center justify-center min-h-full p-4"
                style="transform: translate({panOffset.x}px, {panOffset.y}px);"
            >
                <canvas
                    bind:this={canvasElement}
                    class="shadow-lg bg-white"
                    style="cursor: {isPanning ? 'grabbing' : 'grab'};"
                ></canvas>
            </div>
        {/if}

        <!-- Progress indicator overlay -->
        {#if !isLoading && !error}
            <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-600 shadow-md">
                {#if isCompleted}
                    <span class="text-emerald-600">✓ Completed</span>
                {:else}
                    Progress: {maxPageReached}/{totalPages}
                {/if}
            </div>
        {/if}
    </div>

    <!-- Bottom Controls -->
    {#if controls}
        {@render controls({
            currentPage,
            totalPages,
            scale: Math.round(scale * 100),
            maxPageReached,
            canGoNext,
            canGoPrev,
            isCompleted,
            isRendering,
            prevPage,
            nextPage,
            zoomIn,
            zoomOut,
            resetZoom,
            markComplete
        })}
    {:else}
        {@render defaultControls()}
    {/if}
</div>