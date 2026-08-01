"use client";

import { useState, useMemo } from "react";
import {
  createFamilyMember, updateFamilyMember, deleteFamilyMember,
  createFamilyRelationship, updateFamilyRelationship, deleteFamilyRelationship,
  createSeatingConflict, updateSeatingConflict, deleteSeatingConflict,
} from "@/lib/actions";

interface Props {
  wedding: any;
  weddingId: string;
  onUpdate: () => void;
  onToast: (msg: string, type?: "success" | "error") => void;
  canEdit?: boolean;
}

const SIDES = ["Bride", "Groom", "Mutual"];
const RELATIONS = ["Mother", "Father", "Brother", "Sister", "Uncle", "Aunt", "Cousin", "Grandmother", "Grandfather", "Nephew", "Niece", "In-law", "Friend", "Other"];
const SIDE_DETAILS = ["Paternal", "Maternal", "In-law", "Sibling"];
const STATUS_OPTIONS = ["Good", "Strained", "Estranged", "Feuding"];
const SEVERITY_OPTIONS = ["Low", "Medium", "High", "Critical"];

const STATUS_COLORS: Record<string, string> = {
  Good: "bg-green-100 text-green-700",
  Strained: "bg-yellow-100 text-yellow-700",
  Estranged: "bg-orange-100 text-orange-700",
  Feuding: "bg-red-100 text-red-700",
};

const SEVERITY_COLORS: Record<string, string> = {
  Low: "bg-yellow-100 text-yellow-700",
  Medium: "bg-orange-100 text-orange-700",
  High: "bg-red-100 text-red-700",
  Critical: "bg-red-200 text-red-800",
};

