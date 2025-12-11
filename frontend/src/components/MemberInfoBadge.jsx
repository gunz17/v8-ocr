import React from "react";
import { useMemberStore } from "../store/memberStore";

export default function MemberInfoBadge() {
  const { selectedMember, clearMember } = useMemberStore();

  if (!selectedMember) return null;

  return (
    <div className="p-3 border rounded bg-green-50 mb-4 flex justify-between">
      <div>
        <div className="font-bold text-lg">{selectedMember.name}</div>
        <div>เบอร์: {selectedMember.phone}</div>
        <div>Tier: {selectedMember.tier}</div>
        <div>Point: {selectedMember.point}</div>
      </div>

      <button
        onClick={clearMember}
        className="bg-red-600 text-white px-3 py-1 rounded h-fit"
      >
        ลบสมาชิก
      </button>
    </div>
  );
}
