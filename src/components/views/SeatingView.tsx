"use client";

export default function SeatingView({ wedding, onUpdate }: { wedding: any; onUpdate: () => void }) {
  const tables = wedding.seatingTables || [];

  return (
    <div>
      <div className="mb-7">
        <h2 className="text-2xl font-bold">Seating Chart</h2>
        <p className="text-gray-500 text-sm">Plan where every guest sits</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tables.map((table: any) => {
          let guests: string[] = [];
          try { guests = JSON.parse(table.guests || "[]"); } catch { guests = []; }
          return (
            <div key={table.id} className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:shadow-md transition-shadow">
              <h4 className="font-bold mb-1">{table.name}</h4>
              <div className="text-sm text-gray-500 mb-3">{guests.length} / {table.capacity} seats filled</div>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {guests.length > 0 ? (
                  guests.map((g, i) => (
                    <span key={i} className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium">{g}</span>
                  ))
                ) : (
                  <span className="px-2.5 py-1 bg-gray-50 rounded-full text-xs font-medium text-gray-400">Empty</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
