import PdfSearch from './components/PdfSearch';
import './App.css';

export default function App() {
  // Erkennt, ob die Seite innerhalb eines iFrames geladen wird
  const isEmbedded = window.self !== window.top;

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
        pdfUrl="/ZAppSequences-1.pdf" 
        title="Frequenz-Datenbank durchsuchen" 
      />
    </div>
  );
}