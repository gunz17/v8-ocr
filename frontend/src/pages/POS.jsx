import React, { useState, useEffect, useRef } from "react";
import MemberSearchModal from "../components/MemberSearchModal";
import MemberInfoBadge from "../components/MemberInfoBadge";
import { useMemberStore } from "../store/memberStore";

export default function POS() {
  const { selectedMember, clearMember } = useMemberStore();

  const [itemQuery, setItemQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [pricingTier, setPricingTier] = useState("retail");

  const [discountBill, setDiscountBill] = useState(0);
  const [pointsToUse, setPointsToUse] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [fastScan, setFastScan] = useState(true);

  const beepRef = useRef(null);

  // Load beep sound
  useEffect(() => {
    beepRef.current = new Audio("/beep.mp3");
  }, []);

  // ------------------------------------------------------------
  // SEARCH PRODUCT
  // ------------------------------------------------------------
  async function searchProduct() {
    if (!itemQuery) return;

    const res = await fetch(`/api/pos/search?q=${itemQuery}`);
    const json = await res.json();
    setSearchResults(json);
  }

  // ------------------------------------------------------------
  // FAST SCAN MODE
  // ------------------------------------------------------------
  async function handleBarcodeInput(e) {
    if (!fastScan) return;

    if (e.key === "Enter") {
      const code = itemQuery;
      setItemQuery("");

      const res = await fetch(`/api/pos/scan?barcode=${code}`);
      const item = await res.json();

      if (item && item.sku) {
        addToCart(item);
        beepRef.current?.play();
      }
    }
  }

  // ------------------------------------------------------------
  // ADD ITEM TO CART
  // ------------------------------------------------------------
  function addToCart(item) {
    const exist = cart.find((c) => c.sku === item.sku);

    if (exist) {
      setCart(
        cart.map((c) =>
          c.sku === item.sku ? { ...c, qty: c.qty + 1 } : c
        )
      );
    } else {
      setCart([
        ...cart,
        {
          sku: item.sku,
          name: item.name,
          cost: item.cost || 0,
          retail: item.retail,
          member: item.member || item.retail,
          wholesale: item.wholesale || item.retail,
          salon: item.salon || item.retail,
          qty: 1,
          discount: 0,
        },
      ]);
    }
  }

  // ------------------------------------------------------------
  // UPDATE ITEM (qty, discount)
  // ------------------------------------------------------------
  function updateCart(sku, field, value) {
    setCart(cart.map((c) => (c.sku === sku ? { ...c, [field]: value } : c)));
  }

  // ------------------------------------------------------------
  // REMOVE ITEM
  // ------------------------------------------------------------
  function removeItem(sku) {
    setCart(cart.filter((c) => c.sku !== sku));
  }

  // ------------------------------------------------------------
  // CALCULATE PRICES
  // ------------------------------------------------------------
  function getItemPrice(item) {
    return pricingTier === "member"
      ? item.member
      : pricingTier === "wholesale"
      ? item.wholesale
      : pricingTier === "salon"
      ? item.salon
      : item.retail;
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + (getItemPrice(item) - item.discount) * item.qty,
    0
  );

  const total = subtotal - discountBill - (pointsToUse || 0);

  // ------------------------------------------------------------
  // CHECKOUT
  // ------------------------------------------------------------
  async function checkout() {
    const payload = {
      cart,
      pricingTier,
      discountBill,
      member_id: selectedMember?.id || null,
      points_to_use: pointsToUse || 0,
      payment_method: "cash",
    };

    const res = await fetch("/api/pos/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (!json.success) {
      alert("ผิดพลาด: " + json.message);
      return;
    }

    alert("ขายสำเร็จ! บิลเลขที่: " + json.invoice_no);

    // CLEAR DATA
    setCart([]);
    setDiscountBill(0);
    setPointsToUse(0);
    clearMember();
  }

  // ------------------------------------------------------------
  // UI STARTS HERE
  // ------------------------------------------------------------
  return (
    <div className="p-6">

      {/* MEMBER SELECT MODAL */}
      <MemberSearchModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <h1 className="text-2xl font-bold mb-4">POS ระบบขายหน้าร้าน (V9 + Member)</h1>

      {/* MEMBER INFO BADGE */}
      <MemberInfoBadge />

      {/* SEARCH + MEMBER BUTTON */}
      <div className="flex gap-4 mb-4">
        <input
          className="border p-2 w-72"
          placeholder="Scan barcode หรือ ค้นหาสินค้า"
          value={itemQuery}
          onChange={(e) => setItemQuery(e.target.value)}
          onKeyDown={handleBarcodeInput}
        />

        <button
          onClick={searchProduct}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          ค้นหา
        </button>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          เลือกสมาชิก
        </button>

        <label className="flex items-center gap-2 ml-4">
          <input
            type="checkbox"
            checked={fastScan}
            onChange={(e) => setFastScan(e.target.checked)}
          />
          FastScan
        </label>
      </div>

      {/* SEARCH RESULT */}
      {searchResults.length > 0 && (
        <div className="border p-3 mb-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">ผลการค้นหา:</h3>
          {searchResults.map((item) => (
            <div
              key={item.sku}
              className="p-2 hover:bg-gray-200 cursor-pointer border-b"
              onClick={() => addToCart(item)}
            >
              {item.sku} - {item.name}
            </div>
          ))}
        </div>
      )}

      {/* CART TABLE */}
      <table className="w-full border text-sm mb-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2">SKU</th>
            <th className="border px-2">สินค้า</th>
            <th className="border px-2">ราคา</th>
            <th className="border px-2">ส่วนลด</th>
            <th className="border px-2">จำนวน</th>
            <th className="border px-2">รวม</th>
            <th className="border px-2">ลบ</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => {
            const price = getItemPrice(item);
            const totalItem = (price - item.discount) * item.qty;

            return (
              <tr key={item.sku}>
                <td className="border px-2">{item.sku}</td>
                <td className="border px-2">{item.name}</td>
                <td className="border px-2 text-right">{price}</td>

                <td className="border px-2">
                  <input
                    type="number"
                    value={item.discount}
                    onChange={(e) =>
                      updateCart(item.sku, "discount", Number(e.target.value))
                    }
                    className="w-20 border p-1"
                  />
                </td>

                <td className="border px-2">
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) =>
                      updateCart(item.sku, "qty", Number(e.target.value))
                    }
                    className="w-20 border p-1 text-center"
                  />
                </td>

                <td className="border px-2 text-right">
                  {totalItem.toFixed(2)}
                </td>

                <td className="border px-2 text-center">
                  <button
                    onClick={() => removeItem(item.sku)}
                    className="text-red-600"
                  >
                    ✖
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* DISCOUNT + POINTS */}
      <div className="flex gap-6 mb-6 justify-end">
        <div>
          <label>ส่วนลดท้ายบิล</label>
          <input
            type="number"
            className="border p-2 w-24 ml-2"
            value={discountBill}
            onChange={(e) => setDiscountBill(Number(e.target.value))}
          />
        </div>

        {selectedMember && (
          <div>
            <label>ใช้แต้ม</label>
            <input
              type="number"
              className="border p-2 w-24 ml-2"
              value={pointsToUse}
              onChange={(e) =>
                setPointsToUse(
                  Math.min(Number(e.target.value), selectedMember.point)
                )
              }
            />
          </div>
        )}

        <div className="text-xl">
          รวมสุทธิ: <b>{total.toFixed(2)}</b>
        </div>
      </div>

      {/* CHECKOUT */}
      <button
        onClick={checkout}
        className="bg-green-700 text-white px-6 py-3 text-lg rounded"
      >
        ชำระเงิน
      </button>
    </div>
  );
}
