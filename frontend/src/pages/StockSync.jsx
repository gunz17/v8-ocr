import React, { useEffect, useState } from "react";

export default function StockSync() {
  const [loading, setLoading] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  const [marketplaceStock, setMarketplaceStock] = useState([]);
  const [internalStock, setInternalStock] = useState([]);

  const [autoSync, setAutoSync] = useState(false);
  const [autoInterval, setAutoInterval] = useState(5); // minutes

  const [skuMappingNeeded, setSkuMappingNeeded] = useState([]);

  // --------------------------------------------------------
  // Load internal stock
  // --------------------------------------------------------
  async function loadInternalStock() {
    const r = await fetch("/api/stock/internal");
    const data = await r.json();
    setInternalStock(data);
  }

  // --------------------------------------------------------
  // Load marketplace stock
  // --------------------------------------------------------
  async function loadMarketplace() {
    const r = await fetch("/api/stock/marketplace");
    const data = await r.json();
    setMarketplaceStock(data);
  }

  // --------------------------------------------------------
  // Sync Now
  // --------------------------------------------------------
  async function syncNow() {
    setLoading(true);

    const r = await fetch("/api/stock/sync", { method: "POST" });
    const result = await r.json();

    setSyncResult(result);

    if (result.unmapped && result.unmapped.length > 0) {
      setSkuMappingNeeded(result.unmapped);
    }

    await loadInternalStock();
    await loadMarketplace();

    setLoading(false);
  }

  // --------------------------------------------------------
  // Auto Sync Loop
  // --------------------------------------------------------
  useEffect(() => {
    loadInternalStock();
    loadMarketplace();

    if (!autoSync) return;

    const timer = setInterval(syncNow, autoInterval * 60 * 1000);
    return () => clearInterval(timer);
  }, [autoSync, autoInterval]);

  // --------------------------------------------------------
  // Color for stock status
  // --------------------------------------------------------
  function getStatusColor(diff) {
    if (diff === 0) return "bg-green-200";
    if (Math.abs(diff) <= 2) return "bg-yellow-200";
    return "bg-red-200";
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Stock Sync Manager</h1>

      {/* TOP BUTTONS */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={syncNow}
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${
            loading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "กำลังซิงค์..." : "Sync Now"}
        </button>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoSync}
            onChange={(e) => setAutoSync(e.target.checked)}
          />
          Auto Sync Every
        </label>

        <input
          type="number"
          min="1"
          className="border p-1 w-16"
          value={autoInterval}
          onChange={(e) => setAutoInterval(e.target.value)}
        />
        <span>นาที</span>
      </div>

      {/* SYNC RESULT */}
      {syncResult && (
        <div className="bg-gray-50 border p-4 rounded mb-6">
          <h2 className="text-lg font-bold mb-2">ผลการ Sync</h2>

          <div>อัปเดตสต็อกแล้ว: {syncResult.updated?.length || 0} รายการ</div>
          <div>ไม่เปลี่ยนแปลง: {syncResult.nochange?.length || 0} รายการ</div>
          <div className="text-red-600">
            SKU ไม่พบ (ต้องแมพ): {syncResult.unmapped?.length || 0}
          </div>
        </div>
      )}

      {/* SKU NEED MAPPING */}
      {skuMappingNeeded.length > 0 && (
        <div className="bg-yellow-50 border p-4 rounded mb-6">
          <h3 className="font-semibold">ต้องแมพ SKU ก่อนซิงค์ให้ถูกต้อง:</h3>
          {skuMappingNeeded.map((x, i) => (
            <div key={i} className="p-2">
              Marketplace SKU: <strong>{x.market_sku}</strong>  
              (ชื่อ: {x.market_name})
            </div>
          ))}
          <button
            className="mt-3 bg-green-600 text-white px-4 py-2 rounded"
            onClick={() => (window.location.href = "/mapping")}
          >
            แก้ Mapping ทันที
          </button>
        </div>
      )}

      {/* STOCK TABLE COMPARE */}
      <h2 className="text-lg font-bold mb-3">เปรียบเทียบสต็อก</h2>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">SKU</th>
            <th className="border px-2 py-1">ชื่อสินค้า</th>
            <th className="border px-2 py-1">Internal</th>
            <th className="border px-2 py-1">Marketplace</th>
            <th className="border px-2 py-1">ต่างกัน</th>
          </tr>
        </thead>

        <tbody>
          {internalStock.map((item, i) => {
            const market = marketplaceStock.find(
              (m) => m.sku === item.sku
            );

            const marketQty = market?.qty ?? 0;
            const diff = item.qty - marketQty;

            return (
              <tr key={i}>
                <td className="border px-2 py-1">{item.sku}</td>
                <td className="border px-2 py-1">{item.name}</td>
                <td className="border px-2 py-1 text-center">{item.qty}</td>
                <td className="border px-2 py-1 text-center">
                  {marketQty}
                </td>

                <td className={`border px-2 py-1 text-center ${getStatusColor(diff)}`}>
                  {diff}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
