import PdfSearch from './components/PdfSearch';

export default function App() {
  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      {/* Du kannst pdfUrl und title dynamisch anpassen */}
      <PdfSearch 
        pdfUrl="/ZAppSequences-1.pdf" 
        title="Frequenz-Datenbank durchsuchen" 
      />
    </div>
  );
}