<script lang="ts">
    import PDFBase from './PDFBase.svelte';
    import type { Snippet } from 'svelte';
    import type { PDFBaseStyling } from './PDFBase.svelte';

    export interface PDFAcceptStyling extends PDFBaseStyling {
        wrapper?: string[]; // default: "flex flex-col bg-gray-50 rounded-lg shadow-lg overflow-hidden"
        controls?: string[]; // default: "flex items-center justify-between gap-4 p-4 bg-white border-gray-200"
        navigationSection?: string[]; // default: "flex items-center gap-2 flex-shrink-0"
        navigationButton?: string[]; // default: "px-3 py-2 text-sm font-semibold bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        pageIndicator?: string[]; // default: "text-sm font-medium text-gray-700 text-center bg-gray-50 px-3 py-2 rounded-full whitespace-nowrap"
        zoomSection?: string[]; // default: "flex items-center gap-1"
        zoomButton?: string[]; // default: "px-3 py-2 text-sm font-semibold bg-green-50 text-green-700 rounded-full hover:bg-green-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        zoomScale?: string[]; // default: "text-sm font-medium text-gray-700 text-center bg-gray-50 px-3 py-2 rounded-full min-w-[60px]"
        actionsSection?: string[]; // default: "flex items-center gap-2"
        resetButton?: string[]; // default: "px-3 py-2 text-sm font-semibold bg-gray-50 text-gray-700 rounded-full hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        doneButton?: string[]; // default: "px-4 py-2 text-sm font-semibold bg-emerald-50 text-emerald-700 rounded-full hover:bg-emerald-100 transition-colors border-2 border-emerald-200 whitespace-nowrap"
        progressIndicator?: string[]; // default: "absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-600 shadow-md"
        progressCompleted?: string[]; // default: "text-emerald-600"
    }

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

    interface DisableControls {
        navigation?: boolean;
        prev?: boolean;
        next?: boolean;
        zoom?: boolean;
        zoomIn?: boolean;
        zoomOut?: boolean;
        actions?: boolean;
        reset?: boolean;
        done?: boolean;
        progress?: boolean;
    }

    interface ControlsContent {
        prevPage?: string;
        nextPage?: string;
        prevPageAriaLabel?: string;
        nextPageAriaLabel?: string;
        pageIndicator?: string;
        zoomOutButton?: string;
        zoomInButton?: string;
        resetButton?: string;
        doneButton?: string;
        progressText?: string; // Use {current} and {total} as placeholders
        completedText?: string;
        // PDFBase controls content
        loadingText?: string;
        errorText?: string;
        ariaLabel?: string;
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
        controls?: Snippet<[AcceptControlsProps]>;
        navigationControls?: Snippet<[AcceptControlsProps]>;
        zoomControls?: Snippet<[AcceptControlsProps]>;
        actionControls?: Snippet<[AcceptControlsProps]>;
        progressIndicator?: Snippet<[AcceptControlsProps]>;
        disableControls?: DisableControls;
        controlsContent?: ControlsContent;
        baseStyling?: PDFAcceptStyling;
        onPageChange?: (page: number) => void;
        onComplete?: () => void;
        api?: any;
    }

    let {
        src,
        base64,
        width = 800,
        height = 600,
        autoFitHeight = false,
        showControls = true,
        controlsPosition = 'bottom',
        resetZoomMode = 'width',
        controls,
        navigationControls,
        zoomControls,
        actionControls,
        progressIndicator,
        disableControls = {},
        controlsContent = {},
        onComplete,
        baseStyling = {},
        onPageChange,
        api = $bindable({
            currentPage: 1,
            totalPages: 0,
            scale: 1,
            autoFitEnabled: false,
            isRendering: false,
            isLoading: true,
            error: '',
            setPage: async () => {},
            prevPage: async () => {},
            nextPage: async () => {},
            zoomIn: async () => {},
            zoomOut: async () => {},
            resetZoom: async () => {},
            toggleAutoFit: async () => {}
        })
    }: Props = $props();
    
    let maxPageReached = $state(1);
    let isCompleted = $state(false);

    // Track page changes to update maxPageReached
    function handlePageChange(page: number) {
        maxPageReached = Math.max(maxPageReached, page);
        onPageChange?.(page);
        
        // Auto-complete when done button is disabled and user reaches last page
        if (disableControls.done && maxPageReached >= api.totalPages && !isCompleted) {
            isCompleted = true;
            onComplete?.();
        }
    }

    // Reset state when PDF source changes
    $effect(() => {
        if (src || base64) {
            maxPageReached = 1;
            isCompleted = false;
        }
    });

    // Wrap base functions to track progress
    let canGoNext = $derived(api.currentPage < api.totalPages && api.currentPage < maxPageReached + 1);
    let canGoPrev = $derived(api.currentPage > 1);
    let canMarkComplete = $derived(maxPageReached >= api.totalPages && !isCompleted);

    async function nextPage() {
        if (api && canGoNext && !api.isRendering) {
            await api.nextPage();
        }
    }

    async function prevPage() {
        if (api && canGoPrev && !api.isRendering) {
            await api.prevPage();
        }
    }

    function markComplete() {
        if (canMarkComplete) {
            isCompleted = true;
            onComplete?.();
        }
    }

    let acceptControlsProps = $derived({
        currentPage: api.currentPage,
        totalPages: api.totalPages,
        scale: Math.round(api.scale * 100),
        maxPageReached,
        canGoNext,
        canGoPrev,
        isCompleted,
        isRendering: api.isRendering,
        prevPage,
        nextPage,
        zoomIn: api.zoomIn,
        zoomOut: api.zoomOut,
        resetZoom: api.resetZoom,
        markComplete
    });
