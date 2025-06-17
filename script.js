// script.js

// ========= KONFIGURATION =========
const pdfPath = 'positions3.pdf'; // Sicherstellen, dass der Pfad korrekt ist!
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
        // Diese Logik dreht Hochformat-Seiten der PDF automatisch
        const initialViewport = page.getViewport({ scale: 1 });
        const isPortraitPdfPage = initialViewport.height > initialViewport.width;
        const rotation = isPortraitPdfPage ? 90 : 0;
        
        const devicePixelRatio = window.devicePixelRatio || 1;
        const viewportForScaling = page.getViewport({ scale: 1, rotation: rotation });

        // --- HIER IST DIE ENTSCHEIDENDE ÄNDERUNG FÜR "CONTAIN" ---
        // Wir verwenden Math.min, damit die Seite immer komplett sichtbar ist und nie abgeschnitten wird.
        const scale = Math.min(
            document.body.clientWidth / viewportForScaling.width,
            document.body.clientHeight / viewportForScaling.height
        );
        // -----------------------------------------------------------
        
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
            viewport: scaledViewport
        };
        page.render(renderContext);
    });
}

function showRandomPage(event) {
    // Verhindere Klicks, wenn das Overlay aktiv ist (wichtig für die Logik)
    if (window.matchMedia("(orientation: portrait)").matches) {
        return;
    }
    
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
    
    // Initial rendern (ist unsichtbar, falls im Hochformat)
    renderPage(1);

    document.addEventListener('click', showRandomPage);

    // Der 'resize'-Listener kümmert sich um das Drehen des Geräts
    window.addEventListener('resize', () => {
        renderPage(currentPageNum);
    });

}).catch(console.error);