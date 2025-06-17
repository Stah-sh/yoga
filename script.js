// script.js

// ========= KONFIGURATION =========
const pdfPath = 'positions2.pdf';
// ===============================

const canvas = document.getElementById('pdf-canvas');
const ctx = canvas.getContext('2d');

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`;

let pdfDoc = null;
let pageCount = 0;
let currentPageNum = 1;

function renderPage(num) {
    if (!pdfDoc) return;

    currentPageNum = num;

    pdfDoc.getPage(num).then(page => {
        const initialViewport = page.getViewport({ scale: 1 });
        const isPortrait = initialViewport.height > initialViewport.width;
        const rotation = isPortrait ? 90 : 0;
        
        const devicePixelRatio = window.devicePixelRatio || 1;
        const viewportForScaling = page.getViewport({ scale: 1, rotation: rotation });

        // --- HIER IST DIE NEUE LOGIK: "FIT TO HEIGHT" ---
        // Die Skalierung wird NUR anhand der Höhe berechnet.
        const scale = document.body.clientHeight / viewportForScaling.height;
        // --------------------------------------------------
        
        const scaledViewport = page.getViewport({ 
            scale: scale * devicePixelRatio, 
            rotation: rotation 
        });

        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;

        canvas.style.height = `${scaledViewport.height / devicePixelRatio}px`;
        canvas.style.width = `${scaledViewport.width / devicePixelRatio}px`;

        const renderContext = {
            canvasContext: ctx,
            viewport: scaledViewport,
            renderInteractiveForms: false,
            enableWebGL: true
        };
        page.render(renderContext);
    });
}

function showRandomPage() {
    if (!pdfDoc || pageCount <= 1) return;
    
    let newPageNum;
    do {
        newPageNum = Math.floor(Math.random() * pageCount) + 1;
    } while (newPageNum === currentPageNum);

    renderPage(newPageNum);
}

pdfjsLib.getDocument(pdfPath).promise.then(doc => {
    pdfDoc = doc;
    pageCount = doc.numPages;
    console.log(`PDF erfolgreich geladen mit ${pageCount} Seiten.`);
    
    renderPage(1);

    document.addEventListener('click', showRandomPage);
    window.addEventListener('resize', () => renderPage(currentPageNum));

}).catch(console.error);