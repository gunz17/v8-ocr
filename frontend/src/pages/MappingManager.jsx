import React, { useEffect, useState } from "react";

export default function MappingManager() {
  const [mappingList, setMappingList] = useState([]);
  const [searchText, setSearchText] = useState("");

  const [products, setProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);

  const [editingAlias, setEditingAlias] = useState("");
  const [selectedSku, setSelectedSku] = useState("");
  const [selectedItemName, setSelectedItemName] = useState("");

  const [currentMappingId, setCurrentMappingId] = useState(null);

  // -------------------------------
  // Load mapping list
  // -------------------------------
  async function loadMapping() {
    const res = await fetch("/api/mapping/all");
    const rows = await res.json();
    setMappingList(rows);
  }

  // -------------------------------
  // Load product list
  // -------------------------------
  async function loadProducts() {
    const res = await fetch("/api/products/all");
    const rows = await res.json();
    setProducts(rows);
  }

  useEffect(() => {
    loadMapping();
    loadProducts();
  }, []);

  // -------------------------------
  // Search mapping
  // -------------------------------
  async function onSearch() {
    if (!searchText.trim()) {
      return loadMapping();
    }

    const res = await fetch(`/api/mapping/search?text=${searchText}`);
    const data = await res.json();

    const merged = [...data.aliases, ...data.products];
    setMappingList(merged);
  }

  // -------------------------------
  // Delete mapping
  // -------------------------------
  async function deleteMapping(id) {
    if (!window.confirm("ต้องการลบ alias นี้จริงหรือไม่?")) return;

    await fetch(`/api/mapping/delete/${id}`, { method: "DELETE" });
    loadMapping();
  }

  // -------------------------------
  // Save mapping
  // -------------------------------
  async function saveMapping() {
    if (!editingAlias || !selectedSku) {
      alert("กรุณากรอก Alias และเลือกสินค้า");
      return;
    }

    if (currentMappingId) {
      // update existing
      await fetch("/api/mapping/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentMappingId,
          alias: editingAlias,
          item_sku: selectedSku,
          item_name: selectedItemName,
        }),
      });
    } else {
      // add new
      await fetch("/api/mapping/add-alias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alias: editingAlias,
          item_sku: selectedSku,
          item_name: selectedItemName,
        }),
      });
    }

    setShowProductModal(false);
    setEditingAlias("");
    setSelectedSku("");
    setSelectedItemName("");
    setCurrentMappingId(null);

    loadMapping();
  }

  // -------------------------------
  // Open modal for edit/add
  // -------------------------------
  function openEdit(row) {
    setCurrentMappingId(row.id || null);
    setEditingAlias(row.alias || "");
    setSelectedSku(row.item_sku || "");
    setSelectedItemName(row.item_name || "");
    setShowProductModal(true);
  }

  // -------------------------------
  // Select product from modal
  // -------------------------------
  function chooseProduct(p) {
    setSelectedSku(p.sku);
    setSelectedItemName(p.name);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mapping Manager</h1>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="ค้นหา alias / ชื่อสินค้า"
          className="border p-2 flex-grow"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <button
          onClick={onSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          ค้นหา
        </button>

        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => openEdit({})}
        >
          + เพิ่ม Alias
        </button>
      </div>

      {/* Mapping Table */}
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Alias</th>
            <th className="border px-2 py-1">SKU</th>
            <th className="border px-2 py-1">ชื่อสินค้า</th>
            <th className="border px-2 py-1">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {mappingList.map((row, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">{row.id}</td>
              <td className="border px-2 py-1">{row.alias}</td>
              <td className="border px-2 py-1">{row.item_sku}</td>
              <td className="border px-2 py-1">{row.item_name}</td>
              <td className="border px-2 py-1">
                <button
                  className="text-blue-600 underline mr-2"
                  onClick={() => openEdit(row)}
                >
                  แก้ไข
                </button>
                <button
                  className="text-red-600 underline"
                  onClick={() => deleteMapping(row.id)}
                >
                  ลบ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[480px] max-h-[90vh] overflow-auto shadow-lg">
            <h2 className="text-xl font-bold mb-4">
              {currentMappingId ? "แก้ไข Mapping" : "เพิ่ม Mapping ใหม่"}
            </h2>

            <label className="font-semibold">Alias:</label>
            <input
              className="border p-2 w-full mb-3"
              value={editingAlias}
              onChange={(e) => setEditingAlias(e.target.value)}
            />

            <label className="font-semibold">สินค้า:</label>
            <div className="border p-2 rounded mb-3 bg-gray-50">
              {selectedSku ? (
                <div>
                  <strong>{selectedSku}</strong> — {selectedItemName}
                </div>
              ) : (
                <span className="text-gray-400">ยังไม่ได้เลือกสินค้า</span>
              )}
            </div>

            <h3 className="font-semibold mb-2">เลือกสินค้า</h3>

            <div className="h-[200px] overflow-y-auto border rounded p-2 mb-4">
              {products.map((p) => (
                <div
                  key={p.sku}
                  className="p-2 hover:bg-blue-50 cursor-pointer"
                  onClick={() => chooseProduct(p)}
                >
                  <strong>{p.sku}</strong> — {p.name}
                </div>
              ))}
            </div>

            <button
              className="bg-green-600 text-white px-4 py-2 rounded w-full mb-2"
              onClick={saveMapping}
            >
              บันทึก
            </button>

            <button
              className="text-red-600 underline w-full"
              onClick={() => setShowProductModal(false)}
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
