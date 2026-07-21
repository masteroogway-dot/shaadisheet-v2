"use client";

const BUDGET_RANGES: Record<string, number> = {
  under10: 800000, "10to30": 2000000, "30to50": 4000000, "50to1cr": 7500000, above1cr: 15000000,
};

const EVENTS_BY_RELIGION: Record<string, Array<{ name: string; desc: string; time: string; ritual: boolean }>> = {
  hindu: [
    { name: "Roka", desc: "Official engagement", time: "11:00 AM", ritual: true },
    { name: "Engagement", desc: "Ring exchange ceremony", time: "7:00 PM", ritual: true },
    { name: "Mehendi", desc: "Henna application", time: "4:00 PM", ritual: false },
    { name: "Sangeet", desc: "Music and dance night", time: "7:00 PM", ritual: false },
    { name: "Haldi", desc: "Turmeric ceremony", time: "9:00 AM", ritual: true },
    { name: "Wedding Day", desc: "Baraat, Jaimala, Pheras", time: "10:00 AM", ritual: true },
    { name: "Reception", desc: "Grand evening celebration", time: "7:00 PM", ritual: false },
  ],
  muslim: [
    { name: "Mangni", desc: "Engagement ceremony", time: "7:00 PM", ritual: true },
    { name: "Mehendi", desc: "Henna night", time: "4:00 PM", ritual: false },
    { name: "Nikah", desc: "Wedding ceremony", time: "10:00 AM", ritual: true },
    { name: "Walima", desc: "Post-wedding reception", time: "7:00 PM", ritual: true },
  ],
  sikh: [
    { name: "Kurmai", desc: "Engagement", time: "11:00 AM", ritual: true },
    { name: "Mehendi", desc: "Henna application", time: "4:00 PM", ritual: false },
    { name: "Sangeet", desc: "Music and dance", time: "7:00 PM", ritual: false },
    { name: "Anand Karaj", desc: "Wedding at Gurdwara", time: "10:00 AM", ritual: true },
    { name: "Langar", desc: "Community meal", time: "1:00 PM", ritual: true },
    { name: "Reception", desc: "Evening celebration", time: "7:00 PM", ritual: false },
  ],
  christian: [
    { name: "Engagement", desc: "Formal engagement", time: "7:00 PM", ritual: true },
    { name: "Roce Ceremony", desc: "Turmeric ceremony", time: "5:00 PM", ritual: true },
    { name: "Church Wedding", desc: "Wedding ceremony", time: "10:00 AM", ritual: true },
    { name: "Reception", desc: "Celebration", time: "7:00 PM", ritual: false },
  ],
  jain: [
    { name: "Roka", desc: "Official engagement", time: "11:00 AM", ritual: true },
    { name: "Engagement", desc: "Ring exchange", time: "7:00 PM", ritual: true },
    { name: "Mehendi", desc: "Henna application", time: "4:00 PM", ritual: false },
    { name: "Sangeet", desc: "Music and dance", time: "7:00 PM", ritual: false },
    { name: "Wedding Ceremony", desc: "Jain wedding rituals", time: "10:00 AM", ritual: true },
    { name: "Reception", desc: "Grand celebration", time: "7:00 PM", ritual: false },
  ],
};

