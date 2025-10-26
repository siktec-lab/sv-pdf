<script lang="ts">
    import PDFViewer from '$lib/PDFViewer.svelte';
    import PDFAccept from '$lib/PDFAccept.svelte';

    let selectedFile: File | null = null;
    let pdfBase64 = $state('');
    let pdfUrl = $state('/pdfs/test-mutav-harel.pdf');
    let selectedPdf = $state('test-mutav-harel.pdf');
    
    const availablePdfs = [
        '12.pdf',
        '16243-nispah-bet.pdf',
        'clal-risk-form-525-17882.pdf', 
        'test-mutav-harel.pdf',
        'tofes-hatzaa-harel-haim.pdf'
    ];

    function handleFileUpload(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        
        if (file && file.type === 'application/pdf') {
            selectedFile = file;
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    pdfBase64 = reader.result.split(',')[1];
                }
            };
            reader.readAsDataURL(file);
        }
    }

    function loadFromUrl() {
        pdfBase64 = '';
        selectedFile = null;
    }

    function loadSelectedPdf() {
        // Force a state change by clearing first, then setting new URL
        pdfUrl = '';
        pdfBase64 = '';
        selectedFile = null;
        setTimeout(() => {
            pdfUrl = `/pdfs/${selectedPdf}`;
        }, 10);
    }

    function handlePDFAcceptComplete() {
        alert('PDF acceptance completed! User has reviewed all pages.');
    }
</script>

