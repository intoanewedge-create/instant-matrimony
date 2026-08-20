"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, Check, X, Loader2 } from "lucide-react";

interface MasterDataItem {
  id: string;
  name: string;
  order?: number;
  code?: string;
  category?: string;
}

interface EditableMasterDataListProps {
  category: string;
  items: MasterDataItem[];
  labelField?: string; // "order" | "code" | "category" | "status"
  labelPrefix?: string;
}

export function EditableMasterDataList({
  category,
  items: initialItems,
  labelField = "order",
  labelPrefix = "Order",
}: EditableMasterDataListProps) {
  const [items, setItems] = useState<MasterDataItem[]>(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const getLabelValue = (item: MasterDataItem) => {
    if (labelField === "code") return item.code || "ISO";
    if (labelField === "category") return item.category || "Degree";
    if (labelField === "status") return "Active";
    return `${item.order ?? 0}`;
  };

  const startEdit = (item: MasterDataItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditLabel(getLabelValue(item));
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditLabel("");
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    setLoading(editingId);
    try {
      const body: any = { category, id: editingId, name: editName.trim() };
      if (labelField === "order") body.order = parseInt(editLabel) || 0;
      if (labelField === "code") body.code = editLabel;

      const res = await fetch("/api/master-data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (result.success) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === editingId ? { ...item, ...result.data } : item
          )
        );
        cancelEdit();
      } else {
        alert(result.error || "Failed to update");
      }
    } catch {
      alert("Network error while updating");
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    setLoading(id);
    try {
      const res = await fetch(
        `/api/master-data?category=${category}&id=${id}`,
        { method: "DELETE" }
      );
      const result = await res.json();
      if (result.success) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert(result.error || "Failed to delete");
      }
    } catch {
      alert("Network error while deleting");
    } finally {
      setLoading(null);
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setLoading("new");
    try {
      const body: any = { category, name: newName.trim() };
      if (labelField === "order") body.order = parseInt(newLabel) || 0;
      if (labelField === "code") body.code = newLabel;

      const res = await fetch("/api/master-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (result.success) {
        setItems((prev) => [...prev, result.data]);
        setNewName("");
        setNewLabel("");
        setIsAdding(false);
      } else {
        alert(result.error || "Failed to add");
      }
    } catch {
      alert("Network error while adding");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between group transition-all hover:border-rose-200 hover:bg-rose-50/30"
            >
              {editingId === item.id ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit();
                      if (e.key === "Escape") cancelEdit();
                    }}
                  />
                  <button
                    onClick={saveEdit}
                    disabled={loading === item.id}
                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                  >
                    {loading === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-1 text-slate-400 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-sm font-medium text-slate-800">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                      {labelField === "status"
                        ? "Active"
                        : `${labelPrefix}: ${getLabelValue(item)}`}
                    </span>
                    <button
                      onClick={() => startEdit(item)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={loading === item.id}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      {loading === item.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full py-8 text-center text-slate-500">
            No entries found. Click &quot;Add New&quot; to create one.
          </div>
        )}
      </div>

      {/* Add New Entry */}
      {isAdding ? (
        <div className="flex items-center gap-2 p-3 border border-dashed border-rose-300 bg-rose-50/50 rounded-xl">
          <input
            type="text"
            placeholder="Enter name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") {
                setIsAdding(false);
                setNewName("");
                setNewLabel("");
              }
            }}
          />
          {labelField !== "status" && (
            <input
              type="text"
              placeholder={labelPrefix}
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-24 text-xs text-slate-600 bg-white border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          )}
          <button
            onClick={handleAdd}
            disabled={loading === "new"}
            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
          >
            {loading === "new" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => {
              setIsAdding(false);
              setNewName("");
              setNewLabel("");
            }}
            className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <Button
          onClick={() => {
            setIsAdding(true);
            cancelEdit();
          }}
          variant="outline"
          className="border-dashed border-rose-300 text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-xs font-semibold gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Add New Entry
        </Button>
      )}
    </div>
  );
}