function formatINR(n: number) {
  if (n >= 10000000) return (n / 10000000).toFixed(1) + " Cr";
  if (n >= 100000) return (n / 100000).toFixed(1) + " L";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

export default function OverviewView({ wedding }: { wedding: any }) {
  const totalBudget = BUDGET_RANGES[wedding.budget] || 4000000;
  const totalSpent = wedding.budgetItems?.reduce((s: number, i: any) => s + (i.paid || 0), 0) || 0;
  const totalGuests = wedding.guestCount === "small" ? 80 : wedding.guestCount === "medium" ? 200 : wedding.guestCount === "large" ? 400 : 600;
  const rsvpYes = wedding.guests?.filter((g: any) => g.rsvp === "Yes").length || 0;
  const vendorsBooked = wedding.vendors?.filter((v: any) => v.contract === "Signed").length || 0;
  const totalVendors = wedding.vendors?.length || 0;
  const tasksDone = wedding.tasks?.filter((t: any) => t.done).length || 0;
  const totalTasks = wedding.tasks?.length || 0;

  const countdown = wedding.weddingDate
    ? Math.ceil((new Date(wedding.weddingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  // Upcoming events
  const allEvents = EVENTS_BY_RELIGION[wedding.religion] || EVENTS_BY_RELIGION.hindu;
  const selectedNames: string[] = JSON.parse(wedding.selectedEvents || "[]");
  const selectedEvents = selectedNames.length > 0 ? allEvents.filter((e) => selectedNames.includes(e.name)) : allEvents;
  const weddingDate = wedding.weddingDate ? new Date(wedding.weddingDate) : new Date("2026-10-15");
  const today = new Date();
  const eventsWithDates = selectedEvents.map((e, i) => {
    const d = new Date(weddingDate);
    d.setDate(d.getDate() - (selectedEvents.length - 1 - i));
    return { ...e, date: d };
  }).filter((e) => e.date >= today).slice(0, 4);

  // Budget bars
  const cats = [
    { name: "Venue & Decor", pct: 0.30, color: "from-maroon to-maroon-light" },
    { name: "Catering", pct: 0.25, color: "from-gold to-gold-dark" },
    { name: "Photography & Video", pct: 0.08, color: "from-green to-green/80" },
    { name: "Attire & Jewelry", pct: 0.15, color: "from-blue to-blue/80" },
    { name: "Pandit & Rituals", pct: 0.04, color: "from-purple-600 to-purple-800" },
    { name: "Music & Entertainment", pct: 0.06, color: "from-orange-600 to-red-700" },
  ];

  return (
    <div>
      <div className="flex justify-between items-start mb-7">
        <div>
          <h2 className="text-2xl font-bold">Wedding Dashboard</h2>
          <p className="text-gray-500 text-sm">
            {countdown !== null ? (countdown > 0 ? `${countdown} days until your wedding` : "Your wedding day!") : "—"}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
        {[
          { label: "Total Budget", value: `₹${formatINR(totalBudget)}`, sub: `₹${formatINR(totalSpent)} spent (${Math.round(totalSpent / totalBudget * 100)}%)`, icon: "fa-rupee-sign", gradient: "from-maroon to-maroon-light" },
          { label: "Guests", value: totalGuests.toString(), sub: `${rsvpYes} RSVP'd (${Math.round(rsvpYes / Math.max(wedding.guests?.length || 1, 1) * 100)}%)`, icon: "fa-users", gradient: "from-green to-green/80" },
          { label: "Vendors", value: `${vendorsBooked} / ${totalVendors}`, sub: `${totalVendors - vendorsBooked} remaining`, icon: "fa-store", gradient: "from-blue to-blue/80" },
          { label: "Tasks", value: `${tasksDone} / ${totalTasks}`, sub: `${totalTasks - tasksDone} remaining`, icon: "fa-tasks", gradient: "from-orange-600 to-red-700" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white shrink-0`}>
              <i className={`fas ${s.icon}`} />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium">{s.label}</span>
              <div className="text-xl font-extrabold">{s.value}</div>
              <span className="text-xs text-gray-500">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Upcoming Events */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-0">
            <h3 className="font-bold">Upcoming Events</h3>
          </div>
          <div className="p-6">
            {eventsWithDates.length === 0 ? (
              <p className="text-gray-400 text-center py-5">No upcoming events</p>
            ) : eventsWithDates.map((event, i) => {
              const day = event.date.getDate();
              const month = event.date.toLocaleString("en-US", { month: "short" });
              const isWedding = event.name.includes("Wedding") || event.name.includes("Nikah") || event.name.includes("Anand Karaj");
              return (
                <div key={i} className="flex items-center gap-4 py-3.5 border-b border-gray-100 last:border-0">
                  <div className={`w-[52px] h-[52px] rounded-lg flex flex-col items-center justify-center shrink-0 ${isWedding ? "bg-gradient-to-br from-maroon to-maroon-light text-white" : "bg-gray-100"}`}>
                    <span className={`text-lg font-extrabold leading-none ${isWedding ? "" : ""}`}>{day}</span>
                    <span className="text-[0.7rem] uppercase font-semibold opacity-80">{month}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <strong className="text-sm">{event.name}</strong>
                    <span className="block text-xs text-gray-500">{wedding.weddingCity || "Venue TBD"} • {event.time}</span>
                  </div>
                  <span className={`status-badge ${event.date.getTime() - today.getTime() < 30 * 86400000 ? "planning" : "pending"}`}>
                    {event.date.getTime() - today.getTime() < 30 * 86400000 ? "Planning" : "Upcoming"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 pt-5 pb-0">
            <h3 className="font-bold">Quick Tips</h3>
          </div>
          <div className="p-6">
            {[
              { icon: "fa-lightbulb", color: "#FEF3C7", text: "Review your budget allocations to ensure nothing is missed." },
              { icon: "fa-calendar-check", color: "#D1FAE5", text: "Set your wedding date to unlock countdown and reminders." },
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 py-3.5 border-b border-gray-100 last:border-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: tip.color }}><i className={`fas ${tip.icon} text-sm`} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{tip.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Budget Bars */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <h3 className="font-bold">Budget Overview</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {cats.map((cat) => {
              const catBudget = Math.round(totalBudget * cat.pct);
              const catSpent = wedding.budgetItems?.filter((i: any) => i.category === cat.name).reduce((s: number, i: any) => s + (i.paid || 0), 0) || 0;
              const pct = catBudget > 0 ? Math.round(catSpent / catBudget * 100) : 0;
              return (
                <div key={cat.name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">{cat.name}</span>
                    <span className="text-gray-500">₹{formatINR(catSpent)} / ₹{formatINR(catBudget)}</span>
                  </div>
                  <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${cat.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
