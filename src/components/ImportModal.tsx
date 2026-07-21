"use client";

import { useState, useRef, useCallback } from "react";
import {
  parseFile,
  autoMapColumns,
  applyMappings,
  ImportType,
  FieldMapping,
  ParsedData,
  MappingResult,
} from "@/lib/import-utils";

interface Props {
  open: boolean;
  onClose: () => void;
  type: ImportType;
  onImport: (items: any[]) => Promise<void>;
}

const FIELD_LABELS: Record<ImportType, Record<string, string>> = {
  budget: {
    category: "Category",
    item: "Item Name",
    estimated: "Estimated Cost",
    actual: "Actual Cost",
    paid: "Paid Amount",
    balance: "Balance",
    status: "Status",
    dueDate: "Due Date",
    notes: "Notes",
  },
  vendors: {
    category: "Category",
    name: "Vendor Name",
    contact: "Contact",
    quote: "Quote",
    paid: "Paid",
    rating: "Rating",
    contract: "Contract",
    notes: "Notes",
  },
  guests: {
    name: "Guest Name",
    relation: "Relation",
    side: "Side",
    rsvp: "RSVP",
    dietary: "Dietary",
    notes: "Notes",
  },
};

type Step = "upload" | "mapping" | "preview" | "importing" | "done";

