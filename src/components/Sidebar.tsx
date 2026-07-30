"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface ChecklistItem {
  id: string;
  icon: string;
  label: string;
}

interface SidebarSection {
  id: string;
  title: string;
  icon: string;
  items: Array<{ id: string; icon: string; label: string }>;
}

function getChecklistItems(wedding: any): ChecklistItem[] {
  const religion = wedding?.religion || "hindu";
  const country = wedding?.country || "india";

  const checklistsByReligion: Record<string, ChecklistItem[]> = {
    hindu: [
      { id: "emergency-kit", icon: "fa-kit-medical", label: "Emergency Kit" },
      { id: "priest-req", icon: "fa-om", label: "Priest Requirements" },
      { id: "vidaai", icon: "fa-heart-crack", label: "Vidaai Essentials" },
    ],
    muslim: [
      { id: "emergency-kit", icon: "fa-kit-medical", label: "Emergency Kit" },
      { id: "nikah-prep", icon: "fa-book-open", label: "Nikah Preparation" },
      { id: "walima-essentials", icon: "fa-utensils", label: "Walima Essentials" },
    ],
    sikh: [
      { id: "emergency-kit", icon: "fa-kit-medical", label: "Emergency Kit" },
      { id: "gurdwara-req", icon: "fa-landmark", label: "Gurdwara Requirements" },
      { id: "anand-karaj", icon: "fa-music", label: "Anand Karaj Essentials" },
      { id: "langar-plan", icon: "fa-bowl-food", label: "Langar Planning" },
    ],
    jain: [
      { id: "emergency-kit", icon: "fa-kit-medical", label: "Emergency Kit" },
      { id: "jain-catering", icon: "fa-leaf", label: "Jain Catering Rules" },
      { id: "ceremony-essentials", icon: "fa-fire", label: "Ceremony Essentials" },
    ],
    christian: [
      { id: "emergency-kit", icon: "fa-kit-medical", label: "Emergency Kit" },
      { id: "church-req", icon: "fa-church", label: "Church Requirements" },
      { id: "roce-ceremony", icon: "fa-droplet", label: "Roce Ceremony" },
    ],
    buddhist: [
      { id: "emergency-kit", icon: "fa-kit-medical", label: "Emergency Kit" },
      { id: "poruwa-prep", icon: "fa-torii-gate", label: "Poruwa Preparation" },
      { id: "nekath-plan", icon: "fa-star", label: "Nekath Planning" },
    ],
    parsi: [
      { id: "emergency-kit", icon: "fa-kit-medical", label: "Emergency Kit" },
      { id: "priest-req", icon: "fa-fire", label: "Priest Requirements" },
      { id: "fire-ceremony", icon: "fa-fire-flame-curved", label: "Fire Ceremony" },
    ],
  };

  const checklistsByCountry: Record<string, ChecklistItem[]> = {
    pakistan: [
      { id: "emergency-kit", icon: "fa-kit-medical", label: "Emergency Kit" },
      { id: "dholki-essentials", icon: "fa-drum", label: "Dholki Essentials" },
      { id: "baraat-plan", icon: "fa-horse", label: "Baraat Planning" },
      { id: "nikah-prep", icon: "fa-book-open", label: "Nikah Preparation" },
    ],
    bangladesh: [
      { id: "emergency-kit", icon: "fa-kit-medical", label: "Emergency Kit" },
      { id: "gaye-holud", icon: "fa-sun", label: "Gaye Holud Essentials" },
      { id: "nikah-prep", icon: "fa-book-open", label: "Nikah Preparation" },
    ],
    sri_lanka: [
      { id: "emergency-kit", icon: "fa-kit-medical", label: "Emergency Kit" },
      { id: "poruwa-prep", icon: "fa-torii-gate", label: "Poruwa Preparation" },
      { id: "nekath-plan", icon: "fa-star", label: "Nekath Planning" },
    ],
    nepal: [
      { id: "emergency-kit", icon: "fa-kit-medical", label: "Emergency Kit" },
      { id: "janti-plan", icon: "fa-music", label: "Janti Planning" },
      { id: "dubo-mala", icon: "fa-seedling", label: "Dubo Ko Mala" },
    ],
    maldives: [
      { id: "emergency-kit", icon: "fa-kit-medical", label: "Emergency Kit" },
      { id: "henna-night", icon: "fa-hand-sparkles", label: "Henna Night" },
      { id: "nikah-prep", icon: "fa-book-open", label: "Nikah Preparation" },
      { id: "resort-coord", icon: "fa-umbrella-beach", label: "Resort Coordination" },
    ],
    afghanistan: [
      { id: "emergency-kit", icon: "fa-kit-medical", label: "Emergency Kit" },
      { id: "khwara-essentials", icon: "fa-ring", label: "Khwara Essentials" },
      { id: "nikah-prep", icon: "fa-book-open", label: "Nikah Preparation" },
      { id: "attan-dance", icon: "fa-music", label: "Attan Dance Planning" },
      { id: "mahr-docs", icon: "fa-file-contract", label: "Mahr Documentation" },
    ],
  };

  // Country-specific overrides take precedence for non-Indian weddings
  if (country !== "india" && checklistsByCountry[country]) {
    return checklistsByCountry[country];
  }

  return checklistsByReligion[religion] || checklistsByReligion.hindu;
}

