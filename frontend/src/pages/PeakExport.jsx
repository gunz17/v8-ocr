import React, { useEffect, useState } from "react";
import { useOcrStore } from "../store/ocrStore";

export default function PeakExport() {
  const { mappedLines } = useOcrStore();

  const [vendors, setVendors] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("");

  const [summary, setSummary] = useState({
    subtotal: 0,
    vat: 0,
    total: 0,
  });

  const [exporting, setExporting] = useState(false);

  // -----------------------------------------
  // LOAD vendor + wallet data
  // -----------------------------------------
  useEffect(() => {
    fetch("/api/vendor/all").then((r) => r.json()).then(setVendors);
    fetch("/api/wallet/all").then((r) => r.json()).then(setWallets);
  }, []);

  // -----------------------------------------
  // AUTO CALCULATE TOTAL
  // -----------------------------------------
  useEffect(() => {
    let subtotal = 0;
    let vat = 0;

    mappedLines.forEach((line) => {
      const amount = Number(line.amount || 0);
      subtotal += amount;

      if ((line.vat_rate || 7) > 0) {
        vat += amount * (line.vat_rate / 100);
      }
    });

    setSummary({
      subtotal,
      vat,
      total: subtotal + vat,
    });
  }, [mappedLines]);

  // -----------------------------------------
  // Export Excel
  // -----------------------------------------
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

    setExporting(true);

    const response = await fetch("/api/peak/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "peak_purchase_import.xlsx";
    link.click();

    setExporting(false);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Export to PEAK</h1>

      {/* SUMMARY */}
      <div className="bg-gray-50 border p-4 rounded mb-6">
        <h2 className="font-semibold text-lg mb-2">สรุปยอด</h2>

        <div className="flex justify-between text-sm mb-1">
          <span>ยอดก่อน VAT:</span>
          <span>{summary.subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-sm mb-1">
          <span>VAT 7%:</span>
          <span>{summary.vat.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-lg font-bold mt-2">
          <span>รวมทั้งสิ้น:</span>
          <span>{summary.total.toLocaleString()}</span>
        </div>
      </div>

      {/* Vendor */}
      <label className="font-semibold mb-1 block">เลือกผู้ขาย</label>
      <select
        className="border p-2 rounded w-full mb-4"
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

      {/* Wallet */}
      <label className="font-semibold mb-1 block">เลือกกระเป๋าเงิน</label>
      <select
        className="border p-2 rounded w-full mb-6"
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

      {/* EXPORT BUTTON */}
      <button
        onClick={exportPeak}
        disabled={exporting}
        className={`w-full py-3 rounded text-white text-lg ${
          exporting ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {exporting ? "กำลังสร้างไฟล์..." : "Export Excel (PEAK Format)"}
      </button>

      {/* LINE TABLE */}
      <h2 className="font-semibold text-lg mt-10 mb-2">
        รายการสินค้า (เตรียมนำเข้า PEAK)
      </h2>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">#</th>
            <th className="border px-2 py-1">สินค้า</th>
            <th className="border px-2 py-1">SKU</th>
            <th className="border px-2 py-1">จำนวน</th>
            <th className="border px-2 py-1">ราคา/หน่วย</th>
            <th className="border px-2 py-1">จำนวนเงิน</th>
            <th className="border px-2 py-1">VAT</th>
          </tr>
        </thead>
        <tbody>
          {mappedLines.map((item, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">{idx + 1}</td>
              <td className="border px-2 py-1">{item.item_name}</td>
              <td className="border px-2 py-1">{item.item_sku}</td>
              <td className="border px-2 py-1">{item.qty}</td>
              <td className="border px-2 py-1">{item.unit_price}</td>
              <td className="border px-2 py-1">{item.amount}</td>
              <td className="border px-2 py-1">{item.vat_rate || 7}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
