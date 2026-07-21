"use client";

import { useState } from "react";
import { updateVendor, createVendor, deleteVendor } from "@/lib/actions";

export default function VendorsView({ wedding, weddingId, onUpdate }: { wedding: any; weddingId: string; onUpdate: () => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  const handleSave = async (id: string) => {
    const data = { ...editData };
    if (data.quote !== undefined || data.paid !== undefined) {
      const v = wedding.vendors?.find((x: any) => x.id === id);
      const quote = data.quote ?? v?.quote ?? 0;
      const paid = data.paid ?? v?.paid ?? 0;
      data.balance = quote - paid;
    }
    await updateVendor(weddingId, id, data);
    setEditing(null);
    onUpdate();
  };

  const handleAdd = async () => {
    await createVendor(weddingId, { category: "New Vendor", name: "", contact: "", quote: 0, paid: 0, balance: 0, rating: "\u2605\u2605\u2605\u2605\u2606", contract: "Pending", notes: "" });
    onUpdate();
  };

  const handleDelete = async (id: string) => {
    await deleteVendor(weddingId, id);
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

      {!wedding.vendors || wedding.vendors.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-maroon/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-store text-maroon text-xl" />
          </div>
          <h3 className="font-bold text-lg mb-2">No vendors yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Start adding your wedding vendors {'\u2014'} venue, caterer, photographer, and more.</p>
          <button onClick={handleAdd} className="px-6 py-2.5 text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-light transition-colors cursor-pointer">
            <i className="fas fa-plus mr-1.5" /> Add First Vendor
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="spreadsheet">
          <thead>
            <tr>
              <th className="w-12 text-center">#</th>
              <th>Category</th>
              <th>Vendor Name</th>
              <th>Contact</th>
              <th className="text-right">Quote ({'\u20B9'})</th>
              <th className="text-right">Paid ({'\u20B9'})</th>
              <th className="text-right">Balance ({'\u20B9'})</th>
              <th>Rating</th>
              <th>Contract</th>
              <th>Notes</th>
              <th className="w-20">Action</th>
            </tr>
          </thead>
          <tbody>
            {wedding.vendors?.map((v: any) => {
              const quote = editData.quote ?? v.quote;
              const paid = editData.paid ?? v.paid;
              const balance = quote - paid;
              return (
                <tr key={v.id}>
                  <td className="text-center text-gray-400">{v.order + 1}</td>
                  <td className="font-semibold">{editing === v.id ? <input value={editData.category ?? v.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" /> : v.category}</td>
                  <td>{editing === v.id ? <input value={editData.name ?? v.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" /> : v.name}</td>
                  <td>{editing === v.id ? <input value={editData.contact ?? v.contact} onChange={(e) => setEditData({ ...editData, contact: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" /> : v.contact}</td>
                  <td className="text-right">{editing === v.id ? <input type="number" value={editData.quote ?? v.quote} onChange={(e) => setEditData({ ...editData, quote: parseInt(e.target.value) || 0 })} className="w-24 px-2 py-1 border rounded text-sm text-right" /> : `{'\u20B9'}${v.quote.toLocaleString("en-IN")}`}</td>
                  <td className="text-right">{editing === v.id ? <input type="number" value={editData.paid ?? v.paid} onChange={(e) => setEditData({ ...editData, paid: parseInt(e.target.value) || 0 })} className="w-24 px-2 py-1 border rounded text-sm text-right" /> : `{'\u20B9'}${v.paid.toLocaleString("en-IN")}`}</td>
                  <td className="text-right font-medium">{'\u20B9'}{balance.toLocaleString("en-IN")}</td>
                  <td style={{ color: "#D4AF37" }}>{editing === v.id ? (
                    <select value={editData.rating ?? v.rating} onChange={(e) => setEditData({ ...editData, rating: e.target.value })} className="px-2 py-1 border rounded text-sm">
                      <option>{'\u2605\u2605\u2605\u2605\u2605'}</option><option>{'\u2605\u2605\u2605\u2605\u2606'}</option><option>{'\u2605\u2605\u2605\u2606\u2606'}</option><option>{'\u2605\u2605\u2606\u2606\u2606'}</option><option>{'\u2605\u2606\u2606\u2606\u2606'}</option>
                    </select>
                  ) : v.rating}</td>
                  <td>{editing === v.id ? (
                    <select value={editData.contract ?? v.contract} onChange={(e) => setEditData({ ...editData, contract: e.target.value })} className="px-2 py-1 border rounded text-sm">
                      <option>Pending</option><option>Signed</option><option>Completed</option>
                    </select>
                  ) : <span className={`status-badge ${v.contract === "Signed" ? "paid" : "pending"}`}>{v.contract}</span>}</td>
                  <td>{editing === v.id ? <input value={editData.notes ?? v.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} className="w-24 px-2 py-1 border rounded text-sm" /> : (v.notes || "\u2014")}</td>
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
              );
            })}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}
