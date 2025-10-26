<script lang="ts">
    //spell-checker: disable
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

<div class="h-[100vh] bg-gray-50 py-8">
    <div class="container mx-auto px-4 border-2 border-amber-200 h-[80vh] w-[330px]">
        <h3 class="text-lg font-semibold mb-4 text-gray-800 text-center">PDF Accept (Sequential Navigation)</h3>
        <PDFAccept
            src={pdfBase64 ? undefined : pdfUrl}
            base64={pdfBase64 || undefined}
            width="100%"
            height="600px"
            onComplete={handlePDFAcceptComplete}
            controlsPosition="top"
        />
    </div>
</div>