export default function ImportModal({ open, onClose, type, onImport }: Props) {
  const [step, setStep] = useState<Step>("upload");
  const [parsed, setParsed] = useState<ParsedData | null>(null);
  const [mappingResult, setMappingResult] = useState<MappingResult | null>(null);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const reset = () => {
    setStep("upload");
    setParsed(null);
    setMappingResult(null);
    setMappings([]);
    setPreviewRows([]);
    setError("");
    setImporting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const processFile = useCallback(async (file: File) => {
    setError("");
    try {
      const data = await parseFile(file);
      setParsed(data);
      const result = autoMapColumns(data.headers, type);
      setMappingResult(result);
      setMappings([...result.mappings]);
      setStep("mapping");
    } catch (e: any) {
      setError(e.message || "Failed to parse file");
    }
  }, [type]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleMappingChange = (sourceColumn: string, targetField: string) => {
    setMappings((prev) => {
      const existing = prev.find((m) => m.sourceColumn === sourceColumn);
      if (existing) {
        return prev.map((m) =>
          m.sourceColumn === sourceColumn
            ? { ...m, targetField, confidence: targetField === "ignored" ? "ignored" as const : "high" as const }
            : m
        );
      } else if (targetField !== "ignored") {
        return [...prev, { sourceColumn, targetField, confidence: "high" as const }];
      }
      return prev;
    });
  };

  const handlePreview = () => {
    if (!parsed) return;
    const rows = applyMappings(parsed.rows.slice(0, 5), mappings, type);
    setPreviewRows(rows);
    setStep("preview");
  };

  const handleImport = async () => {
    if (!parsed) return;
    setImporting(true);
    setStep("importing");
    try {
      const rows = applyMappings(parsed.rows, mappings, type);
      await onImport(rows);
      setStep("done");
    } catch (e: any) {
      setError(e.message || "Import failed");
      setStep("preview");
    } finally {
      setImporting(false);
    }
  };

  if (!open) return null;

  const allFields = Object.keys(FIELD_LABELS[type]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[800px] max-h-[85vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold">Import from Excel / CSV</h2>
            <p className="text-sm text-gray-500">
              {type === "budget" ? "Import budget items" : type === "vendors" ? "Import vendors" : "Import guests"}
            </p>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
              <button onClick={() => setError("")} className="ml-auto text-red-500 hover:text-red-700 cursor-pointer">Dismiss</button>
            </div>
          )}

          {/* Step: Upload */}
          {step === "upload" && (
            <div
              ref={dragRef}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                dragging ? "border-maroon bg-maroon/5" : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-maroon/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-maroon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-1">Drop your file here</h3>
              <p className="text-gray-500 text-sm mb-4">or click to browse</p>
              <button
                onClick={() => fileRef.current?.click()}
                className="px-5 py-2.5 bg-maroon text-white font-semibold rounded-lg hover:bg-maroon-dark transition-colors cursor-pointer"
              >
                Choose File
              </button>
              <p className="text-xs text-gray-400 mt-4">Supports .xlsx, .xls, .csv files</p>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* Step: Mapping */}
          {step === "mapping" && parsed && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Found <span className="font-bold text-gray-900">{parsed.rows.length}</span> rows in{" "}
                    <span className="font-bold text-gray-900">"{parsed.sheetName}"</span>
                  </p>
                </div>
                <button
                  onClick={() => { setStep("upload"); setParsed(null); }}
                  className="text-sm text-maroon font-medium hover:underline cursor-pointer"
                >
                  Choose different file
                </button>
              </div>

              {/* Warnings */}
              {mappingResult && mappingResult.warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="font-bold text-amber-800 text-sm">A few things need your attention</span>
                  </div>
                  {mappingResult.warnings.map((w, i) => (
                    <p key={i} className="text-sm text-amber-700 ml-7">{w.message}</p>
                  ))}
                </div>
              )}

              {/* Column Mapping */}
              <div>
                <h3 className="font-bold mb-3">Column Mapping</h3>
                <p className="text-sm text-gray-500 mb-4">
                  We auto-detected the best match for each column. Adjust if needed, or set to "Ignore" to skip a column.
                </p>
                <div className="space-y-3">
                  {parsed.headers.map((header) => {
                    const mapping = mappings.find((m) => m.sourceColumn === header);
                    const currentTarget = mapping?.targetField || "";
                    const confidence = mapping?.confidence || "ignored";
                    const sampleValues = parsed.rows.slice(0, 3).map((r) => r[header]).filter(Boolean);

                    return (
                      <div key={header} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">{header}</div>
                          <div className="text-xs text-gray-400 truncate">
                            {sampleValues.slice(0, 2).join(", ")}
                            {sampleValues.length > 2 && ` (+${sampleValues.length - 2} more)`}
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <select
                          value={currentTarget}
                          onChange={(e) => handleMappingChange(header, e.target.value)}
                          className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-maroon bg-white min-w-[180px] cursor-pointer"
                        >
                          <option value="ignored">Ignore this column</option>
                          {allFields
                            .filter((f) => f === currentTarget || !mappings.some((m) => m.targetField === f && m.sourceColumn !== header))
                            .map((f) => (
                              <option key={f} value={f}>{FIELD_LABELS[type][f]}</option>
                            ))}
                        </select>
                        {confidence !== "ignored" && (
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            confidence === "high" ? "bg-green-100 text-green-700" :
                            confidence === "medium" ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {confidence}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Data Preview */}
              <div>
                <h3 className="font-bold mb-3">Preview (first 5 rows)</h3>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="spreadsheet">
                    <thead>
                      <tr>
                        {parsed.headers.map((h) => {
                          const m = mappings.find((mm) => mm.sourceColumn === h);
                          const isIgnored = !m || m.targetField === "ignored";
                          return (
                            <th key={h} className={isIgnored ? "text-gray-300 line-through" : ""}>
                              {h}
                              {m && !isIgnored && (
                                <span className="block text-[0.65rem] font-normal text-maroon normal-case">
                                  {"\u2192"} {FIELD_LABELS[type][m.targetField]}
                                </span>
                              )}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.rows.slice(0, 5).map((row, i) => (
                        <tr key={i}>
                          {parsed.headers.map((h) => (
                            <td key={h}>{String(row[h] ?? "")}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Step: Preview mapped data */}
          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-3 rounded-lg">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">
                  Ready to import <strong>{parsed?.rows.length}</strong> {type} items
                </span>
              </div>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="spreadsheet">
                  <thead>
                    <tr>
                      {allFields.filter((f) => previewRows.some((r) => r[f] !== undefined && r[f] !== "")).map((f) => (
                        <th key={f}>{FIELD_LABELS[type][f]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, i) => (
                      <tr key={i}>
                        {allFields.filter((f) => previewRows.some((r) => r[f] !== undefined && r[f] !== "")).map((f) => (
                          <td key={f}>
                            {f.includes("estimated") || f.includes("actual") || f.includes("paid") || f.includes("quote") || f.includes("balance")
                              ? `\u20B9${(row[f] || 0).toLocaleString("en-IN")}`
                              : String(row[f] || "\u2014")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400">
                Showing first 5 rows. All {parsed?.rows.length} rows will be imported.
              </p>
            </div>
          )}

          {/* Step: Importing */}
          {step === "importing" && (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-maroon border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Importing data...</p>
            </div>
          )}

          {/* Step: Done */}
          {step === "done" && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-1">Import complete!</h3>
              <p className="text-gray-500 text-sm">{parsed?.rows.length} items imported successfully.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <button onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer">
            {step === "done" ? "Close" : "Cancel"}
          </button>
          <div className="flex gap-2">
            {step === "mapping" && (
              <>
                <button onClick={() => { setStep("upload"); setParsed(null); }} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg cursor-pointer">
                  Back
                </button>
                <button onClick={handlePreview} className="px-5 py-2 text-sm font-semibold text-white bg-maroon rounded-lg hover:bg-maroon-dark transition-colors cursor-pointer">
                  Preview Import
                </button>
              </>
            )}
            {step === "preview" && (
              <>
                <button onClick={() => setStep("mapping")} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg cursor-pointer">
                  Back to Mapping
                </button>
                <button onClick={handleImport} className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-br from-maroon to-maroon-light rounded-lg hover:shadow-md transition-all cursor-pointer">
                  Import {parsed?.rows.length} Items
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
