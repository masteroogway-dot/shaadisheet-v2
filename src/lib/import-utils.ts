import * as XLSX from "xlsx";

export type ImportType = "budget" | "vendors" | "guests";

export interface FieldMapping {
  sourceColumn: string;
  targetField: string;
  confidence: "high" | "medium" | "low" | "ignored";
  reason?: string;
}

export interface ParsedData {
  headers: string[];
  rows: Record<string, any>[];
  sheetName: string;
  sheetNames: string[];
}

export interface MappingResult {
  mappings: FieldMapping[];
  unmappedColumns: string[];
  warnings: { field: string; message: string }[];
}

const FIELD_KEYWORDS: Record<ImportType, Record<string, string[]>> = {
  budget: {
    category: ["category", "cat", "type", "group", "classification", "head"],
    item: ["item", "name", "description", "detail", "what", "expense", "cost head", "budget item", "particulars"],
    estimated: ["estimated", "estimate", "budget", "planned", "expected", "forecast", "target", "allocated", "amount", "cost", "price", "value", "rupees", "inr", "\u20B9"],
    actual: ["actual", "real", "final", "actual cost", "actual amount", "actual price"],
    paid: ["paid", "payment", "amount paid", "deposited", "advance", "down payment"],
    balance: ["balance", "remaining", "due", "outstanding", "pending amount", "left"],
    status: ["status", "state", "condition"],
    dueDate: ["due", "deadline", "date", "by when", "due date", "payment date"],
    notes: ["notes", "note", "remark", "remarks", "comment", "comments", "memo", "description", "info"],
  },
  vendors: {
    category: ["category", "cat", "type", "service", "vendor type", "kind"],
    name: ["name", "vendor", "vendor name", "company", "business", "firm", "supplier", "who"],
    contact: ["contact", "phone", "mobile", "email", "number", "reach", "call"],
    quote: ["quote", "cost", "price", "amount", "charge", "fee", "budget", "estimated", "total", "\u20B9", "inr", "rupees"],
    paid: ["paid", "payment", "advance", "deposited"],
    rating: ["rating", "rank", "score", "review", "stars", "quality"],
    contract: ["contract", "agreement", "status", "signed", "booked"],
    notes: ["notes", "note", "remark", "remarks", "comment", "memo"],
  },
  guests: {
    name: ["name", "guest", "guest name", "who", "person", "invitee", "full name"],
    relation: ["relation", "relationship", "relative", "friend", "connection", "how know"],
    side: ["side", "bride", "groom", "family", "whose side"],
    rsvp: ["rsvp", "status", "response", "attending", "confirmed", "reply"],
    dietary: ["dietary", "food", "diet", "veg", "non-veg", "preference", "meal"],
    notes: ["notes", "note", "remark", "comment", "memo", "info"],
  },
};

function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

function detectColumnType(values: any[]): "number" | "currency" | "date" | "text" {
  const nonEmpty = values.filter((v) => v !== null && v !== undefined && v !== "");
  if (nonEmpty.length === 0) return "text";

  let numCount = 0;
  let dateCount = 0;
  let currencyCount = 0;

  for (const v of nonEmpty) {
    const s = String(v).trim();
    if (/^[\u20B9$\u20A6\u20B1]?\s*[\d,.\s]+$/.test(s) || /^\d{1,3}(,\d{2,3})*(\.\d+)?$/.test(s)) {
      currencyCount++;
    } else if (!isNaN(Number(s.replace(/[,\s]/g, "")))) {
      numCount++;
    } else if (/\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/.test(s) || /\d{4}[\/-]\d{1,2}[\/-]\d{1,2}/.test(s)) {
      dateCount++;
    }
  }

  const total = nonEmpty.length;
  if (currencyCount / total > 0.7) return "currency";
  if (numCount / total > 0.7) return "number";
  if (dateCount / total > 0.5) return "date";
  return "text";
}

function parseCurrencyValue(val: any): number {
  if (typeof val === "number") return val;
  const s = String(val).replace(/[^\d.-]/g, "");
  const n = parseFloat(s);
  return isNaN(n) ? 0 : Math.round(n);
}

function scoreMatch(header: string, keywords: string[]): number {
  const norm = normalizeHeader(header);
  for (const kw of keywords) {
    const normKw = kw.replace(/\s+/g, "");
    if (norm === normKw) return 100;
    if (norm.includes(normKw) || normKw.includes(norm)) return 80;
    const words = norm.split(/(?=[A-Z])/).flatMap((w) => w.split(/\s+/));
    for (const word of words) {
      if (word === normKw || kw.split(" ").includes(word)) return 60;
    }
  }
  return 0;
}

