"use client";

const EVENTS: Record<string, Array<{ name: string; desc: string; time: string; ritual: boolean }>> = {
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
    { name: "Mangni", desc: "Engagement", time: "7:00 PM", ritual: true },
    { name: "Mehendi", desc: "Henna night", time: "4:00 PM", ritual: false },
    { name: "Nikah", desc: "Wedding ceremony", time: "10:00 AM", ritual: true },
    { name: "Walima", desc: "Post-wedding reception", time: "7:00 PM", ritual: true },
  ],
  sikh: [
    { name: "Kurmai", desc: "Engagement", time: "11:00 AM", ritual: true },
    { name: "Mehendi", desc: "Henna", time: "4:00 PM", ritual: false },
    { name: "Sangeet", desc: "Dance night", time: "7:00 PM", ritual: false },
    { name: "Anand Karaj", desc: "Wedding at Gurdwara", time: "10:00 AM", ritual: true },
    { name: "Langar", desc: "Community meal", time: "1:00 PM", ritual: true },
    { name: "Reception", desc: "Evening party", time: "7:00 PM", ritual: false },
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
    { name: "Sangeet", desc: "Dance night", time: "7:00 PM", ritual: false },
    { name: "Wedding Ceremony", desc: "Jain wedding rituals", time: "10:00 AM", ritual: true },
    { name: "Reception", desc: "Grand celebration", time: "7:00 PM", ritual: false },
  ],
};

export default function EventsView({ wedding }: { wedding: any }) {
  const allEvents = EVENTS[wedding.religion] || EVENTS.hindu;
  const selectedNames: string[] = JSON.parse(wedding.selectedEvents || "[]");
  const events = selectedNames.length > 0 ? allEvents.filter((e) => selectedNames.includes(e.name)) : allEvents;
  const weddingDate = wedding.weddingDate ? new Date(wedding.weddingDate) : new Date("2026-10-15");

  return (
    <div>
      <div className="flex justify-between items-start mb-7">
        <div>
          <h2 className="text-2xl font-bold">Event Timeline</h2>
          <p className="text-gray-500 text-sm">Every event, every ritual, every detail — on schedule</p>
        </div>
      </div>

      <div className="space-y-5">
        {events.map((event, i) => {
          const d = new Date(weddingDate);
          d.setDate(d.getDate() - (events.length - 1 - i));
          const day = d.getDate();
          const month = d.toLocaleString("en-US", { month: "short" });
          const isWedding = event.name.includes("Wedding") || event.name.includes("Nikah") || event.name.includes("Anand Karaj");

          return (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 flex gap-5 hover:shadow-md transition-shadow">
              <div className="w-[70px] text-center shrink-0">
                <span className={`text-3xl font-extrabold block leading-none ${isWedding ? "text-maroon" : ""}`}>{day}</span>
                <span className="text-sm text-gray-500 font-semibold uppercase">{month}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">{event.name}</h3>
                <p className="text-gray-500 text-sm mb-3">{event.desc}</p>
                <div className="flex gap-5 text-sm text-gray-500">
                  <span><i className="fas fa-map-marker-alt mr-1.5" />{wedding.weddingCity || "Venue TBD"}</span>
                  <span><i className="fas fa-clock mr-1.5" />{event.time}</span>
                  {event.ritual && <span><i className="fas fa-om mr-1.5" />Ritual</span>}
                </div>
              </div>
              <span className={`status-badge ${isWedding ? "confirmed" : "planning"}`}>{isWedding ? "Main Event" : "Planned"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
