import type { Snippet } from 'svelte';
import type { PDFBaseStyling } from './PDFBase.svelte';
import type { PDFViewerStyling } from './PDFViewer.svelte';
import type { PDFAcceptStyling } from './PDFAccept.svelte';

export interface ControlsProps {
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

export interface AcceptControlsProps {
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

export interface PDFViewerDisableControls {
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

export interface PDFAcceptDisableControls {
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

export interface PDFViewerControlsContent {
    prevButton?: string;
    nextButton?: string;
    zoomOutButton?: string;
    zoomInButton?: string;
    autoFitButton?: string;
    resetButton?: string;
    // PDFBase controls content
    loadingText?: string;
    errorText?: string;
    ariaLabel?: string;
}

export interface PDFAcceptControlsContent {
    prevPage?: string;
    nextPage?: string;
    prevPageAriaLabel?: string;
    nextPageAriaLabel?: string;
    pageIndicator?: string;
    zoomOutButton?: string;
    zoomInButton?: string;
    resetButton?: string;
    doneButton?: string;
    progressText?: string;
    completedText?: string;
    // PDFBase controls content
    loadingText?: string;
    errorText?: string;
    ariaLabel?: string;
}

export interface PDFViewerProps {
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
    disableControls?: PDFViewerDisableControls;
    controlsContent?: PDFViewerControlsContent;
    baseStyling?: PDFViewerStyling;
    onPageChange?: (page: number) => void;
    api?: any;
}

export interface PDFAcceptProps {
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
    disableControls?: PDFAcceptDisableControls;
    controlsContent?: PDFAcceptControlsContent;
    baseStyling?: PDFAcceptStyling;
    onPageChange?: (page: number) => void;
    onComplete?: () => void;
    api?: any;
}

// Re-export styling interfaces for convenience
export type { PDFBaseStyling, PDFViewerStyling, PDFAcceptStyling };
