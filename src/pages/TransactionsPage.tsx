import React, { useState, useRef } from 'react';
import type { Transaction } from '../types';
import { TransactionType } from '../types';
import { dataService } from '../services/storageService';
import { mockCamsFetch } from '../services/camsAdapter';
import { geminiService } from '../services/geminiService';
import { Card, Button, Input } from '../components/ui';
import { formatCurrency } from '../utils';

// Declarations for external libraries added in index.html
import * as XLSX from 'xlsx';
import * as PDFLib from 'pdf-lib';

interface Props {
  transactions: Transaction[];
  onUpdate: () => void;
}

const TransactionsPage: React.FC<Props> = ({ transactions, onUpdate }) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  
  // File Upload State
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [importMode, setImportMode] = useState<'append' | 'override'>('append');
  
  // Staging Area for Batch Upload
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);

  // Password Handling
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [pdfPassword, setPdfPassword] = useState('');
  const pendingFileRef = useRef<File | null>(null);
  const fileQueueRef = useRef<File[]>([]);

  // AA State
  const [isSyncingAA, setIsSyncingAA] = useState(false);
  const [aaStep, setAaStep] = useState<'idle' | 'consent' | 'fetching'>('idle');

  // --- Document Analysis Logic ---
  
  const processAndSendToGemini = async (base64Data: string, mimeType: string) => {
    try {
        const result = await geminiService.parseFinancialDocument(base64Data, mimeType);
        
        const txCount = result.transactions?.length || 0;
        const assetCount = result.assets?.length || 0;
        const liabCount = result.liabilities?.length || 0;

        // If appended, let storage service handle duplicates
        // Note: override only happens on the FIRST file of a batch if mode is override.
        // Subsequent files in the queue must append to that first result.
        const isFirstFileOfOverride = importMode === 'override' && fileQueueRef.current.length === stagedFiles.length - 1; 

        // However, since we clear stagedFiles on start, we can't easily track "first file" this way.
        // Instead, we rely on the fact that `dataService.overrideData` replaces everything.
        // Strategy: 
        // 1. If mode is override, we should ideally clear DB *once* before processing batch.
        // 2. But to keep it simple: We treat "Override" as "Clear before first file, then append others".
        // Implementation: We will handle the "Clear" action in `startBatchAnalysis` before processing starts.

        await dataService.importExternalData(
            result.assets || [],
            result.transactions || [],
            result.liabilities || []
        );
        
        setImportStatus(`Processed: ${txCount} Txns, ${assetCount} Assets found.`);
        onUpdate();
    } catch (err: any) {
        console.error(err);
        setImportStatus(`Analysis Failed: ${err.message || 'Unknown error'}`);
    } finally {
        // If queue has more, process next
        if (fileQueueRef.current.length > 0) {
           processNextFile();
        } else {
           setIsProcessingFile(false);
           setTimeout(() => setImportStatus(null), 5000);
        }
    }
  };

  const processPDF = async (arrayBuffer: ArrayBuffer, password?: string) => {
      try {
          // Attempt to load the PDF
          let pdfDoc;
          try {
             if (password) {
                 pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer, { password });
             } else {
                 pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
             }
          } catch (e: any) {
              if (e.message && (e.message.includes('encrypted') || e.message.includes('Password'))) {
                  setPasswordRequired(true);
                  setIsProcessingFile(false); // Stop spinner, wait for user input
                  return;
              }
              throw e;
          }

          const savedBase64 = await pdfDoc.saveAsBase64();
          
          // Clear password state if successful
          setPasswordRequired(false);
          setPdfPassword('');
          pendingFileRef.current = null;
          
          await processAndSendToGemini(savedBase64, 'application/pdf');

      } catch (err: any) {
          setIsProcessingFile(false);
          setImportStatus(`PDF Error: ${err.message}`);
          // Proceed to next even on error
          if (fileQueueRef.current.length > 0) processNextFile();
      }
  };

  const processXLSX = async (arrayBuffer: ArrayBuffer) => {
      try {
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const csvText = XLSX.utils.sheet_to_csv(worksheet);
          
          const base64Data = btoa(csvText);
          await processAndSendToGemini(base64Data, 'text/csv');
      } catch (err: any) {
          setIsProcessingFile(false);
          setImportStatus(`Excel Error: ${err.message}`);
          if (fileQueueRef.current.length > 0) processNextFile();
      }
  };

  const processNextFile = async () => {
     const file = fileQueueRef.current.shift();
     if (!file) return;

     setIsProcessingFile(true);
     setImportStatus(`Processing ${file.name}...`);
     setPasswordRequired(false);
     pendingFileRef.current = file;

     const reader = new FileReader();
     reader.onload = async (e) => {
       try {
         const arrayBuffer = e.target?.result as ArrayBuffer;
         
         if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
             await processPDF(arrayBuffer);
         } 
         else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.type.includes('spreadsheet') || file.type.includes('excel')) {
             await processXLSX(arrayBuffer);
         }
         else {
              // Fallback for Images / CSV
              const base64Reader = new FileReader();
              base64Reader.onload = (ev) => {
                  const base64Data = (ev.target?.result as string).split(',')[1];
                  processAndSendToGemini(base64Data, file.type);
              };
              base64Reader.readAsDataURL(file);
         }
 
       } catch (err: any) {
         setIsProcessingFile(false);
         setImportStatus(`Error: ${err.message}`);
         if (fileQueueRef.current.length > 0) processNextFile();
       }
     };
     reader.readAsArrayBuffer(file);
  };

  // --- Staging Logic ---

  const handleFiles = (files: FileList) => {
      const newFiles = Array.from(files);
      setStagedFiles(prev => [...prev, ...newFiles]);
  };

  const removeStagedFile = (index: number) => {
      setStagedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startBatchAnalysis = async () => {
      if (stagedFiles.length === 0) return;

      if (importMode === 'override') {
          // Clear DB once before starting the batch
          await dataService.overrideData([], [], []);
          setImportStatus('Ledger cleared. Starting batch import...');
      }

      // Move staged files to queue
      stagedFiles.forEach(f => fileQueueRef.current.push(f));
      
      // Clear stage
      setStagedFiles([]);

      // Start processing
      processNextFile();
  };

  const handlePasswordSubmit = () => {
      if (pendingFileRef.current && pdfPassword) {
          setIsProcessingFile(true);
          const reader = new FileReader();
          reader.onload = async (e) => {
             const arrayBuffer = e.target?.result as ArrayBuffer;
             await processPDF(arrayBuffer, pdfPassword);
          };
          reader.readAsArrayBuffer(pendingFileRef.current);
      }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // CAMS / AA Handler
  const handleCamsSync = async () => {
    setAaStep('fetching');
    try {
        const { assets, transactions } = await mockCamsFetch();
        await dataService.importExternalData(assets, transactions);
        onUpdate();
        setIsSyncingAA(false);
        setAaStep('idle');
        setImportStatus(`Successfully synced ${assets.length} Mutual Funds and ${transactions.length} recent entries via CAMS.`);
        setTimeout(() => setImportStatus(null), 5000);
    } catch (e) {
        setImportStatus('Failed to sync with Account Aggregator.');
    }
  };

  return (
    <div className="space-y-10">
      <div className="border-b border-ink/10 pb-4">
        <h1 className="text-4xl font-serif font-bold text-ink">Transaction Ledger</h1>
        <p className="text-ink/50 font-serif italic mt-1">A record of all financial movements.</p>
      </div>
      
      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* 1. Smart Document Upload */}
          <Card title="Smart Document Upload" className="bg-paper-dark">
            <div className="mb-4">
               <p className="text-sm text-ink/70 font-serif mb-4 italic">
                  Upload Bank Statements, CDSL Reports (PDF), Excel (XLSX), or Receipts. AI will extract line items.
               </p>
               
               {/* Mode Selection */}
               <div className="flex gap-4 mb-4 text-sm font-serif">
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="importMode" 
                      checked={importMode === 'append'} 
                      onChange={() => setImportMode('append')}
                      className="mr-2 accent-ink" 
                    />
                    <span>Append to existing</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="importMode" 
                      checked={importMode === 'override'} 
                      onChange={() => setImportMode('override')}
                      className="mr-2 accent-ink" 
                    />
                    <span>Override (Clear all first)</span>
                  </label>
               </div>

               {/* Drop Zone */}
               {passwordRequired ? (
                   <div className="w-full border-2 border-dashed border-accent-gold bg-paper-contrast p-6 text-center animate-fade-in">
                       <p className="font-bold text-ink mb-2">🔒 Encrypted PDF</p>
                       <p className="text-xs text-ink/60 mb-4">Please enter the password to unlock this document.</p>
                       <Input 
                          type="password" 
                          placeholder="Document Password" 
                          value={pdfPassword} 
                          onChange={(e) => setPdfPassword(e.target.value)} 
                          className="text-center"
                       />
                       <div className="flex justify-center gap-2 mt-2">
                           <Button variant="secondary" onClick={() => { setPasswordRequired(false); setPdfPassword(''); pendingFileRef.current = null; }}>Cancel</Button>
                           <Button onClick={handlePasswordSubmit}>Unlock & Process</Button>
                       </div>
                   </div>
               ) : (
                   <div 
                    className={`
                        w-full h-32 border-2 border-dashed transition-all flex flex-col items-center justify-center text-center p-4 cursor-pointer
                        ${isDragOver ? 'border-ink bg-ink/5' : 'border-ink/20 bg-paper-contrast'}
                        ${isProcessingFile ? 'opacity-50 pointer-events-none' : ''}
                    `}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => document.getElementById('fileInput')?.click()}
                    >
                    {isProcessingFile ? (
                    <div className="animate-pulse">
                        <span className="text-2xl block mb-2">⚙️</span>
                        <p className="text-sm font-bold font-serif">Processing Queue...</p>
                        <p className="text-xs text-ink/40 mt-1">Normalizing & Analyzing...</p>
                    </div>
                    ) : (
                    <>
                        <span className="text-2xl text-ink/30 mb-2">📄</span>
                        <p className="font-bold font-serif text-ink">Drop files here or Click to Select</p>
                        <p className="text-xs text-ink/50 mt-1">Multiple files supported (PDF, XLSX, CSV)</p>
                    </>
                    )}
                    <input 
                    id="fileInput" 
                    type="file" 
                    className="hidden" 
                    multiple
                    accept=".pdf,.csv,.jpg,.jpeg,.png,.xlsx,.xls"
                    onChange={(e) => e.target.files && e.target.files.length > 0 && handleFiles(e.target.files)} 
                    />
                </div>
               )}

               {/* Staged Files List */}
               {stagedFiles.length > 0 && !isProcessingFile && (
                   <div className="mt-4 bg-paper-contrast border border-ink/10 p-3">
                       <p className="text-xs font-serif font-bold uppercase text-ink/50 mb-2">Files to Process ({stagedFiles.length})</p>
                       <ul className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                           {stagedFiles.map((f, i) => (
                               <li key={i} className="flex justify-between items-center text-sm font-serif border-b border-ink/5 pb-1 last:border-0">
                                   <span className="truncate w-3/4">{f.name}</span>
                                   <button 
                                      onClick={() => removeStagedFile(i)}
                                      className="text-accent-red hover:text-ink text-xs font-bold px-2"
                                   >
                                       ✕
                                   </button>
                               </li>
                           ))}
                       </ul>
                       <div className="mt-4 flex justify-end">
                           <Button onClick={startBatchAnalysis} className="w-full">
                               Analyze {stagedFiles.length} File{stagedFiles.length > 1 ? 's' : ''}
                           </Button>
                       </div>
                   </div>
               )}
            </div>
          </Card>

          {/* 2. CAMS / Account Aggregator */}
          <Card title="India Account Aggregator" className="bg-paper-contrast relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                 <span className="text-6xl">🇮🇳</span>
             </div>
             <p className="text-sm text-ink/70 font-serif italic mb-6">
                 Connect CAMSFinServ or other Account Aggregators to automatically sync Mutual Funds, Stocks, and Bank Deposits.
             </p>
             
             {!isSyncingAA ? (
                 <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 border border-ink/10 p-3 rounded-sm bg-paper-dark">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-ink/10 font-bold text-xs">CAMS</div>
                        <div className="flex-1">
                            <p className="font-bold text-sm">CAMS Finserv</p>
                            <p className="text-xs text-ink/50">Mutual Funds & Insurance</p>
                        </div>
                        <Button variant="secondary" onClick={() => setIsSyncingAA(true)} className="text-xs py-1 px-3">Connect</Button>
                    </div>
                    <div className="flex items-center gap-4 border border-ink/10 p-3 rounded-sm bg-paper-dark opacity-50 cursor-not-allowed">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-ink/10 font-bold text-xs">NSDL</div>
                        <div className="flex-1">
                            <p className="font-bold text-sm">NSDL CAS</p>
                            <p className="text-xs text-ink/50">Coming soon</p>
                        </div>
                        <span className="text-[10px] uppercase font-bold border border-ink/20 px-2 py-1">Waitlist</span>
                    </div>
                 </div>
             ) : (
                 <div className="bg-paper-dark p-4 border border-ink/10 text-center animate-pulse">
                     {aaStep === 'consent' && (
                         <div>
                             <p className="font-bold mb-2">Requesting Consent...</p>
                             <p className="text-xs italic">Please approve the request sent to your mobile ending in ****</p>
                         </div>
                     )}
                     {aaStep === 'fetching' && (
                         <div className="py-4">
                             <div className="w-6 h-6 border-2 border-ink border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                             <p className="font-serif italic text-sm">Securely fetching portfolio data...</p>
                         </div>
                     )}
                     
                     {aaStep === 'idle' && (
                         <div className="space-y-4">
                             <p className="text-sm font-bold">Authenticate with AA</p>
                             <Input placeholder="Mobile Number (+91)" className="text-center" />
                             <div className="flex justify-center gap-2">
                                <Button variant="secondary" onClick={() => setIsSyncingAA(false)}>Cancel</Button>
                                <Button onClick={handleCamsSync}>Send OTP</Button>
                             </div>
                         </div>
                     )}
                 </div>
             )}
          </Card>
      </div>

      {importStatus && <p className="text-accent-green text-center text-lg mt-4 font-serif italic">{importStatus}</p>}

      <div className="bg-paper-contrast border border-ink/10 p-6">
        <h3 className="text-xl font-serif font-bold text-ink mb-6">Recent Activity</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b-2 border-ink text-ink">
                <th className="pb-3 font-serif font-bold uppercase text-xs tracking-widest w-32">Date</th>
                <th className="pb-3 font-serif font-bold uppercase text-xs tracking-widest">Description</th>
                <th className="pb-3 font-serif font-bold uppercase text-xs tracking-widest">Category</th>
                <th className="pb-3 font-serif font-bold uppercase text-xs tracking-widest">Class</th>
                <th className="pb-3 font-serif font-bold uppercase text-xs tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {transactions.map(t => (
                <tr key={t.id} className="hover:bg-paper-dark transition-colors">
                  <td className="py-4 text-ink/60 font-serif text-sm tabular-nums">{t.date}</td>
                  <td className="py-4 font-serif font-bold text-ink text-lg">{t.description}</td>
                  <td className="py-4 text-ink/60">
                    <span className="font-serif italic text-sm">{t.category}</span>
                  </td>
                  <td className="py-4">
                     <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 border ${
                       t.type === TransactionType.INCOME ? 'border-accent-green text-accent-green' :
                       t.type === TransactionType.EXPENSE ? 'border-accent-red text-accent-red' :
                       t.type === TransactionType.ASSET_PURCHASE ? 'border-accent-blue text-accent-blue' :
                       'border-accent-gold text-accent-gold'
                     }`}>
                       {t.type.replace('_', ' ')}
                     </span>
                  </td>
                  <td className={`py-4 text-right font-serif font-bold text-lg tabular-nums ${t.amount > 0 ? 'text-accent-green' : 'text-ink'}`}>
                    {t.amount > 0 ? '+' : ''}{formatCurrency(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && <p className="text-center text-ink/30 py-12 font-serif italic text-lg">The ledger is empty.</p>}
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;