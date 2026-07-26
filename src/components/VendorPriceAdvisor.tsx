"use client";

import { useState, useMemo } from "react";
import { formatINR } from "@/lib/format";

function renderMarkdown(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Tables
    .replace(/\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/g, (_match, header, rows) => {
      const headers = header.split("|").map((h: string) => h.trim()).filter(Boolean);
      const rowsArr = rows.trim().split("\n").map((r: string) =>
        r.split("|").map((c: string) => c.trim()).filter(Boolean)
      );
      let html = '<table class="w-full text-sm border-collapse my-3"><thead><tr>';
      headers.forEach((h: string) => { html += `<th class="text-left px-3 py-2 border-b border-gray-200 font-semibold text-gray-700 bg-gray-50">${h}</th>`; });
      html += '</tr></thead><tbody>';
      rowsArr.forEach((row: string[]) => {
        html += '<tr>';
        row.forEach((c: string) => { html += `<td class="px-3 py-2 border-b border-gray-100">${c}</td>`; });
        html += '</tr>';
      });
      html += '</tbody></table>';
      return html;
    })
    // Bullet points
    .replace(/^- (.+)$/gm, '<li class="ml-4 mb-1">• $1</li>')
    // Numbered items
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 mb-1"><strong>$1.</strong> $2</li>')
    // Line breaks
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

interface Props {
  vendor: any;
  wedding: any;
  weddingId: string;
  onClose: () => void;
}

export default function VendorPriceAdvisor({ vendor, wedding, weddingId, onClose }: Props) {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const guestCount = wedding.guestCount || 400;
  const quote = vendor.quote || 0;
  const perPlate = guestCount > 0 ? Math.round(quote / guestCount) : 0;

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis("");
    try {
      const question = `Analyze this vendor quote. Be precise with math.

VENDOR: ${vendor.name}
CATEGORY: ${vendor.category}
QUOTED PRICE: ₹${quote} (total for ${guestCount} guests)
PRICE PER PLATE: ₹${perPlate} per person
CITY: ${wedding.weddingCity || "Not specified"}
WEDDING BUDGET: ₹${wedding.budget || 0}
GUEST COUNT: ${guestCount}
CONTRACT STATUS: ${vendor.contract}

IMPORTANT: The quoted price ₹${quote} is the TOTAL amount. There are ${guestCount} guests. So per plate = ₹${quote} ÷ ${guestCount} = ₹${perPlate} per plate.

Provide your analysis in this EXACT format (no markdown, no **, no pipe tables):

PRICE ASSESSMENT
[One clear sentence: Fair / Overpriced / Good deal. State the per-plate cost clearly as ₹X,XXX per plate]

MARKET RANGE FOR ${vendor.category?.toUpperCase()} IN ${wedding.weddingCity?.toUpperCase() || "INDIA"}
Budget: ₹X,XXX-X,XXX per plate | ₹X,XX,XXX-X,XX,XXX total
Mid-Range: ₹X,XXX-X,XXX per plate | ₹X,XX,XXX-X,XX,XXX total  
Premium: ₹X,XXX-X,XXX per plate | ₹X,XX,XXX-X,XX,XXX total

NEGOTIATION POINTS
• [Specific thing to say]
• [Specific thing to say]
• [Specific thing to say]
• [Specific thing to say]

RED FLAGS
• [Warning sign if any]
• [Warning sign if any]

FINAL RECOMMENDATION
[One sentence: Book / Negotiate hard / Look elsewhere. State target price range.]`;

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weddingId,
          question,
          conversationHistory: [],
        }),
      });

      const data = await res.json();
      if (data.error) {
        setAnalysis(`Error: ${data.error}`);
      } else {
        setAnalysis(data.response);
      }
    } catch {
      setAnalysis("Failed to analyze. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderedAnalysis = useMemo(() => renderMarkdown(analysis), [analysis]);

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-maroon to-gold flex items-center justify-center text-white">
              <i className="fas fa-chart-line" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">AI Price Advisor</h3>
              <p className="text-xs text-gray-500">{vendor.name} &middot; {vendor.category}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer">
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Vendor summary */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 shrink-0">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-xs text-gray-500">Quote</span>
              <p className="text-lg font-bold text-maroon">{formatINR(vendor.quote)}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Status</span>
              <p className="text-sm font-medium">{vendor.contract}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">City</span>
              <p className="text-sm font-medium">{wedding.weddingCity || "TBD"}</p>
            </div>
          </div>
        </div>

        {/* Analysis content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!analysis && !loading && (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-maroon/10 flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-wand-magic-sparkles text-maroon text-xl" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Get AI Price Analysis</h4>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                Our AI will analyze this quote against market rates, suggest negotiation points, and flag any red flags.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 max-w-sm mx-auto">
                <p className="text-xs text-amber-700">
                  <i className="fas fa-calculator mr-1" />
                  {formatINR(quote)} ÷ {guestCount} guests = <strong>{formatINR(perPlate)}/plate</strong>
                </p>
              </div>
              <button
                onClick={handleAnalyze}
                className="px-6 py-2.5 bg-gradient-to-r from-maroon to-gold text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all cursor-pointer"
              >
                <i className="fas fa-wand-magic-sparkles mr-2" />
                Analyze Quote
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-maroon/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <i className="fas fa-wand-magic-sparkles text-maroon text-xl" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Analyzing...</h4>
              <p className="text-sm text-gray-500">Comparing with market rates and generating advice</p>
            </div>
          )}

          {analysis && (
            <div>
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4">
                <p className="text-sm text-green-800 font-medium">
                  <i className="fas fa-calculator mr-2" />
                  {formatINR(quote)} ÷ {guestCount} guests = <strong>{formatINR(perPlate)}/plate</strong>
                </p>
              </div>
              <div
                className="text-sm text-gray-700 leading-relaxed [&_strong]:font-bold [&_table]:w-full [&_table]:border-collapse [&_th]:text-left [&_th]:px-3 [&_th]:py-2 [&_th]:border-b [&_th]:border-gray-200 [&_th]:font-semibold [&_th]:text-gray-700 [&_th]:bg-gray-50 [&_td]:px-3 [&_td]:py-2 [&_td]:border-b [&_td]:border-gray-100 [&_li]:ml-4 [&_li]:mb-1"
                dangerouslySetInnerHTML={{ __html: renderedAnalysis }}
              />
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleAnalyze}
                  className="text-sm text-maroon font-semibold hover:underline cursor-pointer"
                >
                  <i className="fas fa-redo mr-1" /> Re-analyze
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
