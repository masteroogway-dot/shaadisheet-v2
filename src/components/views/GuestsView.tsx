"use client";

import { useState } from "react";
import { updateGuest, createGuest, deleteGuest } from "@/lib/actions";

export default function GuestsView({ wedding, onUpdate }: { wedding: any; onUpdate: () => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  const totalGuests = wedding.guests?.length || 0;
  const rsvpYes = wedding.guests?.filter((g: any) => g.rsvp === "Yes").length || 0;
  const pending = wedding.guests?.filter((g: any) => g.rsvp === "Pending").length || 0;
  const declined = wedding.guests?.filter((g: any) => g.rsvp === "Declined").length || 0;

  const handleSave = async (id: string) => {
    await updateGuest(id, editData);
    setEditing(null);
    onUpdate();
  };

  const handleAdd = async () => {
    await createGuest({ name: "New Guest", relation: "Friend", side: "Bride", rsvp: "Pending", dietary: "Veg", tableNum: 0, giftGiven: "No", thankYou: "No", notes: "" });
    onUpdate();
  };

  const handleDelete = async (id: string) => {
    await deleteGuest(id);
    onUpdate();
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-7">
        <div>
          <h2 className="text-2xl font-bold">Guest List & RSVP</h2>
          <p className="text-gray-500 text-sm">Track every guest — RSVP, dietary needs, gifts</p>
        </div>
        <button onClick={handleAdd} className="px-4 py-2 text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-light transition-colors cursor-pointer">
          <i className="fas fa-plus mr-1.5" /> Add Guest
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { num: totalGuests, label: "Total Invited", color: "" },
          { num: rsvpYes, label: "RSVP'd Yes", color: "text-green" },
          { num: pending, label: "Pending", color: "text-yellow" },
          { num: declined, label: "Declined", color: "text-red" },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 text-center">
            <span className={`text-3xl font-extrabold block mb-1 ${s.color}`}>{s.num}</span>
            <span className="text-sm text-gray-500">{s.label}</span>
          </div>
        ))}
      </div>

      {totalGuests === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-maroon/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-users text-maroon text-xl" />
          </div>
          <h3 className="font-bold text-lg mb-2">No guests yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Start building your guest list and track RSVPs for your wedding.</p>
          <button onClick={handleAdd} className="px-6 py-2.5 text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-light transition-colors cursor-pointer">
            <i className="fas fa-plus mr-1.5" /> Add First Guest
          </button>
        </div>
      ) : (
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="spreadsheet">
          <thead>
            <tr>
              <th className="w-12 text-center">#</th>
              <th>Guest Name</th>
              <th>Relation</th>
              <th>Side</th>
              <th>RSVP</th>
              <th>Dietary</th>
              <th>Notes</th>
              <th className="w-20">Action</th>
            </tr>
          </thead>
          <tbody>
            {wedding.guests?.map((g: any) => (
              <tr key={g.id}>
                <td className="text-center text-gray-400">{g.order + 1}</td>
                <td className="font-semibold">{editing === g.id ? <input value={editData.name ?? g.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" /> : g.name}</td>
                <td>{editing === g.id ? <input value={editData.relation ?? g.relation} onChange={(e) => setEditData({ ...editData, relation: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" /> : g.relation}</td>
                <td>{editing === g.id ? (
                  <select value={editData.side ?? g.side} onChange={(e) => setEditData({ ...editData, side: e.target.value })} className="px-2 py-1 border rounded text-sm">
                    <option>Bride</option><option>Groom</option><option>Both</option>
                  </select>
                ) : g.side}</td>
                <td>{editing === g.id ? (
                  <select value={editData.rsvp ?? g.rsvp} onChange={(e) => setEditData({ ...editData, rsvp: e.target.value })} className="px-2 py-1 border rounded text-sm">
                    <option>Yes</option><option>Pending</option><option>Declined</option>
                  </select>
                ) : <span className={`status-badge ${g.rsvp === "Yes" ? "paid" : g.rsvp === "Pending" ? "planning" : "pending"}`}>{g.rsvp}</span>}</td>
                <td>{editing === g.id ? (
                  <select value={editData.dietary ?? g.dietary} onChange={(e) => setEditData({ ...editData, dietary: e.target.value })} className="px-2 py-1 border rounded text-sm">
                    <option>Veg</option><option>Non-Veg</option><option>Vegan</option><option>Jain</option>
                  </select>
                ) : g.dietary}</td>
                <td>{editing === g.id ? <input value={editData.notes ?? g.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} className="w-24 px-2 py-1 border rounded text-sm" /> : (g.notes || "—")}</td>
                <td>
                  {editing === g.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleSave(g.id)} className="text-xs px-2 py-1 bg-green-500 text-white rounded cursor-pointer">Save</button>
                      <button onClick={() => setEditing(null)} className="text-xs px-2 py-1 bg-gray-300 text-gray-700 rounded cursor-pointer">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <button onClick={() => { setEditing(g.id); setEditData({}); }} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded cursor-pointer">Edit</button>
                      <button onClick={() => handleDelete(g.id)} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded cursor-pointer">Del</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
