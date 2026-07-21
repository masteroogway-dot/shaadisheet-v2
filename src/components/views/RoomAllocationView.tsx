"use client";

import { useState } from "react";
import {
  createRoomAllocation,
  updateRoomAllocation,
  deleteRoomAllocation,
  batchCreateRoomAllocations,
} from "@/lib/actions";
import ImportModal from "@/components/ImportModal";

export default function RoomAllocationView({ wedding, weddingId, onUpdate }: { wedding: any; weddingId: string; onUpdate: () => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [showImport, setShowImport] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const allocations = wedding.roomAllocations || [];
  const totalRooms = allocations.length;
  const reserved = allocations.filter((a: any) => a.status === "Reserved").length;
  const checkedIn = allocations.filter((a: any) => a.status === "Checked In").length;
  const cancelled = allocations.filter((a: any) => a.status === "Cancelled").length;

  const handleSave = async (id: string) => {
    await updateRoomAllocation(weddingId, id, editData);
    setEditing(null);
    setEditData({});
    onUpdate();
  };

  const handleAdd = async () => {
    await createRoomAllocation(weddingId, {
      guestName: "",
      hotel: "",
      roomNumber: "",
      roomType: "Standard",
      checkIn: "",
      checkOut: "",
      status: "Reserved",
      notes: "",
    });
    onUpdate();
  };

  const handleDelete = async (id: string) => {
    await deleteRoomAllocation(weddingId, id);
    setDeleteConfirm(null);
    onUpdate();
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-7">
        <div>
          <h2 className="text-2xl font-bold">Room Allocations</h2>
          <p className="text-gray-500 text-sm">Assign guests to hotel rooms and track check-ins</p>
        </div>
        <div className="flex gap-2.5">
          <button onClick={() => setShowImport(true)} className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-br from-maroon to-maroon-light rounded-lg hover:shadow-md transition-all cursor-pointer">
            <i className="fas fa-file-import mr-1.5" /> Import Excel
          </button>
          <button onClick={handleAdd} className="px-4 py-2 text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-light transition-colors cursor-pointer">
            <i className="fas fa-plus mr-1.5" /> Add Room
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { num: totalRooms, label: "Total Rooms", color: "" },
          { num: reserved, label: "Reserved", color: "text-blue-600" },
          { num: checkedIn, label: "Checked In", color: "text-green" },
          { num: cancelled, label: "Cancelled", color: "text-red" },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 text-center">
            <span className={`text-3xl font-extrabold block mb-1 ${s.color}`}>{s.num}</span>
            <span className="text-sm text-gray-500">{s.label}</span>
          </div>
        ))}
      </div>

      {totalRooms === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-maroon/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-bed text-maroon text-xl" />
          </div>
          <h3 className="font-bold text-lg mb-2">No rooms allocated yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Start assigning guests to hotel rooms for the wedding.</p>
          <button onClick={handleAdd} className="px-6 py-2.5 text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-light transition-colors cursor-pointer">
            <i className="fas fa-plus mr-1.5" /> Add First Room
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="spreadsheet">
            <thead>
              <tr>
                <th className="w-12 text-center">#</th>
                <th>Guest Name</th>
                <th>Hotel</th>
                <th>Room #</th>
                <th>Room Type</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th>Notes</th>
                <th className="w-20">Action</th>
              </tr>
            </thead>
            <tbody>
              {allocations.map((a: any) => (
                <tr key={a.id}>
                  <td className="text-center text-gray-400">{a.order + 1}</td>
                  <td className="font-semibold">
                    {editing === a.id ? (
                      <input value={editData.guestName ?? a.guestName} onChange={(e) => setEditData({ ...editData, guestName: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" />
                    ) : a.guestName || "\u2014"}
                  </td>
                  <td>
                    {editing === a.id ? (
                      <input value={editData.hotel ?? a.hotel} onChange={(e) => setEditData({ ...editData, hotel: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" />
                    ) : a.hotel || "\u2014"}
                  </td>
                  <td>
                    {editing === a.id ? (
                      <input value={editData.roomNumber ?? a.roomNumber} onChange={(e) => setEditData({ ...editData, roomNumber: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" />
                    ) : a.roomNumber || "\u2014"}
                  </td>
                  <td>
                    {editing === a.id ? (
                      <select value={editData.roomType ?? a.roomType} onChange={(e) => setEditData({ ...editData, roomType: e.target.value })} className="px-2 py-1 border rounded text-sm">
                        <option>Standard</option>
                        <option>Deluxe</option>
                        <option>Suite</option>
                        <option>Executive</option>
                        <option>Presidential</option>
                        <option>Family</option>
                        <option>Twin</option>
                      </select>
                    ) : a.roomType}
                  </td>
                  <td>
                    {editing === a.id ? (
                      <input type="date" value={editData.checkIn ?? a.checkIn} onChange={(e) => setEditData({ ...editData, checkIn: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" />
                    ) : a.checkIn || "\u2014"}
                  </td>
                  <td>
                    {editing === a.id ? (
                      <input type="date" value={editData.checkOut ?? a.checkOut} onChange={(e) => setEditData({ ...editData, checkOut: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" />
                    ) : a.checkOut || "\u2014"}
                  </td>
                  <td>
                    {editing === a.id ? (
                      <select value={editData.status ?? a.status} onChange={(e) => setEditData({ ...editData, status: e.target.value })} className="px-2 py-1 border rounded text-sm">
                        <option>Reserved</option>
                        <option>Checked In</option>
                        <option>Checked Out</option>
                        <option>Cancelled</option>
                        <option>No Show</option>
                      </select>
                    ) : (
                      <span className={`status-badge ${a.status === "Checked In" ? "paid" : a.status === "Cancelled" ? "pending" : a.status === "Checked Out" ? "planning" : "planning"}`}>{a.status}</span>
                    )}
                  </td>
                  <td>
                    {editing === a.id ? (
                      <input value={editData.notes ?? a.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} className="w-24 px-2 py-1 border rounded text-sm" />
                    ) : (a.notes || "\u2014")}
                  </td>
                  <td>
                    {editing === a.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleSave(a.id)} className="text-xs px-2 py-1 bg-green-500 text-white rounded cursor-pointer">Save</button>
                        <button onClick={() => setEditing(null)} className="text-xs px-2 py-1 bg-gray-300 text-gray-700 rounded cursor-pointer">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <button onClick={() => { setEditing(a.id); setEditData({}); }} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded cursor-pointer">Edit</button>
                        {deleteConfirm === a.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => handleDelete(a.id)} className="text-xs px-2 py-1 bg-red-500 text-white rounded cursor-pointer">Yes</button>
                            <button onClick={() => setDeleteConfirm(null)} className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded cursor-pointer">No</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(a.id)} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded cursor-pointer">Del</button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        type="rooms"
        onImport={async (items: any[]) => {
          await batchCreateRoomAllocations(weddingId, items);
          onUpdate();
        }}
      />
    </div>
  );
}
