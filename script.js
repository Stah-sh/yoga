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
        // Diese Logik dreht Hochformat-Seiten automatisch, falls vorhanden
        const initialViewport = page.getViewport({ scale: 1 });
        const isPortrait = initialViewport.height > initialViewport.width;
        const rotation = isPortrait ? 90 : 0;
        
        const devicePixelRatio = window.devicePixelRatio || 1;
        const viewportForScaling = page.getViewport({ scale: 1, rotation: rotation });

        // Wir benutzen Math.max, damit der Querformat-Bildschirm immer voll ausgefüllt wird ("cover"-Effekt)
        const scale = Math.max(
            document.body.clientWidth / viewportForScaling.width,
            document.body.clientHeight / viewportForScaling.height
        );
        
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
    
    // Initial rendern. Wenn im Hochformat, ist das Canvas eh unsichtbar.
    renderPage(1);

    document.addEventListener('click', showRandomPage);

    // Der 'resize'-Listener ist jetzt extrem wichtig. Er wird ausgelöst, wenn man das Gerät dreht!
    window.addEventListener('resize', () => {
        // Wir rendern die Seite neu, damit sie sich an die neuen Dimensionen anpasst.
        renderPage(currentPageNum)
    });

}).catch(console.error);