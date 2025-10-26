<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { BROWSER as browser } from 'esm-env';
    import type { Snippet } from 'svelte';

    export interface PDFBaseStyling {
        container?: string[]; // default: "flex items-center justify-center h-full text-gray-500"
        loadingIndicator?: string[]; // default: "flex items-center justify-center h-full text-gray-500"
        errorMessage?: string[]; // default: "flex items-center justify-center h-full text-red-500"
        canvasWrapper?: string[]; // default: "flex items-center justify-center min-h-full p-4"
        canvas?: string[]; // default: "shadow-lg bg-white"
    }

    interface PDFApi {
        currentPage: number;
        totalPages: number;
        scale: number;
        autoFitEnabled: boolean;
        isRendering: boolean;
        isLoading: boolean;
        error: string;
        setPage: (page: number) => Promise<void>;
        prevPage: () => Promise<void>;
        nextPage: () => Promise<void>;
        zoomIn: () => Promise<void>;
        zoomOut: () => Promise<void>;
        resetZoom: () => Promise<void>;
        toggleAutoFit: () => Promise<void>;
    }

    interface Props {
        src?: string;
        base64?: string;
        width?: number | string;
        height?: number | string;
        autoFitHeight?: boolean;
        showControls?: boolean;
        controlsPosition?: 'top' | 'bottom';
        resetZoomMode?: 'width' | 'height' | '100%';
        onPageChange?: (page: number) => void;
        api?: PDFApi;
        children?: Snippet;
        // generic map of text keys used by parent components (allows different components to pass different shapes)
        controlsContent?: Record<string, string | undefined>;
        baseStyling?: PDFBaseStyling;
    }

    let {
        src,
        base64,
        width = 800,
        height = 600,
        autoFitHeight = false,
        showControls = true,
        controlsPosition = 'top',
        resetZoomMode = 'width',
        onPageChange,
        api = $bindable(),
        children,
        controlsContent = {},
        baseStyling = {}
    }: Props = $props();

    let autoFitEnabled = $state(autoFitHeight);
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

    let isPanning = $state(false);
    let panStart = { x: 0, y: 0 };
    let panOffset = $state({ x: 0, y: 0 });
    let lastPanOffset = { x: 0, y: 0 };

    // Update API binding for parent components by mutating properties
    $effect(() => {
        if (api !== undefined) {
            api.currentPage = currentPage;
            api.totalPages = totalPages;
            api.scale = scale;
            api.autoFitEnabled = autoFitEnabled;
            api.isRendering = isRendering;
            api.isLoading = isLoading;
            api.error = error;
            api.setPage = setPage;
            api.prevPage = prevPage;
            api.nextPage = nextPage;
            api.zoomIn = zoomIn;
            api.zoomOut = zoomOut;
            api.resetZoom = resetZoom;
            api.toggleAutoFit = toggleAutoFit;
        }
    });

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

            if (pdfDocument) {
                pdfDocument.destroy();
                pdfDocument = null;
            }
            
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
            
            if (autoFitEnabled) {
                await calculateAutoFitScale();
            } else {
                // Default: fit to container width
                await calculateWidthFitScale();
            }
            
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
            
            const controlsHeight = showControls ? 60 : 0;
            const padding = 32;
            
            const actualHeight = containerHeight || (typeof height === 'number' ? height : 600);
            const actualWidth = containerWidth || (typeof width === 'number' ? width : 800);
            
            const availableHeight = actualHeight - controlsHeight - padding;
            const availableWidth = actualWidth - padding;
            
            const scaleToFitHeight = availableHeight / viewport.height;
            const scaleToFitWidth = availableWidth / viewport.width;
            
            scale = Math.min(scaleToFitHeight, scaleToFitWidth, 3);
        } catch (err) {
            scale = 1;
        }
    }

    async function calculateWidthFitScale() {
        if (!pdfDocument || !containerElement) return;
        
        try {
            const page = await pdfDocument.getPage(currentPage);
            const viewport = page.getViewport({ scale: 1 });
            
            const padding = 32;
            const actualWidth = containerWidth || (typeof width === 'number' ? width : 800);
            const availableWidth = actualWidth - padding;
            
            const scaleToFitWidth = availableWidth / viewport.width;
            
            // Fit to width, but cap at 3x zoom
            scale = Math.min(scaleToFitWidth, 3);
        } catch (err) {
            scale = 1;
        }
    }

    async function renderPage() {
        if (!pdfDocument || !canvasElement) return;

        if (renderTask) {
            renderTask.cancel();
            renderTask = null;
        }

        if (isRendering) return;

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

    async function setPage(page: number) {
        if (page >= 1 && page <= totalPages && !isRendering) {
            currentPage = page;
            onPageChange?.(currentPage);
            await renderPage();
        }
    }

    async function nextPage() {
        if (currentPage < totalPages && !isRendering) {
            currentPage++;
            onPageChange?.(currentPage);
            await renderPage();
        }
    }

    async function prevPage() {
        if (currentPage > 1 && !isRendering) {
            currentPage--;
            onPageChange?.(currentPage);
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
            panOffset = { x: 0, y: 0 };
            lastPanOffset = { x: 0, y: 0 };
            
            if (resetZoomMode === '100%') {
                scale = 1;
            } else if (resetZoomMode === 'width') {
                await calculateWidthFitScale();
            } else if (resetZoomMode === 'height') {
                await calculateAutoFitScale();
            }
            
            await renderPage();
        }
    }

    async function toggleAutoFit() {
        if (!isRendering) {
            autoFitEnabled = !autoFitEnabled;
            if (autoFitEnabled) {
                await calculateAutoFitScale();
                await renderPage();
            } else {
                await resetZoom();
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

    function handleTouchStart(event: TouchEvent) {
        if (event.touches.length === 1) {
            isPanning = true;
            panStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
            lastPanOffset = { ...panOffset };
        }
    }

    function handleTouchMove(event: TouchEvent) {
        event.preventDefault();
        
        if (event.touches.length === 1 && isPanning) {
            const deltaX = event.touches[0].clientX - panStart.x;
            const deltaY = event.touches[0].clientY - panStart.y;
            panOffset = {
                x: lastPanOffset.x + deltaX,
                y: lastPanOffset.y + deltaY
            };
        } else if (event.touches.length === 2) {
            isPanning = false;
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            const distance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) + 
                Math.pow(touch2.clientY - touch1.clientY, 2)
            );
            
            if (!containerElement.dataset.initialDistance) {
                containerElement.dataset.initialDistance = distance.toString();
                containerElement.dataset.initialScale = scale.toString();
            } else {
                const initialDistance = parseFloat(containerElement.dataset.initialDistance!);
                const initialScale = parseFloat(containerElement.dataset.initialScale!);
                const newScale = initialScale * (distance / initialDistance);
                scale = Math.max(0.25, Math.min(3, newScale));
                renderPage();
            }
        }
    }

    function handleTouchEnd() {
        isPanning = false;
        if (containerElement.dataset.initialDistance) {
            delete containerElement.dataset.initialDistance;
            delete containerElement.dataset.initialScale;
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

    $effect(() => {
        if (browser && containerElement && !resizeObserver) {
            resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const { width: newWidth, height: newHeight } = entry.contentRect;
                    containerWidth = newWidth;
                    containerHeight = newHeight;
                    
                    if (autoFitEnabled && pdfDocument && !isRendering) {
                        setTimeout(() => {
                            if (autoFitEnabled && pdfDocument && !isRendering) {
                                calculateAutoFitScale().then(() => {
                                    if (canvasElement && !isRendering) {
                                        renderPage();
                                    }
                                });
                            }
                        }, 200);
                    }
                }
            });
            resizeObserver.observe(containerElement);
        }
    });

    onDestroy(() => {
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

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
    bind:this={containerElement}
    class={[
        { "flex-1 overflow-hidden relative bg-gray-100": !baseStyling?.container },
        ...(baseStyling?.container || [])
    ]}
    role="application"
    tabindex="0"
    aria-label={controlsContent.ariaLabel ?? 'PDF viewer - Use mouse to pan and scroll to zoom'}
    onmousedown={handleMouseDown}
    onmousemove={handleMouseMove}
    onmouseup={handleMouseUp}
    onmouseleave={handleMouseUp}
    onwheel={handleWheel}
    ontouchstart={handleTouchStart}
    ontouchmove={handleTouchMove}
    ontouchend={handleTouchEnd}
    dir="ltr"
>
    {#if isLoading}
        <div class={[
            { "flex items-center justify-center h-full text-gray-500": !baseStyling?.loadingIndicator },
            ...(baseStyling?.loadingIndicator || [])
        ]}>
            <div>{controlsContent.loadingText ?? 'Loading PDF...'}</div>
        </div>
    {:else if error}
        <div class={[
            {"flex items-center justify-center h-full text-red-500": !baseStyling?.errorMessage },
            ...(baseStyling?.errorMessage || [])
        ]}>
            <div>
                {#if controlsContent.errorText}
                    {controlsContent.errorText.replace('{msg}', String(error))}
                {:else}
                    Error: {error}
                {/if}
            </div>
        </div>
    {:else}
        <div
            class={[
                { "flex items-center justify-center min-h-full p-4" : !baseStyling?.canvasWrapper },
                ...(baseStyling?.canvasWrapper || [])
            ]}
            style="transform: translate({panOffset.x}px, {panOffset.y}px);"
        >
            <canvas
                bind:this={canvasElement}
                class={[
                    { "shadow-lg bg-white" : !baseStyling?.canvas },
                    ...(baseStyling?.canvas || [])
                ]}
                style="cursor: {isPanning ? 'grabbing' : 'grab'};"
            ></canvas>
        </div>
    {/if}

    <!-- Render children (for overlays like progress indicators) -->
    {#if children}
        {@render children()}
    {/if}
</div>
