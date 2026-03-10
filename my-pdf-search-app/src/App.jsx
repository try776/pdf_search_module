import PdfSearch from './components/PdfSearch';
import './App.css';

export default function App() {
  // Erkennt, ob die Seite innerhalb eines iFrames geladen wird
  const isEmbedded = window.self !== window.top;

  // Liste aller deiner PDFs aus dem public-Ordner
  const pdfFiles = [
    { url: "/ZAppSequences-1.pdf", title: "ZApp Sequences" },
    { url: "/Full List Royal Rife Frequencies.pdf", title: "Royal Rife Frequencies" },
    { url: "/new_a5_The+DNA-related+Pathogen+Frequency+Sets_v1.pdf", title: "DNA Pathogen Sets" }
  ];

  return (
    <div style={{ 
      padding: isEmbedded ? '0' : '20px 10px', // Kein Padding im iFrame, schmal auf Mobile
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start', // Zwingt den Content nach oben, nicht in die Mitte
      backgroundColor: isEmbedded ? 'transparent' : 'var(--bg-color)' // Transparent im iFrame
    }}>
      <PdfSearch 
        pdfList={pdfFiles} 
        title="Frequenz-Datenbank durchsuchen" 
      />
    </div>
  );
}