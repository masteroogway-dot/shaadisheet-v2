import * as XLSX from "xlsx";

interface TemplateConfig {
  sheetName: string;
  headers: string[];
  sampleRows: any[][];
  columnWidths: { wch: number }[];
}

const TEMPLATES: Record<string, TemplateConfig> = {
  guests: {
    sheetName: "Guests",
    headers: ["Guest Name", "Relation", "Side", "RSVP", "Dietary", "Notes"],
    sampleRows: [
      ["Rahul Sharma", "Brother", "Groom", "Yes", "Veg", "College friend"],
      ["Priya Patel", "Cousin", "Bride", "Pending", "Non-Veg", ""],
      ["Amit Kumar", "Uncle", "Both", "Yes", "Jain", "Vegetarian only"],
    ],
    columnWidths: [{ wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 25 }],
  },
  vendors: {
    sheetName: "Vendors",
    headers: ["Vendor Name", "Category", "Contact", "Quote", "Paid", "Rating", "Contract", "Notes"],
    sampleRows: [
      ["Sharma Catering", "Catering", "9876543210", "500000", "100000", "★★★★☆", "Signed", "Veg + Non-Veg menu"],
      ["Dream Decor", "Decoration", "decor@email.com", "300000", "0", "★★★☆☆", "Pending", "Floral arrangements"],
      ["Beatbox Brothers", "DJ", "9123456789", "80000", "80000", "★★★★★", "Completed", "Bollywood + EDM"],
    ],
    columnWidths: [{ wch: 22 }, { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 25 }],
  },
  budget: {
    sheetName: "Budget",
    headers: ["Item Name", "Category", "Estimated Cost", "Actual Cost", "Paid Amount", "Status", "Due Date", "Notes"],
    sampleRows: [
      ["Venue Booking", "Venue", "200000", "180000", "180000", "Paid", "2026-03-15", "Grand Palace Banquet"],
      ["Catering (100 guests)", "Food", "150000", "", "50000", "Partial", "2026-04-01", "Veg + Non-Veg"],
      ["Photography", "Media", "80000", "", "0", "Pending", "2026-04-20", "Candid + Video"],
    ],
    columnWidths: [{ wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 13 }, { wch: 13 }, { wch: 10 }, { wch: 12 }, { wch: 25 }],
  },
  rooms: {
    sheetName: "Rooms",
    headers: ["Guest Name", "Hotel", "Room Number", "Room Type", "Check In", "Check Out", "Status", "Notes"],
    sampleRows: [
      ["Rahul Sharma", "Hotel Grand", "101", "Double", "2026-05-10", "2026-05-13", "Confirmed", "Near elevator"],
      ["Priya Patel", "Hotel Grand", "205", "Suite", "2026-05-10", "2026-05-12", "Pending", "Wedding suite"],
    ],
    columnWidths: [{ wch: 20 }, { wch: 18 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 25 }],
  },
};

function generateTemplate(type: string): void {
  const config = TEMPLATES[type];
  if (!config) return;

  const wb = XLSX.utils.book_new();
  const wsData = [config.headers, ...config.sampleRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws["!cols"] = config.columnWidths;

  XLSX.utils.book_append_sheet(wb, ws, config.sheetName);

  const fileName = `shaadisheet_${type}_template.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function downloadGuestTemplate() {
  generateTemplate("guests");
}

export function downloadVendorTemplate() {
  generateTemplate("vendors");
}

export function downloadBudgetTemplate() {
  generateTemplate("budget");
}

export function downloadRoomTemplate() {
  generateTemplate("rooms");
}

export function downloadTemplate(type: string) {
  generateTemplate(type);
}
