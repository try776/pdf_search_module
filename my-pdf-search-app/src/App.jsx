import PdfSearch from './components/PdfSearch';
import './App.css';

export default function App() {
  const pdfFiles = [
    { url: "/ZAppSequences-1.pdf", title: "ZApp Sequences" },
    { url: "/Full List Royal Rife Frequencies.pdf", title: "Royal Rife Frequencies" },
    { url: "/new_a5_The+DNA-related+Pathogen+Frequency+Sets_v1.pdf", title: "DNA Pathogen Sets" }
  ];

  return (
    <div className="app-wrapper">
      <PdfSearch 
        pdfList={pdfFiles} 
        title="Frequenz-Datenbank durchsuchen" 
      />
    </div>
  );
}