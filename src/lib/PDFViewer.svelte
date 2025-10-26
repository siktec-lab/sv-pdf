<script lang="ts">
    import PDFBase from './PDFBase.svelte';
    import type { Snippet } from 'svelte';
    import type { PDFBaseStyling } from './PDFBase.svelte';

    export interface PDFViewerStyling extends PDFBaseStyling {
        wrapper?: string[]; // default: "flex flex-col bg-gray-50 rounded-lg shadow-lg overflow-hidden"
        controls?: string[]; // default: "flex items-center justify-between gap-4 p-4 bg-white border-gray-200"
        navigationSection?: string[]; // default: "flex items-center gap-2 flex-shrink-0"
        navigationButton?: string[]; // default: "px-3 py-2 text-sm font-semibold bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        pageIndicator?: string[]; // default: "text-sm font-medium text-gray-700 text-center bg-gray-50 px-3 py-2 rounded-full whitespace-nowrap"
        zoomSection?: string[]; // default: "flex items-center gap-1"
        zoomButton?: string[]; // default: "px-3 py-2 text-sm font-semibold bg-green-50 text-green-700 rounded-full hover:bg-green-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        zoomScale?: string[]; // default: "text-sm font-medium text-gray-700 text-center bg-gray-50 px-3 py-2 rounded-full min-w-[60px]"
        actionsSection?: string[]; // default: "flex items-center gap-2"
        autoFitButton?: string[]; // default: dynamic based on autoFitHeight state
        resetButton?: string[]; // default: "px-3 py-2 text-sm font-semibold bg-gray-50 text-gray-700 rounded-full hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
    }

    interface ControlsProps {
        currentPage: number;
        totalPages: number;
        scale: number;
        autoFitHeight: boolean;
        isRendering: boolean;
        prevPage: () => void;
        nextPage: () => void;
        zoomIn: () => void;
        zoomOut: () => void;
        resetZoom: () => void;
        toggleAutoFit: () => void;
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
        autoFit?: boolean;
    }

    interface ControlsContent {
        prevButton?: string;
        nextButton?: string;
        zoomOutButton?: string;
        zoomInButton?: string;
        autoFitButton?: string;
        resetButton?: string;
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
        controls?: Snippet<[ControlsProps]>;
        navigationControls?: Snippet<[ControlsProps]>;
        zoomControls?: Snippet<[ControlsProps]>;
        actionControls?: Snippet<[ControlsProps]>;
        disableControls?: DisableControls;
        // generic map so it can be forwarded to PDFBase (which accepts a generic map)
        controlsContent?: Record<string, string | undefined>;
        baseStyling?: PDFViewerStyling;
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
        controls,
        navigationControls,
        zoomControls,
        actionControls,
        disableControls = {},
        controlsContent = {},
        baseStyling = {}
    }: Props = $props();

    let api: any = $state({
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
    });

    // Create controls props from API
    let controlsProps = $derived({
        currentPage: api.currentPage,
        totalPages: api.totalPages,
        scale: Math.round(api.scale * 100),
        autoFitHeight: api.autoFitEnabled,
        isRendering: api.isRendering,
        prevPage: api.prevPage,
        nextPage: api.nextPage,
        zoomIn: api.zoomIn,
        zoomOut: api.zoomOut,
        resetZoom: api.resetZoom,
        toggleAutoFit: api.toggleAutoFit
    });
</script>

{#snippet defaultNavigationControls(ctx: ControlsProps)}
    <div class={[
        { "flex items-center gap-2 flex-shrink-0": !baseStyling?.navigationSection },
        ...(baseStyling?.navigationSection || [])
    ]}>
        {#if !disableControls.prev}
            <button
                onclick={ctx.prevPage}
                disabled={ctx.currentPage <= 1 || ctx.isRendering}
                class={[
                    { "px-3 py-2 text-sm font-semibold bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors": !baseStyling?.navigationButton },
                    ...(baseStyling?.navigationButton || [])
                ]}
            >
                {controlsContent.prevButton ?? 'Prev'}
            </button>
        {/if}
        <span class={[
            { "text-sm font-medium text-gray-700 text-center bg-gray-50 px-3 py-2 rounded-full whitespace-nowrap": !baseStyling?.pageIndicator },
            ...(baseStyling?.pageIndicator || [])
        ]}>
            {ctx.currentPage} / {ctx.totalPages}
        </span>
        {#if !disableControls.next}
            <button
                onclick={ctx.nextPage}
                disabled={ctx.currentPage >= ctx.totalPages || ctx.isRendering}
                class={[
                    { "px-3 py-2 text-sm font-semibold bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors": !baseStyling?.navigationButton },
                    ...(baseStyling?.navigationButton || [])
                ]}
            >
                {controlsContent.nextButton ?? 'Next'}
            </button>
        {/if}
    </div>
{/snippet}

{#snippet defaultZoomControls(ctx: ControlsProps)}
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

{#snippet defaultActionControls(ctx: ControlsProps)}
    <div class={[
        { "flex items-center gap-2": !baseStyling?.actionsSection },
        ...(baseStyling?.actionsSection || [])
    ]}>
        {#if !disableControls.autoFit}
            <button
                onclick={ctx.toggleAutoFit}
                disabled={ctx.isRendering}
                class={[
                    { [`px-3 py-2 text-sm font-semibold ${ctx.autoFitHeight ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'} disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed rounded-full transition-colors whitespace-nowrap`]: !baseStyling?.autoFitButton },
                    ...(baseStyling?.autoFitButton || [])
                ]}
            >
                {controlsContent.autoFitButton ?? 'Auto Fit'}
            </button>
        {/if}
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
    </div>
{/snippet}

{#snippet defaultControls(ctx: ControlsProps)}
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
            {@render controls(controlsProps)}
        {:else}
            {@render defaultControls(controlsProps)}
        {/if}
    {/if}

    <PDFBase 
        {src} 
        {base64} 
        {width} 
        {height} 
        {autoFitHeight} 
        showControls={false}
        controlsPosition="top"
        {controlsContent}
        {resetZoomMode}
        baseStyling={{
            container: baseStyling?.container,
            loadingIndicator: baseStyling?.loadingIndicator,
            errorMessage: baseStyling?.errorMessage,
            canvasWrapper: baseStyling?.canvasWrapper,
            canvas: baseStyling?.canvas
        }}
        bind:api
    />

    <!-- Bottom Controls -->
    {#if showControls && controlsPosition === 'bottom'}
        {#if controls}
            {@render controls(controlsProps)}
        {:else}
            {@render defaultControls(controlsProps)}
        {/if}
    {/if}
</div>