function getSections(wedding: any): SidebarSection[] {
  const checklistItems = getChecklistItems(wedding);

  return [
    {
      id: "planning",
      title: "Planning",
      icon: "fa-clipboard-list",
      items: [
        { id: "overview", icon: "fa-home", label: "Overview" },
        { id: "budget", icon: "fa-coins", label: "Budget" },
        { id: "vendors", icon: "fa-store", label: "Vendors" },
        { id: "guests", icon: "fa-users", label: "Guests" },
        { id: "events", icon: "fa-calendar-alt", label: "Events" },
        { id: "tasks", icon: "fa-tasks", label: "Tasks" },
      ],
    },
    {
      id: "logistics",
      title: "Logistics",
      icon: "fa-hotel",
      items: [
        { id: "seating", icon: "fa-th-large", label: "Seating" },
        { id: "rooms", icon: "fa-bed", label: "Rooms" },
        { id: "timeline", icon: "fa-clock", label: "Timeline" },
        { id: "gifts", icon: "fa-gift", label: "Gift Tracker" },
        { id: "outfits", icon: "fa-shirt", label: "Outfit Planner" },
        { id: "invites", icon: "fa-envelope-open-text", label: "Invites" },
      ],
    },
    {
      id: "checklists",
      title: "Checklists",
      icon: "fa-clipboard-check",
      items: checklistItems,
    },
    {
      id: "fun",
      title: "Fun",
      icon: "fa-wand-magic-sparkles",
      items: [
        { id: "hashtags", icon: "fa-hashtag", label: "Hashtag Generator" },
      ],
    },
  ];
}

const STORAGE_KEY = "shaadisheet-sidebar-sections";

interface Props {
  activeView: string;
  onViewChange: (view: string) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  wedding?: any;
}

export default function Sidebar({ activeView, onViewChange, mobileOpen, onMobileClose, wedding }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const SECTIONS = getSections(wedding);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCollapsed(JSON.parse(saved));
    } catch {}
  }, []);

  const toggleSection = (sectionId: string) => {
    setCollapsed((prev) => {
      const next = { ...prev, [sectionId]: !prev[sectionId] };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleNav = (id: string) => {
    onViewChange(id);
    onMobileClose();
  };

  const findSectionForView = (viewId: string) => {
    return SECTIONS.find((s) => s.items.some((i) => i.id === viewId));
  };

  const activeSection = findSectionForView(activeView);

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onMobileClose} />
      )}

      <aside
        className={`
          sidebar fixed top-0 left-0 h-full w-[260px] bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-y-auto z-50
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:w-[240px]
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-3 border-b border-gray-200 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all">
            <i className="fas fa-arrow-left w-5 text-center" />
            <span>My Weddings</span>
          </Link>
          <button onClick={onMobileClose} className="lg:hidden w-11 h-11 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer">
            <i className="fas fa-times text-lg" />
          </button>
        </div>

        <nav className="flex-1 py-2">
          {SECTIONS.map((section) => {
            const isCollapsed = collapsed[section.id];
            const isActive = activeSection?.id === section.id;

            return (
              <div key={section.id} className="mb-1">
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-[0.65rem] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    isActive ? "text-maroon" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <i className={`fas ${section.icon} w-4 text-center text-[0.7rem]`} />
                  <span className="flex-1 text-left">{section.title}</span>
                  <i className={`fas fa-chevron-down text-[0.55rem] transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`} />
                </button>

                {!isCollapsed && (
                  <div className="mt-0.5">
                      {section.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNav(item.id)}
                        data-tutorial={item.id}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 ml-2 mr-2 min-h-[44px] rounded-lg text-[0.85rem] font-medium transition-all mb-0.5 cursor-pointer ${
                          activeView === item.id
                            ? "bg-gradient-to-br from-maroon to-maroon-light text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <i className={`fas ${item.icon} w-5 text-center text-sm`} />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
