import React, { useEffect, useState } from "react";
import { useOcrStore } from '../store/ocrStore';

export default function OCRReview() {
  const { mappedLines, rawText, setMappedLines } = useOcrStore();

  const [productSuggestions, setProductSuggestions] = useState({});
  const [editingRow, setEditingRow] = useState(null);
  const [searchCache, setSearchCache] = useState({});
  const [loading, setLoading] = useState(false);

  const [vendors, setVendors] = useState([]);
  const [wallets, setWallets] = useState([]);

  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("");

  // --------------------------------------------------------
  // Load Vendor & Wallet for Export Button
  // --------------------------------------------------------
  useEffect(() => {
    fetch("/api/vendor/all").then(r => r.json()).then(setVendors);
    fetch("/api/wallet/all").then(r => r.json()).then(setWallets);
  }, []);

  // --------------------------------------------------------
  // Confidence Color
  // --------------------------------------------------------
  const getColor = (c) => {
    if (!c) return "bg-gray-200";
    if (c < 0.6) return "bg-red-200";
    if (c < 0.85) return "bg-yellow-200";
    return "bg-green-200";
  };

  // --------------------------------------------------------
  // AI Suggest AGAIN
  // --------------------------------------------------------
  async function applyAiAgain() {
    setLoading(true);

    const res = await fetch("/api/ai/match-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines: mappedLines }),
    });

    const data = await res.json();
    setMappedLines(data.lines || []);
    setLoading(false);
  }

  // --------------------------------------------------------
  // Search products (autocomplete)
  // --------------------------------------------------------
  async function searchProducts(query) {
    if (searchCache[query]) return searchCache[query];

    const res = await fetch(`/api/products/search?text=${query}`);
    const items = await res.json();

    setSearchCache({
      ...searchCache,
      [query]: items,
    });

    return items;
  }

  // --------------------------------------------------------
  // Update one row manually
  // --------------------------------------------------------
  function updateRow(index, patch) {
    const cloned = [...mappedLines];
    cloned[index] = { ...cloned[index], ...patch };
    setMappedLines(cloned);
  }

  // --------------------------------------------------------
  // EXPORT Excel
  // --------------------------------------------------------
  async function exportPeak() {
    if (!selectedVendor || !selectedWallet) {
      alert("กรุณาเลือกผู้ขายและกระเป๋าเงินก่อนส่งออก Excel");
      return;
    }

    const payload = {
      vendor_code: selectedVendor,
      wallet_code: selectedWallet,
      lines: mappedLines,
    };

    const response = await fetch("/api/peak/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "peak_purchase_import.xlsx";
    a.click();
  }

  return (
    <div className="p-6 flex gap-6">

      {/* LEFT SIDE RAW TEXT */}
      <div className="w-[40%] bg-gray-50 border rounded p-4 h-screen overflow-auto">
        <h2 className="text-lg font-bold mb-2">OCR Raw Text</h2>
        <pre className="whitespace-pre-wrap text-sm">{rawText}</pre>
      </div>

      {/* RIGHT SIDE REVIEW TABLE */}
      <div className="w-[60%]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">AI Mapping Review</h2>

          <button
            onClick={applyAiAgain}
            className={`px-4 py-2 rounded text-white ${
              loading ? "bg-gray-400" : "bg-blue-600"
            }`}
            disabled={loading}
          >
            {loading ? "กำลังประมวลผล..." : "Apply AI Suggest Again"}
          </button>
        </div>

        <table className="w-full border text-sm mb-6">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">#</th>
              <th className="border px-2 py-1">OCR Text</th>
              <th className="border px-2 py-1">Mapping</th>
              <th className="border px-2 py-1">Confidence</th>
            </tr>
          </thead>

          <tbody>
            {mappedLines.map((row, index) => (
              <tr key={index}>
                {/* Index */}
                <td className="border px-2 py-1">{index + 1}</td>

                {/* OCR Text */}
                <td className="border px-2 py-1">{row.ocr_desc}</td>

                {/* Mapping Column */}
                <td className="border px-2 py-1 w-[40%]">
                  {editingRow === index ? (
                    <input
                      className="border p-1 w-full"
                      placeholder="ค้นหาสินค้า…"
                      onChange={async (e) => {
                        const results = await searchProducts(e.target.value);
                        setProductSuggestions({
                          ...productSuggestions,
                          [index]: results,
                        });
                      }}
                    />
                  ) : (
                    <div>{row.item_name || "-"}</div>
                  )}

                  {/* Suggestion Dropdown */}
                  {productSuggestions[index] && editingRow === index && (
                    <div className="border mt-1 bg-white rounded shadow max-h-[150px] overflow-auto">
                      {productSuggestions[index].map((p) => (
                        <div
                          key={p.sku}
                          className="p-2 hover:bg-blue-50 cursor-pointer"
                          onClick={() => {
                            updateRow(index, {
                              item_sku: p.sku,
                              item_name: p.name,
                              confidence: 1.0,
                            });
                            setEditingRow(null);
                          }}
                        >
                          <strong>{p.sku}</strong> — {p.name}
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setEditingRow(index)}
                    className="text-blue-600 underline text-xs mt-1"
                  >
                    แก้ไข
                  </button>
                </td>

                {/* CONFIDENCE */}
                <td className="border px-2 py-1">
                  <div className={`px-2 py-1 text-center rounded ${getColor(row.confidence)}`}>
                    {(row.confidence * 100 || 0).toFixed(0)}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* EXPORT SECTION */}
        <div className="bg-gray-50 border p-4 rounded mb-4">
          <h3 className="text-lg font-semibold mb-3">Export to PEAK</h3>

          <div className="mb-3">
            <label>ผู้ขาย:</label>
            <select
              className="border p-2 rounded w-full"
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
            >
              <option value="">-- เลือกผู้ขาย --</option>
              {vendors.map((v) => (
                <option key={v.vendor_code} value={v.vendor_code}>
                  {v.vendor_code} — {v.vendor_name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label>กระเป๋าเงิน:</label>
            <select
              className="border p-2 rounded w-full"
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
            >
              <option value="">-- เลือกกระเป๋าเงิน --</option>
              {wallets.map((w) => (
                <option key={w.wallet_code} value={w.wallet_code}>
                  {w.wallet_code} — {w.wallet_name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={exportPeak}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded"
          >
            Export Excel (PEAK)
          </button>
        </div>
      </div>
    </div>
  );
}
