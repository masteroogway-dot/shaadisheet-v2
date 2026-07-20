"use client";

import { useState } from "react";
import { updateVendor, createVendor, deleteVendor } from "@/lib/actions";

export default function VendorsView({ wedding, onUpdate }: { wedding: any; onUpdate: () => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  const handleSave = async (id: string) => {
    await updateVendor(id, editData);
    setEditing(null);
    onUpdate();
  };

  const handleAdd = async () => {
    await createVendor({ category: "New Vendor", name: "", contact: "", quote: 0, paid: 0, balance: 0, rating: "★★★★☆", contract: "Pending", notes: "" });
    onUpdate();
  };

  const handleDelete = async (id: string) => {
    await deleteVendor(id);
    onUpdate();
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-7">
        <div>
          <h2 className="text-2xl font-bold">Vendor Tracker</h2>
          <p className="text-gray-500 text-sm">Manage all your wedding vendors in one place</p>
        </div>
        <button onClick={handleAdd} className="px-4 py-2 text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-light transition-colors cursor-pointer">
          <i className="fas fa-plus mr-1.5" /> Add Vendor
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="spreadsheet">
          <thead>
            <tr>
              <th className="w-12 text-center">#</th>
              <th>Category</th>
              <th>Vendor Name</th>
              <th>Contact</th>
              <th className="text-right">Quote (₹)</th>
              <th className="text-right">Paid (₹)</th>
              <th className="text-right">Balance (₹)</th>
              <th>Rating</th>
              <th>Contract</th>
              <th>Notes</th>
              <th className="w-20">Action</th>
            </tr>
          </thead>
          <tbody>
            {wedding.vendors?.map((v: any) => (
              <tr key={v.id}>
                <td className="text-center text-gray-400">{v.order + 1}</td>
                <td className="font-semibold">{editing === v.id ? <input value={editData.category ?? v.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" /> : v.category}</td>
                <td>{editing === v.id ? <input value={editData.name ?? v.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" /> : v.name}</td>
                <td>{v.contact}</td>
                <td className="text-right">₹{v.quote.toLocaleString("en-IN")}</td>
                <td className="text-right">{editing === v.id ? <input type="number" value={editData.paid ?? v.paid} onChange={(e) => setEditData({ ...editData, paid: parseInt(e.target.value) || 0 })} className="w-24 px-2 py-1 border rounded text-sm text-right" /> : `₹${v.paid.toLocaleString("en-IN")}`}</td>
                <td className="text-right">₹{v.balance.toLocaleString("en-IN")}</td>
                <td style={{ color: "#D4AF37" }}>{v.rating}</td>
                <td>
                  <span className={`status-badge ${v.contract === "Signed" ? "paid" : "pending"}`}>{v.contract}</span>
                </td>
                <td>{editing === v.id ? <input value={editData.notes ?? v.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} className="w-24 px-2 py-1 border rounded text-sm" /> : (v.notes || "—")}</td>
                <td>
                  {editing === v.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleSave(v.id)} className="text-xs px-2 py-1 bg-green-500 text-white rounded cursor-pointer">Save</button>
                      <button onClick={() => setEditing(null)} className="text-xs px-2 py-1 bg-gray-300 text-gray-700 rounded cursor-pointer">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <button onClick={() => { setEditing(v.id); setEditData({}); }} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded cursor-pointer">Edit</button>
                      <button onClick={() => handleDelete(v.id)} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded cursor-pointer">Del</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
