import React, { useState } from "react";
import axios from "axios";

export default function POSPage() {
  const [barcode, setBarcode] = useState("");
  const [result, setResult] = useState(null);

  const scan = async () => {
    const res = await axios.post("/api/pos/scan", { barcode });
    setResult(res.data);
  };

  return (
    <div>
      <h2>POS</h2>
      <input
        placeholder="barcode"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
      />
      <button onClick={scan}>Scan</button>

      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