<div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
        <!-- PDF Source Selection -->
        <div class="max-w-md mx-auto mb-8">
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h2 class="text-lg font-semibold mb-6 text-gray-800">Load PDF</h2>
                
                <!-- File Upload -->
                <div class="mb-6">
                    <label for="file-upload" class="block text-sm font-medium text-gray-700 mb-2">Upload PDF File</label>
                    <input
                        id="file-upload"
                        type="file"
                        accept=".pdf"
                        onchange={handleFileUpload}
                        class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>

                <!-- URL Input -->
                <div class="mb-6">
                    <label for="pdf-url" class="block text-sm font-medium text-gray-700 mb-2">Or Enter PDF URL</label>
                    <input
                        id="pdf-url"
                        type="url"
                        bind:value={pdfUrl}
                        placeholder="https://example.com/sample.pdf"
                        class="w-full px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                    />
                    <button
                        onclick={loadFromUrl}
                        class="mt-2 px-4 py-2 text-sm font-semibold bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                    >
                        Load from URL
                    </button>
                </div>

                <!-- PDF Selection -->
                <div>
                    <label for="pdf-select" class="block text-sm font-medium text-gray-700 mb-2">Or Select Example PDF</label>
                    <select
                        id="pdf-select"
                        bind:value={selectedPdf}
                        class="w-full px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-200 mb-2"
                    >
                        {#each availablePdfs as pdf}
                            <option value={pdf}>{pdf}</option>
                        {/each}
                    </select>
                    <button
                        onclick={loadSelectedPdf}
                        class="px-4 py-2 text-sm font-semibold bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors"
                    >
                        Load Selected PDF
                    </button>
                </div>
            </div>
        </div>

        <!-- PDF Viewer Examples -->
        {#if pdfBase64 || pdfUrl}
            <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <!-- Responsive PDF Viewer with Custom Controls -->
                <div class="flex flex-col">
                    <h3 class="text-lg font-semibold mb-4 text-gray-800 text-center">Custom Controls (Responsive)</h3>
                    <PDFViewer
                        src={pdfBase64 ? undefined : pdfUrl}
                        base64={pdfBase64 || undefined}
                        width="100%"
                        height="70vh"
                        autoFitHeight={true}
                        controlsPosition="bottom"
                        controls={customControls}
                    />

                    {#snippet customControls({ currentPage, totalPages, scale, autoFitHeight, isRendering, prevPage, nextPage, zoomIn, zoomOut, resetZoom, toggleAutoFit }: { currentPage: number, totalPages: number, scale: number, autoFitHeight: boolean, isRendering: boolean, prevPage: () => void, nextPage: () => void, zoomIn: () => void, zoomOut: () => void, resetZoom: () => void, toggleAutoFit: () => void })}
                        <div class="flex items-center justify-between p-4 bg-white border-t border-gray-200">
                            <!-- Custom Page Navigation -->
                            <div class="flex items-center space-x-2">
                                <button
                                    onclick={prevPage}
                                    disabled={currentPage <= 1 || isRendering}
                                    class="px-4 py-2 text-sm font-semibold bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                ← 
                                </button>
                                <span class="text-sm font-medium text-gray-700 min-w-[140px] text-center bg-gray-50 px-3 py-2 rounded-full">
                                    Page {currentPage} of {totalPages}{isRendering ? ' (Loading...)' : ''}
                                </span>
                                <button
                                    onclick={nextPage}
                                    disabled={currentPage >= totalPages || isRendering}
                                    class="px-4 py-2 text-sm font-semibold bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                 →
                                </button>
                            </div>

                            <!-- Custom Zoom Controls -->
                            <div class="flex items-center space-x-2">
                                <button
                                    onclick={zoomOut}
                                    disabled={isRendering}
                                    class="px-3 py-2 text-sm font-semibold bg-orange-50 text-orange-700 rounded-full hover:bg-orange-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                −
                                </button>
                                <span class="text-sm font-medium text-gray-700 min-w-[60px] text-center bg-gray-50 px-3 py-2 rounded-full">
                                    {scale}%
                                </span>
                                <button
                                    onclick={zoomIn}
                                    disabled={isRendering}
                                    class="px-3 py-2 text-sm font-semibold bg-orange-50 text-orange-700 rounded-full hover:bg-orange-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                +
                                </button>
                                <button
                                    onclick={toggleAutoFit}
                                    disabled={isRendering}
                                    class="px-4 py-2 text-sm font-semibold {autoFitHeight ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'} disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed rounded-full transition-colors"
                                >
                                Auto Fit
                                </button>
                                <button
                                    onclick={resetZoom}
                                    disabled={isRendering}
                                    class="px-4 py-2 text-sm font-semibold bg-gray-50 text-gray-700 rounded-full hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                Reset
                                </button>
                            </div>
                        </div>
                    {/snippet}
                </div>

                <!-- Standard PDF Viewer with Default Controls -->
                <div class="flex flex-col">
                    <h3 class="text-lg font-semibold mb-4 text-gray-800 text-center">Default Controls (Fixed Size)</h3>
                    <PDFViewer
                        src={pdfBase64 ? undefined : pdfUrl}
                        base64={pdfBase64 || undefined}
                        width="100%"
                        height="70vh"
                        autoFitHeight={false}
                        controlsPosition="top"
                    />
                </div>

                <!-- PDF Accept Component for Document Workflows -->
                <div class="flex flex-col">
                    <h3 class="text-lg font-semibold mb-4 text-gray-800 text-center">PDF Accept (Sequential Navigation)</h3>
                    <PDFAccept
                        src={pdfBase64 ? undefined : pdfUrl}
                        base64={pdfBase64 || undefined}
                        width="100%"
                        height="70vh"
                        onComplete={handlePDFAcceptComplete}
                    />
                </div>

                <!-- Granular Disable Controls Demo - Viewer -->
                <div class="flex flex-col">
                    <h3 class="text-lg font-semibold mb-4 text-gray-800 text-center">Granular Disable - Viewer (No Prev/ZoomOut/Reset)</h3>
                    <PDFViewer
                        src={pdfBase64 ? undefined : pdfUrl}
                        base64={pdfBase64 || undefined}
                        width="100%"
                        height="70vh"
                        disableControls={{ prev: true, zoomOut: true, reset: true }}
                    />
                </div>

                <!-- Granular Disable Controls Demo - Accept -->
                <div class="flex flex-col">
                    <h3 class="text-lg font-semibold mb-4 text-gray-800 text-center">Granular Disable - Accept (No ZoomIn/Done)</h3>
                    <PDFAccept
                        src={pdfBase64 ? undefined : pdfUrl}
                        base64={pdfBase64 || undefined}
                        width="100%"
                        height="70vh"
                        disableControls={{ zoomIn: true, done: true }}
                        onComplete={handlePDFAcceptComplete}
                    />
                </div>
            </div>
        {:else}
            <div class="text-center text-gray-500 mt-12">
                <p>Select a PDF file or enter a URL to start viewing</p>
            </div>
        {/if}
    </div>
</div>
