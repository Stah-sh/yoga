// ========= KONFIGURATION =========
// Gib hier den Pfad zu deiner PDF-Datei an.
const pdfPath = 'positions2.pdf';
// ===============================


// Elemente aus dem HTML holen
const canvas = document.getElementById('pdf-canvas');
const ctx = canvas.getContext('2d');

// Wichtige Einstellung für pdf.js, um den "Worker" zu finden
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`;

// Globale Variablen, um das PDF-Dokument und die Seitenzahl zu speichern
let pdfDoc = null;
let pageCount = 0;
let currentPageNum = 1; // Startet mit der ersten Seite

// Funktion zum Anzeigen einer bestimmten Seite
function renderPage(num) {
    if (!pdfDoc) {
        return; // Stellt sicher, dass das PDF geladen ist
    }
    
    // Speichert die aktuell angezeigte Seite
    currentPageNum = num;

    // Holt die gewünschte Seite aus dem PDF-Dokument
    pdfDoc.getPage(num).then(page => {
        // Skalierung berechnen, damit die Seite auf den Bildschirm passt
        const viewport = page.getViewport({ scale: 1.0 });
        const scale = Math.min(canvas.width / viewport.width, canvas.height / viewport.height);
        const scaledViewport = page.getViewport({ scale: scale });

        // Canvas-Größe an die PDF-Seitengröße anpassen
        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;

        // Die Seite auf das Canvas zeichnen
        const renderContext = {
            canvasContext: ctx,
            viewport: scaledViewport
        };
        page.render(renderContext);
    });
}

// Funktion zum Anzeigen einer zufälligen Seite
function showRandomPage() {
    if (!pdfDoc) {
        return;
    }
    
    // Wähle eine neue, zufällige Seitenzahl
    // Stelle sicher, dass nicht dieselbe Seite erneut gewählt wird
    let newPageNum;
    do {
        newPageNum = Math.floor(Math.random() * pageCount) + 1;
    } while (pageCount > 1 && newPageNum === currentPageNum);

    // Zeige die neue Seite an
    renderPage(newPageNum);
}


// Das PDF-Dokument laden (asynchron)
pdfjsLib.getDocument(pdfPath).promise.then(doc => {
    pdfDoc = doc;
    pageCount = doc.numPages;
    console.log(`PDF erfolgreich geladen mit ${pageCount} Seiten.`);
    
    // Die erste Seite initial anzeigen
    renderPage(1);

}).catch(console.error);


// Event-Listener für Klicks/Taps auf der gesamten Seite
document.addEventListener('click', () => {
    showRandomPage();
});