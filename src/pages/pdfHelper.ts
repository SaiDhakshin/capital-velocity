// pdfHelper.ts
// single-file helper you can import in TransactionsPage.tsx

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';               // stable browser bundle
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.js?url'; // Vite-friendly worker import

// Ensure pdfjs uses the bundled worker URL we imported above
// For bundlers like Vite, '?url' returns a URL string to the worker file.
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfWorker as unknown as string;

export async function extractTextFromPdfArrayBuffer(arrayBuffer: ArrayBuffer, password?: string) {
  // getDocument supports a `password` property and `onPassword` callback
  const loadingTask = (pdfjsLib as any).getDocument({
    data: arrayBuffer,
    password,
    // optional: onPassword callback (pdf.js will call this on encrypted PDFs needing a prompt)
    // onPassword: (updatePassword: (p: string) => void, reason: number) => { /* optionally call updatePassword */ }
  });

  // this will reject if password is wrong or file is damaged
  const pdf = await loadingTask.promise as unknown as {
    numPages: number;
    getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: any[] }> }>;
  };

  const pageTexts: string[] = [];
  for (let i = 1; i <= (pdf as any).numPages; i++) {
    const page = await (pdf as any).getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((it: any) => it.str || '').join(' ');
    pageTexts.push(strings);
  }

  return pageTexts.join('\n');
}
