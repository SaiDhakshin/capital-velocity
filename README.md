# Capital Velocity

Capital Velocity is a lightweight, client-first personal finance web app built with React, Vite, and TypeScript. It helps you import and analyze bank statements, mutual fund CAS reports, and other financial documents using client-side parsing and AI-based extraction.

This README documents how to run the project, the important architectural decisions (PDF handling and AI parsing), developer notes, and security considerations.

--

## Features

- Import documents: PDF (statements, CAS), Excel (XLSX), CSV, and images (receipts).
- AI parsing: Uses a parsing service (`geminiService`) to extract transactions, assets, and liabilities from text or CSV.
- Local storage: Lightweight ledger persisted in browser `localStorage` via `storageService`.
- Developer seeding toggle: sample data may be seeded only in DEV or when explicitly enabled.
- UI: Inline editing of assets & liabilities, dashboard empty-state CTA, CAMS (mock) integration.

## Repo structure (important files)

- `src/` — main app code

  - `pages/TransactionsPage.tsx` — document upload, PDF/XLSX processing, AI preview/import UI
  - `pages/AssetsPage.tsx` — asset/liability list and inline edit UI
  - `pages/DashboardPage.tsx` — main dashboard and empty-state CTA
  - `services/storageService.ts` — local persistence, import/override logic, seed toggles
  - `services/geminiService.ts` — AI parsing integration (abstracted)
  - `services/camsAdapter.ts` — mock CAMS import helper
  - `components/` — small presentational components and UI primitives
  - `types.ts` — shared TypeScript domain types (Transaction, Asset, Liability, etc.)

- `index.html`, `vite.config.ts` — app entry and Vite config
- `package.json` — dependencies (includes `pdfjs-dist` for PDF.js fallback)
- `postcss.config.cjs`, `tailwind.config.cjs`, `src/index.css` — styling and Tailwind setup

## Local setup

Requirements:

- Node.js (>=16 LTS recommended)

Install dependencies:

```bash
npm install
```

Start dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run preview of build:

```bash
npm run preview
```

## Important runtime notes: PDF handling & AI parsing

The app attempts to parse uploaded documents in this order:

1. PDF: first try `pdf-lib` to open and read simple PDFs (fast). If the PDF is encrypted or `pdf-lib` can't parse it, the app falls back to `pdfjs-dist` (PDF.js) to attempt decryption and text extraction.
2. XLSX: processed via `xlsx` and converted to CSV text for AI parsing.
3. Images / CSV: read as base64 and forwarded to the AI parser.

Design constraints and security guidance:

- Never send user passwords to third-party AI providers. If a PDF is encrypted, the app should ask the user for the password and decrypt locally (preferred) or decrypt on a trusted server you operate.
- Only send extracted text (UTF-8/base64) or parsed JSON to the AI parser — avoid sending raw PDFs unless absolutely necessary and consented.
- The repo includes a client-side fallback using dynamic imports of `pdfjs-dist`. If dynamic import fails in some environments, consider statically importing the supported `pdfjs-dist/legacy/build/pdf` entry in the client or providing a server-side decrypt endpoint.

## AI integration flow

- The app sends extracted text (or CSV) as base64-UTF8 to `geminiService.parseFinancialDocument(base64, mimeType)` which returns structured data with `transactions`, `assets`, and `liabilities`.
- There is an `autoImport` toggle in the UI. When disabled, the app shows an AI-parsed preview and requires user confirmation (Import / Reject) before writing to local storage.

## Dev features & toggles

- Developer seeding: seeding of demo data is only enabled in `import.meta.env.DEV` or via a runtime toggle stored in `localStorage` (`cv_enable_seed`). Controlled via `storageService.setSeedEnabled()` / `isSeedEnabled()`.
- Debugging PDF.js: the dynamic PDF.js loader logs which candidate path was used (console debug). This helps when environments bundle `pdfjs-dist` differently.

## Running & testing PDF flows locally

1. Start dev server.
2. Use the `Transactions` page to upload PDF/XLSX files.
3. If a PDF is encrypted the UI will prompt for the password. Enter the password — the app will attempt a client-side decrypt/extract and then present AI results.

If you see `PDF.js not available` in console logs in your browser, try the following:

- Ensure `pdfjs-dist` is installed (`npm i pdfjs-dist`).
- If dynamic import still fails in your environment, switch to a static import of the `legacy` PDF.js build in the client or call a small server-side decrypt endpoint (example code below) to extract text and return it to the client.

## Example server-side decrypt endpoint (Node/Express sketch)

This is optional: if you cannot rely on a client-side PDF.js, you can add a minimal secure endpoint to decrypt/extract text on your server and return the text to the client for AI parsing. DO NOT send passwords to third-party AI services.

```js
// server-decrypt.js (sketch)
const express = require("express");
const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");
const app = express();
app.use(express.json({ limit: "50mb" }));

app.post("/api/decrypt-pdf", async (req, res) => {
  try {
    const { base64, password } = req.body; // base64 PDF and user-supplied password
    const data = Buffer.from(base64, "base64");
    const loadingTask = pdfjs.getDocument({ data, password });
    const pdf = await loadingTask.promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((it) => it.str || "").join(" ") + "\n";
    }
    res.json({ text });
  } catch (err) {
    res.status(400).json({ error: String(err.message || err) });
  }
});

app.listen(3000);
```

Security: use HTTPS, limit retention of uploaded files, and log minimally. Explicitly display consent to the user before uploading encrypted documents to your server.

## Contributing

- Follow existing code style (TSX + Tailwind). Keep changes small and focused.
- When modifying domain types, update `src/types.ts` and ensure imports that are only types are `import type {...}` to avoid runtime import emission.

## License

This project does not include an explicit license file; add one if you plan to open-source or share the project.

--

If you'd like, I can:

- Add the `looksEncryptedPDF` helper and wire it into `TransactionsPage.tsx` to detect encryption earlier, or
- Add the server decrypt endpoint plus client fallback code, or
- Run the dev server and validate an encrypted PDF flow locally.

Tell me which next step you prefer and I will implement it.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
