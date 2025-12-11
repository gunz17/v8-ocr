import React from "react";
import OCRUpload from "./pages/OCRUpload";
import OCRReview from "./pages/OCRReview";
import MappingManager from "./pages/MappingManager";
import POSPage from "./pages/POSPage";
import StockSync from "./pages/StockSync";
import PeakExport from "./pages/PeakExport";

export default function App() {
  const [page, setPage] = React.useState("ocr");

  return (
    <div style={{ padding: 20 }}>
      <h1>Gracie OCR Console V8</h1>

      <nav style={{ marginBottom: 20 }}>
        <button onClick={() => setPage("ocr")}>OCR Upload</button>
        <button onClick={() => setPage("review")}>OCR Review</button>
        <button onClick={() => setPage("mapping")}>Mapping Manager</button>
        <button onClick={() => setPage("pos")}>POS</button>
        <button onClick={() => setPage("stock")}>Stock Sync</button>
        <button onClick={() => setPage("peak")}>PEAK Export</button>
      </nav>

      {page === "ocr" && <OCRUpload />}
      {page === "review" && <OCRReview />}
      {page === "mapping" && <MappingManager />}
      {page === "pos" && <POSPage />}
      {page === "stock" && <StockSync />}
      {page === "peak" && <PeakExport />}
    </div>
  );
}
