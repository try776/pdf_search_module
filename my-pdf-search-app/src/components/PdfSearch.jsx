import { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Worker Konfiguration
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

export default function PdfSearch({ pdfList = [], title = "PDF Durchsuchen" }) {
  const [pdfData, setPdfData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPages, setExpandedPages] = useState({});

  useEffect(() => {
    const loadPdfs = async () => {
      if (!pdfList || pdfList.length === 0) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        let allExtractedText = [];

        for (const pdfFile of pdfList) {
          const loadingTask = pdfjsLib.getDocument(pdfFile.url);
          const pdf = await loadingTask.promise;

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            let lastY, text = '';
            for (let item of textContent.items) {
              if (lastY !== item.transform[5] && lastY !== undefined) {
                text += '\n';
              }
              text += item.str + ' ';
              lastY = item.transform[5];
            }
            
            allExtractedText.push({ 
              id: `${pdfFile.title}-page-${i}`,
              pdfTitle: pdfFile.title,
              page: i, 
              text: text.trim() 
            });
          }
        }

        setPdfData(allExtractedText);
        setIsLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der PDFs:', error);
        setIsLoading(false);
      }
    };

    loadPdfs();
  }, [pdfList]);

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

  const toggleExpand = (id) => {
    setExpandedPages(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() 
            ? <mark key={i}>{part}</mark> 
            : part
        )}
      </span>
    );
  };

  return (
    <div className="search-container">
      
      {/* Sticky Header mit dem Suchfeld */}
      <div className="sticky-header">
        <h2 className="header-title">{title}</h2>
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>PDFs werden geladen und indexiert... Bitte warten.</p>
          </div>
        ) : (
          <input
            type="text"
            className="search-input"
            placeholder="Suchbegriff eingeben (z.B. 'gene' oder 'detox')..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        )}
      </div>

      {/* Suchergebnisse */}
      <div>
        {searchTerm && results.length > 0 && (
          <div className="results-info">
            Ergebnisse ({results.length} Seiten gefunden)
          </div>
        )}
        
        {results.map((result) => {
          const isExpanded = expandedPages[result.id];
          const matchIndex = result.text.toLowerCase().indexOf(searchTerm.toLowerCase());
          
          // Etwas großzügigerer Ausschnitt für besseren Kontext
          const snippetStart = Math.max(0, matchIndex - 80);
          const snippetEnd = matchIndex + 200;
          const snippet = result.text.substring(snippetStart, snippetEnd);

          return (
            <div className={`result-card ${isExpanded ? 'expanded' : ''}`} key={result.id}>
              <div className="result-header">
                <div className="result-title-group">
                  <h4 className="pdf-title">{result.pdfTitle}</h4>
                  <span className="page-badge">Seite {result.page}</span>
                </div>
                <button 
                  onClick={() => toggleExpand(result.id)}
                  className={`btn-toggle ${isExpanded ? 'active' : ''}`}
                >
                  {isExpanded ? 'Zuklappen' : 'Ganze Seite anzeigen'}
                </button>
              </div>

              <div className={`result-text ${isExpanded ? 'expanded-text' : ''}`}>
                {isExpanded ? (
                  highlightText(result.text, searchTerm)
                ) : (
                  <>
                    {snippetStart > 0 ? '...' : ''}
                    {highlightText(snippet, searchTerm)}
                    {snippetEnd < result.text.length ? '...' : ''}
                  </>
                )}
              </div>
            </div>
          );
        })}

        {searchTerm && results.length === 0 && !isLoading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <svg style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Keine Treffer für <strong>"{searchTerm}"</strong> gefunden.</p>
          </div>
        )}
      </div>
    </div>
  );
}