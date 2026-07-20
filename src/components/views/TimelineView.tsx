"use client";

const TIMELINE: Record<string, Array<{ time: string; title: string; desc: string; highlight: boolean }>> = {
  hindu: [
    { time: "5:00 AM", title: "Bride's Getting Ready", desc: "Hair, makeup, and dressing", highlight: false },
    { time: "6:00 AM", title: "Groom's Getting Ready", desc: "Sherwani, sehra, accessories", highlight: false },
    { time: "7:00 AM", title: "Morning Puja", desc: "Prayers and blessings", highlight: false },
    { time: "8:00 AM", title: "Baraat Assembly", desc: "Groom's side gathers", highlight: false },
    { time: "9:00 AM", title: "Baraat Procession", desc: "Band, DJ, dancing", highlight: true },
    { time: "10:00 AM", title: "Milni & Welcome", desc: "Groom welcomed by bride's family", highlight: false },
    { time: "10:30 AM", title: "Jaimala", desc: "Exchange of garlands", highlight: true },
    { time: "11:00 AM", title: "Kanyadaan", desc: "Father gives away the bride", highlight: true },
    { time: "11:30 AM", title: "Mangal Pheras", desc: "Seven rounds around sacred fire", highlight: true },
    { time: "12:30 PM", title: "Sindoor & Mangalsutra", desc: "Groom applies sindoor", highlight: true },
    { time: "1:00 PM", title: "Vidaai", desc: "Bride's farewell", highlight: true },
    { time: "1:30 PM", title: "Lunch", desc: "Wedding lunch", highlight: false },
    { time: "4:00 PM", title: "Griha Pravesh", desc: "Bride enters groom's home", highlight: false },
    { time: "6:00 PM", title: "Reception", desc: "Evening celebration", highlight: true },
  ],
  muslim: [
    { time: "8:00 AM", title: "Mehendi", desc: "Henna for bride", highlight: false },
    { time: "10:00 AM", title: "Nikah", desc: "Signing of Nikahnama", highlight: true },
    { time: "11:00 AM", title: "Mehr Exchange", desc: "Groom presents Mahr", highlight: true },
    { time: "12:00 PM", title: "Blessings & Photos", desc: "Family blessings", highlight: false },
    { time: "1:00 PM", title: "Lunch", desc: "Wedding feast", highlight: false },
    { time: "4:00 PM", title: "Ruksati", desc: "Bride's farewell", highlight: true },
    { time: "6:00 PM", title: "Walima", desc: "Grand reception", highlight: true },
  ],
  sikh: [
    { time: "6:00 AM", title: "Chooda Ceremony", desc: "Maternal uncle sets chooda", highlight: true },
    { time: "8:00 AM", title: "Groom Gets Ready", desc: "Sherwani, turban, kirpan", highlight: false },
    { time: "10:00 AM", title: "Anand Karaj Begins", desc: "Groom enters Gurdwara", highlight: true },
    { time: "10:30 AM", title: "Lavaan", desc: "Four rounds around Guru Granth Sahib", highlight: true },
    { time: "12:30 PM", title: "Ardas", desc: "Final prayer", highlight: false },
    { time: "1:00 PM", title: "Langar", desc: "Community meal", highlight: false },
    { time: "6:00 PM", title: "Reception", desc: "Evening celebration", highlight: true },
  ],
  christian: [
    { time: "8:00 AM", title: "Bride Gets Ready", desc: "White gown and veil", highlight: false },
    { time: "10:00 AM", title: "Church Ceremony", desc: "Bride walks down the aisle", highlight: true },
    { time: "10:30 AM", title: "Exchange of Vows", desc: "Wedding promises", highlight: true },
    { time: "11:00 AM", title: "Exchange of Rings", desc: "Wedding rings", highlight: true },
    { time: "12:00 PM", title: "Signing Register", desc: "Legal signing", highlight: false },
    { time: "1:00 PM", title: "Photos", desc: "Group photographs", highlight: false },
    { time: "6:00 PM", title: "Reception", desc: "Dinner, cake, first dance", highlight: true },
  ],
};

export default function TimelineView({ wedding }: { wedding: any }) {
  const timeline = TIMELINE[wedding.religion] || TIMELINE.hindu;

  return (
    <div>
      <div className="mb-7">
        <h2 className="text-2xl font-bold">Wedding Day Timeline</h2>
        <p className="text-gray-500 text-sm">Minute-by-minute schedule for your big day</p>
      </div>

      <div className="relative pl-10">
        <div className="absolute left-[15px] top-0 bottom-0 w-[3px] bg-gradient-to-b from-maroon to-gold rounded-full" />
        {timeline.map((entry, i) => (
          <div key={i} className={`relative mb-4 bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow ${entry.highlight ? "border-l-4 border-l-maroon" : ""}`}>
            <div className="absolute left-[-33px] top-6 w-3.5 h-3.5 bg-white border-[3px] border-maroon rounded-full" />
            {entry.highlight && <div className="absolute left-[-36px] top-[22px] w-5 h-5 border-4 border-maroon/20 rounded-full" />}
            <div className="text-xs font-bold text-maroon uppercase tracking-wide mb-1">{entry.time}</div>
            <h4 className="font-bold text-sm">{entry.title}</h4>
            <p className="text-gray-500 text-sm">{entry.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
