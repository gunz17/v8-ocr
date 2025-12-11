import React, { useState } from "react";
import { useMemberStore } from "../store/memberStore";

export default function MemberSearchModal({ open, onClose }) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const { setSelectedMember } = useMemberStore();

  async function search() {
    if (keyword.length < 2) return;

    const res = await fetch(`/api/member/search?keyword=${keyword}`);
    const json = await res.json();

    if (json.success) setResults(json.members);
  }

  function choose(member) {
    setSelectedMember(member);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded shadow-lg w-[500px]">
        <h2 className="text-xl font-bold mb-3">ค้นหาสมาชิก</h2>

        <input
          className="border p-2 w-full mb-3"
          placeholder="ค้นหาเบอร์ / ชื่อ / รหัสสมาชิก"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
        />

        <button
          onClick={search}
          className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
        >
          ค้นหา
        </button>

        <div className="max-h-60 overflow-auto border rounded p-2">
          {results.map((m) => (
            <div
              key={m.id}
              onClick={() => choose(m)}
              className="p-2 border-b hover:bg-gray-100 cursor-pointer"
            >
              <div className="font-semibold">{m.name} ({m.member_code})</div>
              <div>{m.phone}</div>
              <div className="text-sm text-gray-600">
                Tier: {m.tier} | Point: {m.point}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-300 rounded"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { useMemberStore } from "../store/memberStore";

export default function MemberSearchModal({ open, onClose }) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const { setSelectedMember } = useMemberStore();

  async function search() {
    if (keyword.length < 2) return;

    const res = await fetch(`/api/member/search?keyword=${keyword}`);
    const json = await res.json();

    if (json.success) setResults(json.members);
  }

  function choose(member) {
    setSelectedMember(member);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded shadow-lg w-[500px]">
        <h2 className="text-xl font-bold mb-3">ค้นหาสมาชิก</h2>

        <input
          className="border p-2 w-full mb-3"
          placeholder="ค้นหาเบอร์ / ชื่อ / รหัสสมาชิก"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
        />

        <button
          onClick={search}
          className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
        >
          ค้นหา
        </button>

        <div className="max-h-60 overflow-auto border rounded p-2">
          {results.map((m) => (
            <div
              key={m.id}
              onClick={() => choose(m)}
              className="p-2 border-b hover:bg-gray-100 cursor-pointer"
            >
              <div className="font-semibold">{m.name} ({m.member_code})</div>
              <div>{m.phone}</div>
              <div className="text-sm text-gray-600">
                Tier: {m.tier} | Point: {m.point}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-300 rounded"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
