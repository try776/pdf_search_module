import { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Worker Konfiguration
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

export default function PdfSearch({ pdfUrl, title = "PDF Durchsuchen" }) {
  const [pdfData, setPdfData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPages, setExpandedPages] = useState({}); // Tracking für aufgeklappte Seiten

  // Erkennen für iFrame/Embed Styling
  const isEmbedded = window.self !== window.top;

  useEffect(() => {
    const loadPdf = async () => {
      if (!pdfUrl) return;
      
      try {
        setIsLoading(true);
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;

        const extractedText = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          // Gruppierung nach Zeilen (Y-Koordinate), um Struktur zu erhalten
          let lastY, text = '';
          for (let item of textContent.items) {
            if (lastY !== item.transform[5] && lastY !== undefined) {
              text += '\n';
            }
            text += item.str + ' ';
            lastY = item.transform[5];
          }
          
          extractedText.push({ page: i, text: text.trim() });
        }

        setPdfData(extractedText);
        setIsLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der PDF:', error);
        setIsLoading(false);
      }
    };

    loadPdf();
  }, [pdfUrl]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const lowerCaseTerm = searchTerm.toLowerCase();
    const filtered = pdfData.filter((pageData) =>
      pageData.text.toLowerCase().includes(lowerCaseTerm)
    );

    setResults(filtered);
  }, [searchTerm, pdfData]);

  const toggleExpand = (pageNumber) => {
    setExpandedPages(prev => ({
      ...prev,
      [pageNumber]: !prev[pageNumber]
    }));
  };

  // Hilfsfunktion zum Markieren des Suchbegriffs im Text
  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() 
            ? <mark key={i} style={{ backgroundColor: '#ffeb3b', padding: '2px', borderRadius: '2px', color: '#000' }}>{part}</mark> 
            : part
        )}
      </span>
    );
  };

  return (
    <div style={{ 
      padding: isEmbedded ? '10px' : '20px', 
      fontFamily: 'system-ui, sans-serif', 
      width: '100%',
      maxWidth: '800px', 
      margin: '0 auto', 
      border: isEmbedded ? 'none' : '1px solid #eee', // Kein Rahmen im iFrame
      borderRadius: isEmbedded ? '0' : '12px',
      backgroundColor: isEmbedded ? 'transparent' : '#fff', // Passt sich Host-Seite an
      boxShadow: isEmbedded ? 'none' : '0 4px 12px rgba(0,0,0,0.05)'
    }}>
      <h2 style={{ marginTop: 0, fontSize: '1.5rem', wordBreak: 'break-word' }}>{title}</h2>

      {isLoading ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          <p>PDF wird geladen und indexiert... Bitte warten.</p>
        </div>
      ) : (
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Suchbegriff eingeben..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              padding: '14px', 
              width: '100%', 
              fontSize: '16px', // 16px verhindert Auto-Zoom auf iOS!
              borderRadius: '8px',
              border: '1px solid #ccc',
              boxSizing: 'border-box',
              outline: 'none',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
              backgroundColor: '#fff',
              color: '#333'
            }}
          />
        </div>
      )}

      <div>
        {searchTerm && results.length > 0 && (
          <h3 style={{ fontSize: '1.1rem', color: '#333' }}>
            Ergebnisse ({results.length} Seiten gefunden):
          </h3>
        )}
        
        {results.map((result) => {
          const isExpanded = expandedPages[result.page];
          const matchIndex = result.text.toLowerCase().indexOf(searchTerm.toLowerCase());
          const snippetStart = Math.max(0, matchIndex - 60);
          const snippetEnd = matchIndex + 150;
          const snippet = result.text.substring(snippetStart, snippetEnd);

          return (
            <div 
              key={result.page} 
              style={{ 
                border: '1px solid #eaeaea', 
                borderRadius: '8px',
                padding: '15px', 
                margin: '10px 0',
                backgroundColor: isExpanded ? '#fff' : '#fcfcfc',
                boxShadow: isExpanded ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s ease',
                color: '#333'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '12px',
                flexWrap: 'wrap', // Erlaubt den Umbruch auf sehr kleinen Handy-Displays
                gap: '10px'
              }}>
                <h4 style={{ margin: 0, fontSize: '1rem' }}>Seite {result.page}</h4>
                <button 
                  onClick={() => toggleExpand(result.page)}
                  style={{
                    background: '#0070f3',
                    color: 'white',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    flexShrink: 0 // Verhindert, dass der Button zusammengequetscht wird
                  }}
                >
                  {isExpanded ? 'Schließen' : 'Ganze Seite anzeigen'}
                </button>
              </div>

              <p style={{ 
                margin: 0, 
                lineHeight: '1.6', 
                color: '#444', 
                fontSize: '0.95rem',
                wordBreak: 'break-word', // Verhindert, dass lange Wörter das Layout sprengen
                whiteSpace: isExpanded ? 'pre-wrap' : 'normal' 
              }}>
                {isExpanded ? (
                  highlightText(result.text, searchTerm)
                ) : (
                  <>
                    {snippetStart > 0 ? '...' : ''}
                    {highlightText(snippet, searchTerm)}
                    {snippetEnd < result.text.length ? '...' : ''}
                  </>
                )}
              </p>
            </div>
          );
        })}

        {searchTerm && results.length === 0 && !isLoading && (
          <p style={{ color: '#d9534f', textAlign: 'center', marginTop: '20px', padding: '10px' }}>
            Keine Treffer für "{searchTerm}" gefunden.
          </p>
        )}
      </div>
    </div>
  );
}