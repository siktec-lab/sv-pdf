import type { Snippet } from 'svelte';

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

export interface PDFViewerProps {
    src?: string;
    base64?: string;
    width?: number | string;
    height?: number | string;
    autoFitHeight?: boolean;
    showControls?: boolean;
    controlsPosition?: 'top' | 'bottom';
    controls?: Snippet<[ControlsProps]>;
}

export interface PDFAcceptProps {
    src?: string;
    base64?: string;
    width?: number | string;
    height?: number | string;
    controls?: Snippet<[AcceptControlsProps]>;
    onComplete?: () => void;
}