export function parseFile(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

        if (jsonData.length === 0) {
          reject(new Error("File is empty"));
          return;
        }

        const firstRow = jsonData[0] as any[];
        const secondRow = jsonData[1] as any[];
        let headers: string[];
        let startIdx: number;

        const firstRowIsHeader = firstRow.some((cell: any) => {
          const s = String(cell).toLowerCase();
          return s.length > 0 && isNaN(Number(s)) && !/\d{1,2}[\/-]\d{1,2}[\/-]/.test(s);
        });

        if (firstRowIsHeader) {
          headers = firstRow.map((h: any) => String(h || "").trim());
          startIdx = 1;
        } else {
          headers = firstRow.map((_: any, i: number) => `Column ${i + 1}`);
          startIdx = 0;
        }

        const rows: Record<string, any>[] = [];
        for (let i = startIdx; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          const allEmpty = row.every((cell: any) => cell === null || cell === undefined || cell === "");
          if (allEmpty) continue;
          const obj: Record<string, any> = {};
          headers.forEach((h, j) => {
            obj[h] = row[j] ?? "";
          });
          rows.push(obj);
        }

        resolve({
          headers,
          rows,
          sheetName,
          sheetNames: workbook.SheetNames,
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

export function autoMapColumns(
  headers: string[],
  type: ImportType
): MappingResult {
  const keywords = FIELD_KEYWORDS[type];
  const mappings: FieldMapping[] = [];
  const unmappedColumns: string[] = [];
  const warnings: { field: string; message: string }[] = [];
  const usedFields = new Set<string>();

  for (const header of headers) {
    let bestField = "";
    let bestScore = 0;

    for (const [field, kws] of Object.entries(keywords)) {
      const score = scoreMatch(header, kws);
      if (score > bestScore) {
        bestScore = score;
        bestField = field;
      }
    }

    if (bestScore >= 60 && !usedFields.has(bestField)) {
      const confidence = bestScore >= 80 ? "high" : "medium";
      mappings.push({
        sourceColumn: header,
        targetField: bestField,
        confidence,
      });
      usedFields.add(bestField);
    } else if (bestScore >= 40 && !usedFields.has(bestField)) {
      mappings.push({
        sourceColumn: header,
        targetField: bestField,
        confidence: "low",
        reason: `"${header}" might map to ${bestField} but we're not sure`,
      });
      usedFields.add(bestField);
    } else {
      unmappedColumns.push(header);
    }
  }

  const requiredFields = type === "budget"
    ? ["item"]
    : type === "vendors"
    ? ["name"]
    : ["name"];

  for (const field of requiredFields) {
    if (!usedFields.has(field)) {
      warnings.push({
        field,
        message: `No column found for "${field}" — this is required. Please map it manually or add a column with ${field} data.`,
      });
    }
  }

  const importantFields = type === "budget"
    ? ["estimated", "category"]
    : type === "vendors"
    ? ["category", "quote"]
    : ["relation", "side"];

  for (const field of importantFields) {
    if (!usedFields.has(field)) {
      warnings.push({
        field,
        message: `No column matched for "${field}". You can map it manually or skip it.`,
      });
    }
  }

  return { mappings, unmappedColumns, warnings };
}

export function applyMappings(
  rows: Record<string, any>[],
  mappings: FieldMapping[],
  type: ImportType
): any[] {
  return rows
    .filter((row) => {
      return Object.values(row).some((v) => v !== null && v !== undefined && v !== "");
    })
    .map((row) => {
      const result: Record<string, any> = {};
      for (const mapping of mappings) {
        if (mapping.targetField === "ignored") continue;
        let val = row[mapping.sourceColumn];
        if (val === undefined || val === null) val = "";

        const fieldType = detectColumnType(
          rows.map((r) => r[mapping.sourceColumn])
        );

        if (fieldType === "currency" || fieldType === "number") {
          result[mapping.targetField] = parseCurrencyValue(val);
        } else {
          result[mapping.targetField] = String(val).trim();
        }
      }

      if (type === "budget") {
        if (!result.category) result.category = "";
        if (!result.item) result.item = "";
        if (result.estimated === undefined) result.estimated = 0;
        if (result.actual === undefined) result.actual = 0;
        if (result.paid === undefined) result.paid = 0;
        result.balance = (result.estimated || 0) - (result.paid || 0);
        if (!result.status) {
          if (result.paid >= result.estimated && result.estimated > 0) result.status = "Paid";
          else if (result.paid > 0) result.status = "Partial";
          else result.status = "Pending";
        }
        if (!result.notes) result.notes = "";
      } else if (type === "vendors") {
        if (!result.category) result.category = "";
        if (!result.name) result.name = "";
        if (!result.contact) result.contact = "";
        if (result.quote === undefined) result.quote = 0;
        if (result.paid === undefined) result.paid = 0;
        result.balance = (result.quote || 0) - (result.paid || 0);
        if (!result.rating) result.rating = "\u2605\u2605\u2605\u2605\u2606";
        if (!result.contract) result.contract = "Pending";
        if (!result.notes) result.notes = "";
      } else if (type === "guests") {
        if (!result.name) result.name = "";
        if (!result.relation) result.relation = "";
        if (!result.side) result.side = "Both";
        if (!result.rsvp) result.rsvp = "Pending";
        if (!result.dietary) result.dietary = "Veg";
        if (!result.notes) result.notes = "";
      }

      return result;
    });
}