export default function FamilyPoliticsView({ wedding, weddingId, onUpdate, onToast, canEdit = true }: Props) {
  const members = wedding.familyMembers || [];
  const relationships = wedding.familyRelationships || [];
  const conflicts = wedding.seatingConflicts || [];

  const [activeTab, setActiveTab] = useState<"members" | "relationships" | "conflicts">("members");
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddRelationship, setShowAddRelationship] = useState(false);
  const [showAddConflict, setShowAddConflict] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", side: "Bride", relation: "", age: 0, sideDetail: "", notes: "" });
  const [newRel, setNewRel] = useState({ memberIdA: "", memberIdB: "", status: "Good", notes: "", conflictLevel: 0 });
  const [newConflict, setNewConflict] = useState({ guestName: "", conflictWith: "", severity: "Medium", reason: "", notes: "" });
  const [filterSide, setFilterSide] = useState("All");
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  const brideMembers = useMemo(() => members.filter((m: any) => m.side === "Bride"), [members]);
  const groomMembers = useMemo(() => members.filter((m: any) => m.side === "Groom"), [members]);
  const mutualMembers = useMemo(() => members.filter((m: any) => m.side === "Mutual"), [members]);

  const filteredMembers = useMemo(() => {
    if (filterSide === "All") return members;
    return members.filter((m: any) => m.side === filterSide);
  }, [members, filterSide]);

  const unresolvedConflicts = useMemo(() => conflicts.filter((c: any) => !c.resolved), [conflicts]);

  const handleAddMember = async () => {
    if (!newMember.name.trim()) return onToast("Name is required", "error");
    try {
      await createFamilyMember(weddingId, newMember);
      setNewMember({ name: "", side: "Bride", relation: "", age: 0, sideDetail: "", notes: "" });
      setShowAddMember(false);
      onUpdate();
      onToast("Family member added");
    } catch { onToast("Failed to add member", "error"); }
  };

  const handleSaveMember = async (id: string) => {
    try {
      await updateFamilyMember(weddingId, id, editData);
      setEditingMember(null);
      setEditData({});
      onUpdate();
      onToast("Member updated");
    } catch { onToast("Failed to update", "error"); }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await deleteFamilyMember(weddingId, id);
      onUpdate();
      onToast("Member deleted");
    } catch { onToast("Failed to delete", "error"); }
  };

  const handleAddRelationship = async () => {
    if (!newRel.memberIdA || !newRel.memberIdB) return onToast("Select two members", "error");
    if (newRel.memberIdA === newRel.memberIdB) return onToast("Cannot create relationship with self", "error");
    try {
      await createFamilyRelationship(weddingId, newRel);
      setNewRel({ memberIdA: "", memberIdB: "", status: "Good", notes: "", conflictLevel: 0 });
      setShowAddRelationship(false);
      onUpdate();
      onToast("Relationship added");
    } catch { onToast("Failed to add relationship", "error"); }
  };

  const handleSaveRelationship = async (id: string, data: any) => {
    try {
      await updateFamilyRelationship(weddingId, id, data);
      onUpdate();
      onToast("Relationship updated");
    } catch { onToast("Failed to update", "error"); }
  };

  const handleDeleteRelationship = async (id: string) => {
    try {
      await deleteFamilyRelationship(weddingId, id);
      onUpdate();
      onToast("Relationship deleted");
    } catch { onToast("Failed to delete", "error"); }
  };

  const handleAddConflict = async () => {
    if (!newConflict.guestName.trim()) return onToast("Guest name is required", "error");
    try {
      await createSeatingConflict(weddingId, newConflict);
      setNewConflict({ guestName: "", conflictWith: "", severity: "Medium", reason: "", notes: "" });
      setShowAddConflict(false);
      onUpdate();
      onToast("Conflict added");
    } catch { onToast("Failed to add conflict", "error"); }
  };

  const handleResolveConflict = async (id: string, resolved: boolean) => {
    try {
      await updateSeatingConflict(weddingId, id, { resolved });
      onUpdate();
    } catch { onToast("Failed to update", "error"); }
  };

  const handleDeleteConflict = async (id: string) => {
    try {
      await deleteSeatingConflict(weddingId, id);
      onUpdate();
      onToast("Conflict deleted");
    } catch { onToast("Failed to delete", "error"); }
  };

  const getMemberName = (id: string) => members.find((m: any) => m.id === id)?.name || "Unknown";

  const renderMemberCard = (member: any) => (
    <div key={member.id} className={`bg-white rounded-xl border p-3 ${member.side === "Bride" ? "border-pink-200" : member.side === "Groom" ? "border-blue-200" : "border-gray-200"}`}>
      {editingMember === member.id ? (
        <div className="space-y-2">
          <input value={editData.name ?? member.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Name" />
          <div className="grid grid-cols-2 gap-2">
            <select value={editData.side ?? member.side} onChange={(e) => setEditData({ ...editData, side: e.target.value })} className="px-3 py-2 border rounded-lg text-sm">
              {SIDES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={editData.relation ?? member.relation} onChange={(e) => setEditData({ ...editData, relation: e.target.value })} className="px-3 py-2 border rounded-lg text-sm">
              <option value="">Relation</option>
              {RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select value={editData.sideDetail ?? member.sideDetail} onChange={(e) => setEditData({ ...editData, sideDetail: e.target.value })} className="px-3 py-2 border rounded-lg text-sm">
              <option value="">Side detail</option>
              {SIDE_DETAILS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <input type="number" value={(editData.age ?? member.age) || ""} onChange={(e) => setEditData({ ...editData, age: parseInt(e.target.value) || 0 })} placeholder="Age" className="px-3 py-2 border rounded-lg text-sm" />
          </div>
          <button onClick={() => handleSaveMember(member.id)} className="w-full py-2 bg-maroon text-white rounded-lg text-sm font-semibold cursor-pointer">Save</button>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="font-bold text-gray-900">{member.name}</span>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className={`text-[0.65rem] px-2 py-0.5 rounded-full ${member.side === "Bride" ? "bg-pink-100 text-pink-700" : member.side === "Groom" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{member.side}</span>
                {member.relation && <span className="text-[0.65rem] text-gray-500">{member.relation}</span>}
                {member.sideDetail && <span className="text-[0.65rem] text-gray-400">({member.sideDetail})</span>}
              </div>
            </div>
            {canEdit && (
              <div className="flex gap-1 shrink-0">
                <button onClick={() => { setEditingMember(member.id); setEditData({}); }}
                  className="w-7 h-7 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center cursor-pointer"><i className="fas fa-pen text-xs" /></button>
                <button onClick={() => handleDeleteMember(member.id)}
                  className="w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center cursor-pointer"><i className="fas fa-trash text-xs" /></button>
              </div>
            )}
          </div>
          {member.notes && <p className="text-xs text-gray-400 mt-1">{member.notes}</p>}
        </>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Family Map</h1>
          <p className="text-sm text-gray-500 mt-1">Manage family relationships and prevent seating conflicts</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            {unresolvedConflicts.length > 0 && (
              <span className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg font-semibold">
                <i className="fas fa-exclamation-triangle mr-1" /> {unresolvedConflicts.length} conflicts
              </span>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Bride Side", value: brideMembers.length, color: "bg-pink-100 text-pink-600" },
          { label: "Groom Side", value: groomMembers.length, color: "bg-blue-100 text-blue-600" },
          { label: "Relationships", value: relationships.length, color: "bg-purple-100 text-purple-600" },
          { label: "Conflicts", value: unresolvedConflicts.length, color: "bg-red-100 text-red-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center mb-2`}>
              <i className="fas fa-people-group text-sm" />
            </div>
            <div className="text-xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
        {(["members", "relationships", "conflicts"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors cursor-pointer ${activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {tab === "members" ? "Family Members" : tab === "relationships" ? "Relationships" : `Conflicts (${unresolvedConflicts.length})`}
          </button>
        ))}
      </div>

      {activeTab === "members" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {["All", ...SIDES].map((s) => (
                <button key={s} onClick={() => setFilterSide(s)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full cursor-pointer ${filterSide === s ? "bg-maroon text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {s}
                </button>
              ))}
            </div>
            {canEdit && (
              <button onClick={() => setShowAddMember(true)} className="px-4 py-2 text-sm bg-maroon text-white rounded-lg font-semibold hover:bg-maroon-dark cursor-pointer">
                <i className="fas fa-plus mr-1" /> Add Member
              </button>
            )}
          </div>

          {/* Family Tree View */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-bold text-pink-600 mb-2 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-pink-400" /> Bride&apos;s Family
              </h3>
              <div className="space-y-2">
                {brideMembers.length === 0 && <p className="text-xs text-gray-400 italic">No members yet</p>}
                {brideMembers.map(renderMemberCard)}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-blue-600 mb-2 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-400" /> Groom&apos;s Family
              </h3>
              <div className="space-y-2">
                {groomMembers.length === 0 && <p className="text-xs text-gray-400 italic">No members yet</p>}
                {groomMembers.map(renderMemberCard)}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-600 mb-2 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gray-400" /> Mutual
              </h3>
              <div className="space-y-2">
                {mutualMembers.length === 0 && <p className="text-xs text-gray-400 italic">No members yet</p>}
                {mutualMembers.map(renderMemberCard)}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "relationships" && (
        <>
          {canEdit && (
            <div className="mb-4">
              <button onClick={() => setShowAddRelationship(true)} className="px-4 py-2 text-sm bg-maroon text-white rounded-lg font-semibold hover:bg-maroon-dark cursor-pointer">
                <i className="fas fa-plus mr-1" /> Add Relationship
              </button>
            </div>
          )}
          <div className="space-y-2">
            {relationships.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <i className="fas fa-link text-4xl mb-3" />
                <p>No relationships defined yet.</p>
              </div>
            )}
            {relationships.map((rel: any) => (
              <div key={rel.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-center">
                      <div className="font-bold text-sm text-gray-900">{getMemberName(rel.memberIdA)}</div>
                      <div className="text-[0.6rem] text-gray-400">{members.find((m: any) => m.id === rel.memberIdA)?.side}</div>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <i className={`fas ${rel.conflictLevel >= 3 ? "fa-bolt text-red-500" : rel.conflictLevel >= 2 ? "fa-minus text-orange-400" : rel.conflictLevel >= 1 ? "fa-minus text-yellow-400" : "fa-heart text-green-500"} text-lg`} />
                      <span className={`text-[0.6rem] px-2 py-0.5 rounded-full ${STATUS_COLORS[rel.status] || "bg-gray-100"}`}>{rel.status}</span>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-sm text-gray-900">{getMemberName(rel.memberIdB)}</div>
                      <div className="text-[0.6rem] text-gray-400">{members.find((m: any) => m.id === rel.memberIdB)?.side}</div>
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1 shrink-0">
                      <select value={rel.status} onChange={(e) => handleSaveRelationship(rel.id, { status: e.target.value })}
                        className="px-2 py-1 border rounded-lg text-xs cursor-pointer">
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button onClick={() => handleDeleteRelationship(rel.id)}
                        className="w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center cursor-pointer"><i className="fas fa-trash text-xs" /></button>
                    </div>
                  )}
                </div>
                {rel.notes && <p className="text-xs text-gray-400 mt-2">{rel.notes}</p>}
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === "conflicts" && (
        <>
          {canEdit && (
            <div className="mb-4">
              <button onClick={() => setShowAddConflict(true)} className="px-4 py-2 text-sm bg-maroon text-white rounded-lg font-semibold hover:bg-maroon-dark cursor-pointer">
                <i className="fas fa-plus mr-1" /> Add Conflict
              </button>
            </div>
          )}
          <div className="space-y-2">
            {conflicts.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <i className="fas fa-shield-halved text-4xl mb-3" />
                <p>No conflicts recorded. Great!</p>
              </div>
            )}
            {conflicts.map((conflict: any) => (
              <div key={conflict.id} className={`bg-white rounded-xl border p-4 ${conflict.resolved ? "border-green-200 opacity-60" : "border-gray-200"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900">{conflict.guestName}</span>
                      <i className="fas fa-xmark text-gray-400 text-xs" />
                      <span className="font-bold text-gray-900">{conflict.conflictWith}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${SEVERITY_COLORS[conflict.severity]}`}>{conflict.severity}</span>
                      {conflict.resolved && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Resolved</span>}
                    </div>
                    {conflict.reason && <p className="text-sm text-gray-500 mt-1">{conflict.reason}</p>}
                  </div>
                  {canEdit && (
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => handleResolveConflict(conflict.id, !conflict.resolved)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer ${conflict.resolved ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                        <i className={`fas ${conflict.resolved ? "fa-undo" : "fa-check"} text-xs`} />
                      </button>
                      <button onClick={() => handleDeleteConflict(conflict.id)}
                        className="w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center cursor-pointer"><i className="fas fa-trash text-xs" /></button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAddMember(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Family Member</h3>
            <div className="space-y-3">
              <input value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} placeholder="Full name" className="w-full px-3 py-2 border rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <select value={newMember.side} onChange={(e) => setNewMember({ ...newMember, side: e.target.value })} className="px-3 py-2 border rounded-lg text-sm">
                  {SIDES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={newMember.relation} onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })} className="px-3 py-2 border rounded-lg text-sm">
                  <option value="">Relation</option>
                  {RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={newMember.sideDetail} onChange={(e) => setNewMember({ ...newMember, sideDetail: e.target.value })} className="px-3 py-2 border rounded-lg text-sm">
                  <option value="">Side detail</option>
                  {SIDE_DETAILS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <input type="number" value={newMember.age || ""} onChange={(e) => setNewMember({ ...newMember, age: parseInt(e.target.value) || 0 })} placeholder="Age (optional)" className="px-3 py-2 border rounded-lg text-sm" />
              </div>
              <textarea value={newMember.notes} onChange={(e) => setNewMember({ ...newMember, notes: e.target.value })} placeholder="Notes (optional)" className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleAddMember} className="flex-1 py-2 bg-maroon text-white rounded-lg font-semibold text-sm hover:bg-maroon-dark cursor-pointer">Add Member</button>
              <button onClick={() => setShowAddMember(false)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Relationship Modal */}
      {showAddRelationship && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAddRelationship(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Relationship</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Person A</label>
                <select value={newRel.memberIdA} onChange={(e) => setNewRel({ ...newRel, memberIdA: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="">Select member</option>
                  {members.map((m: any) => <option key={m.id} value={m.id}>{m.name} ({m.side})</option>)}
                </select>
              </div>
              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <i className="fas fa-arrows-left-right text-gray-400 text-xs" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Person B</label>
                <select value={newRel.memberIdB} onChange={(e) => setNewRel({ ...newRel, memberIdB: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="">Select member</option>
                  {members.map((m: any) => <option key={m.id} value={m.id}>{m.name} ({m.side})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Status</label>
                <select value={newRel.status} onChange={(e) => setNewRel({ ...newRel, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <textarea value={newRel.notes} onChange={(e) => setNewRel({ ...newRel, notes: e.target.value })} placeholder="Notes (optional)" className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleAddRelationship} className="flex-1 py-2 bg-maroon text-white rounded-lg font-semibold text-sm hover:bg-maroon-dark cursor-pointer">Add Relationship</button>
              <button onClick={() => setShowAddRelationship(false)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Conflict Modal */}
      {showAddConflict && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAddConflict(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Seating Conflict</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Guest Name</label>
                  <input value={newConflict.guestName} onChange={(e) => setNewConflict({ ...newConflict, guestName: e.target.value })} placeholder="Guest name" className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Conflicts With</label>
                  <input value={newConflict.conflictWith} onChange={(e) => setNewConflict({ ...newConflict, conflictWith: e.target.value })} placeholder="Other guest name" className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Severity</label>
                <div className="flex gap-2">
                  {SEVERITY_OPTIONS.map((s) => (
                    <button key={s} onClick={() => setNewConflict({ ...newConflict, severity: s })}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg border cursor-pointer ${newConflict.severity === s ? SEVERITY_COLORS[s] + " border-current" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <textarea value={newConflict.reason} onChange={(e) => setNewConflict({ ...newConflict, reason: e.target.value })} placeholder="Reason (optional)" className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleAddConflict} className="flex-1 py-2 bg-maroon text-white rounded-lg font-semibold text-sm hover:bg-maroon-dark cursor-pointer">Add Conflict</button>
              <button onClick={() => setShowAddConflict(false)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