</script>

    {#snippet defaultNavigationControls(ctx: AcceptControlsProps)}
        <div class={[
            { "flex items-center gap-2 flex-shrink-0": !baseStyling?.navigationSection },
            ...(baseStyling?.navigationSection || [])
        ]}>
            {#if !disableControls.prev}
                <button
                    onclick={ctx.prevPage}
                    disabled={!ctx.canGoPrev || ctx.isRendering}
                    class={[
                        { "px-3 py-2 text-sm font-semibold bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors": !baseStyling?.navigationButton },
                        ...(baseStyling?.navigationButton || [])
                    ]}
                    aria-label={controlsContent.prevPageAriaLabel}
                >
                    {controlsContent.prevPage ?? 'Prev'}
                </button>
            {/if}
            <span class={[
                { "text-sm font-medium text-gray-700 text-center bg-gray-50 px-3 py-2 rounded-full whitespace-nowrap": !baseStyling?.pageIndicator },
                ...(baseStyling?.pageIndicator || [])
            ]}>
                {controlsContent.pageIndicator
                    ? controlsContent.pageIndicator
                        .replace('{current}', ctx.currentPage.toString())
                        .replace('{total}', ctx.totalPages.toString())
                    : `${ctx.currentPage} / ${ctx.totalPages}`}
            </span>
            {#if !disableControls.next}
                <button
                    onclick={ctx.nextPage}
                    disabled={!ctx.canGoNext || ctx.isRendering}
                    class={[
                        { "px-3 py-2 text-sm font-semibold bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors": !baseStyling?.navigationButton },
                        ...(baseStyling?.navigationButton || [])
                    ]}
                    aria-label={controlsContent.nextPageAriaLabel}
                >
                    {controlsContent.nextPage ?? 'Next'}
                </button>
            {/if}
        </div>
    {/snippet}

{#snippet defaultZoomControls(ctx: AcceptControlsProps)}
    <div class={[
        { "flex items-center gap-1": !baseStyling?.zoomSection },
        ...(baseStyling?.zoomSection || [])
    ]}>
        {#if !disableControls.zoomOut}
            <button
                onclick={ctx.zoomOut}
                disabled={ctx.isRendering}
                class={[
                    { "px-3 py-2 text-sm font-semibold bg-green-50 text-green-700 rounded-full hover:bg-green-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors": !baseStyling?.zoomButton },
                    ...(baseStyling?.zoomButton || [])
                ]}
            >
                {controlsContent.zoomOutButton ?? '−'}
            </button>
        {/if}
        <span class={[
            { "text-sm font-medium text-gray-700 text-center bg-gray-50 px-3 py-2 rounded-full min-w-[60px]": !baseStyling?.zoomScale },
            ...(baseStyling?.zoomScale || [])
        ]}>
            {ctx.scale}%
        </span>
        {#if !disableControls.zoomIn}
            <button
                onclick={ctx.zoomIn}
                disabled={ctx.isRendering}
                class={[
                    { "px-3 py-2 text-sm font-semibold bg-green-50 text-green-700 rounded-full hover:bg-green-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors": !baseStyling?.zoomButton },
                    ...(baseStyling?.zoomButton || [])
                ]}
            >
                {controlsContent.zoomInButton ?? '+'}
            </button>
        {/if}
    </div>
{/snippet}

{#snippet defaultActionControls(ctx: AcceptControlsProps)}
    <div class={[
        { "flex items-center gap-2": !baseStyling?.actionsSection },
        ...(baseStyling?.actionsSection || [])
    ]}>
        {#if !disableControls.reset}
            <button
                onclick={ctx.resetZoom}
                disabled={ctx.isRendering}
                class={[
                    { "px-3 py-2 text-sm font-semibold bg-gray-50 text-gray-700 rounded-full hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors": !baseStyling?.resetButton },
                    ...(baseStyling?.resetButton || [])
                ]}
            >
                {controlsContent.resetButton ?? 'Reset'}
            </button>
        {/if}
        
        <!-- Complete Button (only show when user has seen all pages) -->
        {#if !disableControls.done && ctx.maxPageReached >= ctx.totalPages && !ctx.isCompleted}
            <button
                onclick={ctx.markComplete}
                class={[
                    { "px-4 py-2 text-sm font-semibold bg-emerald-50 text-emerald-700 rounded-full hover:bg-emerald-100 transition-colors border-2 border-emerald-200 whitespace-nowrap": !baseStyling?.doneButton },
                    ...(baseStyling?.doneButton || [])
                ]}
            >
                {controlsContent.doneButton ?? 'Done'}
            </button>
        {/if}
    </div>
{/snippet}

{#snippet defaultProgressIndicator(ctx: AcceptControlsProps)}
    <div class={[
        { "absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-600 shadow-md": !baseStyling?.progressIndicator },
        ...(baseStyling?.progressIndicator || [])
    ]}>
        {#if ctx.isCompleted || (disableControls.done && ctx.maxPageReached >= ctx.totalPages)}
            <span class={[
                { "text-emerald-600": !baseStyling?.progressCompleted },
                ...(baseStyling?.progressCompleted || [])
            ]}>{controlsContent.completedText ?? '✓ Completed'}</span>
        {:else}
            {(controlsContent.progressText ?? 'Progress: {current}/{total}')
                .replace('{current}', String(ctx.maxPageReached))
                .replace('{total}', String(ctx.totalPages))}
        {/if}
    </div>
{/snippet}

{#snippet defaultControls(ctx: AcceptControlsProps)}
    <div class={[
        { [`flex items-center justify-between gap-4 p-4 bg-white ${controlsPosition === 'bottom' ? 'border-t' : 'border-b'} border-gray-200`]: !baseStyling?.controls },
        ...(baseStyling?.controls || [])
    ]}>
        <!-- Page Navigation -->
        {#if !disableControls.navigation}
            {#if navigationControls}
                {@render navigationControls(ctx)}
            {:else}
                {@render defaultNavigationControls(ctx)}
            {/if}
        {/if}

        <!-- Zoom Controls & Action Buttons -->
        <div class="flex items-center gap-2 flex-wrap justify-end">
            {#if !disableControls.zoom}
                {#if zoomControls}
                    {@render zoomControls(ctx)}
                {:else}
                    {@render defaultZoomControls(ctx)}
                {/if}
            {/if}
            
            {#if !disableControls.actions}
                {#if actionControls}
                    {@render actionControls(ctx)}
                {:else}
                    {@render defaultActionControls(ctx)}
                {/if}
            {/if}
        </div>
    </div>
{/snippet}

<div class={[
    { "flex flex-col bg-gray-50 rounded-lg shadow-lg overflow-hidden": !baseStyling?.wrapper },
    ...(baseStyling?.wrapper || [])
]} style="width: {typeof width === 'number' ? width + 'px' : width}; height: {typeof height === 'number' ? height + 'px' : height};">
    <!-- Top Controls -->
    {#if showControls && controlsPosition === 'top'}
        {#if controls}
            {@render controls(acceptControlsProps)}
        {:else}
            {@render defaultControls(acceptControlsProps)}
        {/if}
    {/if}

    <PDFBase 
        {src} 
        {base64} 
        {width} 
        {height} 
        {autoFitHeight}
        showControls={false}
        {controlsPosition}
        controlsContent={controlsContent as Record<string, string | undefined>}
        {resetZoomMode}
        onPageChange={handlePageChange}
        baseStyling={{
            container: baseStyling?.container,
            loadingIndicator: baseStyling?.loadingIndicator,
            errorMessage: baseStyling?.errorMessage,
            canvasWrapper: baseStyling?.canvasWrapper,
            canvas: baseStyling?.canvas
        }}
        bind:api
    >
        {#if !api.isLoading && !api.error && !disableControls.progress}
            {#if progressIndicator}
                {@render progressIndicator(acceptControlsProps)}
            {:else}
                {@render defaultProgressIndicator(acceptControlsProps)}
            {/if}
        {/if}
    </PDFBase>

    <!-- Bottom Controls -->
    {#if showControls && controlsPosition === 'bottom'}
        {#if controls}
            {@render controls(acceptControlsProps)}
        {:else}
            {@render defaultControls(acceptControlsProps)}
        {/if}
    {/if}
</div>
