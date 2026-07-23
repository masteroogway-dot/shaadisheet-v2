// ─── Comprehensive Pattern Database ────────────────────────────────
// Maps natural language commands to tool calls with parameter extraction.
// Covers every possible wedding planning command variation.

export interface ParsedCommand {
  tool: string;
  args: any;
  description: string;
  response: string;
}

// ─── Synonym maps ─────────────────────────────────────────────────

const ACTION_SYNONYMS: Record<string, string[]> = {
  delete: ['remove', 'clear', 'drop', 'eliminate', 'get rid of', 'kick out', 'erase', 'cut', 'trash', 'ditch', 'discard'],
  create: ['add', 'new', 'insert', 'register', 'include', 'bring in', 'put in', 'enter', 'input'],
  update: ['mark', 'set', 'change', 'make', 'turn', 'switch', 'assign', 'move', 'shift', 'apply', 'convert', 'flip'],
};

const TARGET_SYNONYMS: Record<string, string[]> = {
  guests: ['guest', 'invitee', 'invitees', 'attendee', 'attendees', 'people', 'person', 'family', 'relative', 'friend', 'couple', 'bride', 'groom'],
  vendors: ['vendor', 'supplier', 'provider', 'contractor', 'service provider', 'business', 'company'],
  budget: ['budget item', 'expense', 'cost', 'spending', 'expenditure', 'line item'],
  tasks: ['task', 'todo', 'to-do', 'action item', 'checklist item', 'thing to do'],
  rooms: ['room', 'hotel room', 'accommodation', 'stay', 'lodging', 'room allocation'],
};

const Rsvp_SYNONYMS: Record<string, string> = {
  yes: 'Yes', confirmed: 'Yes', attending: 'Yes', coming: 'Yes', going: 'Yes', 'will attend': 'Yes', accepted: 'Yes', 'said yes': 'Yes',
  no: 'Declined', declined: 'Declined', rejected: 'Declined', not coming: 'Declined', 'won\'t attend': 'Declined', rejected: 'Declined',
  pending: 'Pending', waiting: 'Pending', 'not sure': 'Pending', maybe: 'Pending', 'to be confirmed': 'Pending', tbc: 'Pending',
  'checked in': 'Yes', attended: 'Yes', arrived: 'Yes', present: 'Yes',
};

const DIETARY_SYNONYMS: Record<string, string> = {
  veg: 'Veg', vegetarian: 'Veg', 'no meat': 'Veg', 'plant based': 'Veg',
  'non-veg': 'Non-Veg', 'non veg': 'Non-Veg', 'nonvegetarian': 'Non-Veg', meat: 'Non-Veg',
  jain: 'Jain', 'jain food': 'Jain',
  vegan: 'Vegan', 'no dairy': 'Vegan',
};

const SIDE_SYNONYMS: Record<string, string> = {
  bride: 'Bride', 'bride side': 'Bride', 'bride\'s': 'Bride', 'bride family': 'Bride', 'from bride': 'Bride',
  groom: 'Groom', 'groom side': 'Groom', 'groom\'s': 'Groom', 'groom family': 'Groom', 'from groom': 'Groom',
};

const CONTRACT_SYNONYMS: Record<string, string> = {
  pending: 'Pending', unsigned: 'Pending', 'not signed': 'Pending', awaiting: 'Pending',
  signed: 'Signed', booked: 'Signed', confirmed: 'Signed', locked: 'Signed',
  completed: 'Completed', done: 'Completed', finished: 'Completed', fulfilled: 'Completed',
};

const ROOM_STATUS_SYNONYMS: Record<string, string> = {
  reserved: 'Reserved', booked: 'Reserved', 'on hold': 'Reserved',
  'checked in': 'Checked In', arrived: 'Checked In', occupied: 'Checked In',
  'checked out': 'Checked Out', left: 'Checked Out', vacated: 'Checked Out',
  cancelled: 'Cancelled', canceled: 'Cancelled', 'no show': 'No Show',
};

const PRIORITY_SYNONYMS: Record<string, string> = {
  low: 'Low', minor: 'Low', 'not important': 'Low', whenever: 'Low',
  medium: 'Medium', normal: 'Medium', standard: 'Medium',
  high: 'High', important: 'High', soon: 'High',
  urgent: 'Urgent', critical: 'Urgent', asap: 'Urgent', immediately: 'Urgent', now: 'Urgent',
};

const CATEGORY_SYNONYMS: Record<string, string> = {
  photography: 'Photography', photographer: 'Photography', photos: 'Photography', pictures: 'Photography', shoot: 'Photography', cameraman: 'Photography',
  videography: 'Videography', videographer: 'Videography', video: 'Videography', filming: 'Videography', drone: 'Videography',
  catering: 'Catering', food: 'Catering', meals: 'Catering', cuisine: 'Catering', caterer: 'Catering', cook: 'Catering', chef: 'Catering', buffet: 'Catering', khana: 'Catering',
  decoration: 'Decoration', decor: 'Decoration', flowers: 'Decoration', floral: 'Decoration', mandap: 'Decoration', stage: 'Decoration', flower: 'Decoration', phool: 'Decoration',
  makeup: 'Makeup', 'make up': 'Makeup', cosmetics: 'Makeup', beauty: 'Makeup', artist: 'Makeup', salon: 'Makeup',
  mehendi: 'Mehendi', henna: 'Mehendi', 'mehndi': 'Mehendi', mehendi artist: 'Mehendi',
  dj: 'DJ', music: 'DJ', 'sound system': 'DJ', 'sound': 'DJ', speaker: 'DJ', lighting: 'DJ',
  band: 'Band', 'baraat': 'Band', 'brass band': 'Band', orchestra: 'Band', 'wedding band': 'Band',
  venue: 'Venue', 'wedding venue': 'Venue', location: 'Venue', 'banquet': 'Venue', 'farmhouse': 'Venue', 'hotel': 'Venue', 'hall': 'Venue', 'mandap': 'Venue', 'resort': 'Venue',
  transport: 'Transport', travel: 'Transport', car: 'Transport', 'wedding car': 'Transport', logistics: 'Transport', bus: 'Transport', 'tempo': 'Transport',
  invitation: 'Invitation', invites: 'Invitation', 'wedding card': 'Invitation', cards: 'Invitation', 'wedding invite': 'Invitation', eInvite: 'Invitation',
  jewelry: 'Jewellery', jewellery: 'Jewellery', gold: 'Jewellery', ornaments: 'Jewellery', 'wedding jewellery': 'Jewellery', diamonds: 'Jewellery',
  outfit: 'Outfit', dress: 'Outfit', lehenga: 'Outfit', sherwani: 'Outfit', 'wedding dress': 'Outfit', 'wedding outfit': 'Outfit', saree: 'Outfit', suit: 'Outfit',
  photography: 'Photography', video: 'Videography', food: 'Catering', decor: 'Decoration', beauty: 'Makeup', music: 'DJ', location: 'Venue', car: 'Transport', card: 'Invitation', gold: 'Jewellery', dress: 'Outfit',
};

const RELATION_SYNONYMS: Record<string, string> = {
  cousin: 'Cousin', bhai: 'Brother', brother: 'Brother', behen: 'Sister', sister: 'Sister',
  uncle: 'Uncle', chacha: 'Uncle', mama: 'Uncle', mami: 'Aunt', aunty: 'Aunt', aunt: 'Aunt',
  friend: 'Friend', dost: 'Friend', collogue: 'Colleague', colleague: 'Colleague', coworker: 'Colleague',
  neighbor: 'Neighbor', padosi: 'Neighbor', son: 'Son', beta: 'Son', daughter: 'Daughter', beti: 'Daughter',
  nephew: 'Nephew', bhatija: 'Nephew', niece: 'Niece', bhatiji: 'Niece',
  father: 'Father', papa: 'Father', dad: 'Father', daddy: 'Father', baapu: 'Father',
  mother: 'Mother', maa: 'Mother', mom: 'Mother', mommy: 'Mother', amma: 'Mother',
  grandfather: 'Grandfather', dada: 'Grandfather', nana: 'Grandfather', grandmother: 'Grandmother', dadi: 'Grandmother', nani: 'Grandmother',
};

const MONTH_SYNONYMS: Record<string, string> = {
  january: '01', jan: '01', february: '02', feb: '02', march: '03', mar: '03',
  april: '04', apr: '04', may: '05', june: '06', jun: '06', july: '07', jul: '07',
  august: '08', aug: '08', september: '09', sep: '09', october: '10', oct: '10',
  november: '11', nov: '11', december: '12', dec: '12',
};

// ─── Helper functions ─────────────────────────────────────────────

// Fuzzy match: handles typos like "guestr" -> "guest", "vegitarian" -> "vegetarian"
function fuzzyMatch(input: string, targets: string[], threshold = 0.7): string | undefined {
  const lower = input.toLowerCase().trim();
  // Exact match first
  for (const t of targets) {
    if (lower === t || lower.includes(t)) return t;
  }
  // Fuzzy: Levenshtein-like matching
  for (const t of targets) {
    if (levenshtein(lower, t) <= Math.floor(t.length * (1 - threshold))) return t;
  }
  return undefined;
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

function normalizeSynonyms(input: string, map: Record<string, string>): string | undefined {
  const lower = input.toLowerCase().trim();
  for (const [key, value] of Object.entries(map)) {
    if (lower === key || lower.includes(key)) return value;
  }
  // Fuzzy match
  const keys = Object.keys(map);
  const fuzzyKey = fuzzyMatch(lower, keys);
  if (fuzzyKey) return map[fuzzyKey];
  return undefined;
}

function extractName(q: string, actionWords: string[], targetWords: string[]): string | undefined {
  let cleaned = q;
  for (const word of actionWords) {
    cleaned = cleaned.replace(new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'), '');
  }
  for (const word of targetWords) {
    cleaned = cleaned.replace(new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'), '');
  }
  cleaned = cleaned.replace(/\b(from|the|a|an|all|every|each|some|any|no|my|his|her|their|its|our|and|or|with|for|in|on|at|to|of|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|can|shall|must)\b/gi, '');
  cleaned = cleaned.replace(/[^a-z0-9\s]/gi, ' ');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  if (cleaned.length < 2) return undefined;
  return cleaned;
}

function extractNameFromCommand(q: string, actionVerbs: string[], targetNouns: string[]): string | undefined {
  let cleaned = q;
  // Remove action verbs
  for (const v of actionVerbs) {
    cleaned = cleaned.replace(new RegExp(`\\b${v}\\b`, 'gi'), '');
  }
  // Remove target nouns and their plurals
  for (const n of targetNouns) {
    cleaned = cleaned.replace(new RegExp(`\\b${n}s?\\b`, 'gi'), '');
  }
  // Remove common filler words
  cleaned = cleaned.replace(/\b(from|the|a|an|all|every|each|some|any|no|my|his|her|their|its|our|and|or|with|for|in|on|at|to|of|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|can|shall|must|who|that|which|this|these|those|where|when|how|what|why|please|kindly|also|just|only|then|than|so|but|not|very|too|really|actually|basically|literally)\b/gi, '');
  // Remove non-alpha except spaces
  cleaned = cleaned.replace(/[^a-z\s]/gi, ' ');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  if (cleaned.length < 2) return undefined;
  // Take first 1-3 words as name (names are usually 2-3 words)
  const words = cleaned.split(/\s+/).filter(w => w.length > 1);
  if (words.length === 0) return undefined;
  return words.slice(0, 3).join(' ');
}

function extractNumber(q: string): number | undefined {
  const match = q.match(/(\d[\d,]*)/);
  if (match) return parseInt(match[1].replace(/,/g, ''), 10);
  const wordNums: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
    twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100,
    thousand: 1000, lakh: 100000, lac: 100000, crore: 10000000,
  };
  for (const [word, num] of Object.entries(wordNums)) {
    if (q.includes(word)) return num;
  }
  return undefined;
}

function extractDate(q: string): string | undefined {
  const isoMatch = q.match(/(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];
  const slashMatch = q.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (slashMatch) return `${slashMatch[3]}-${slashMatch[2].padStart(2, '0')}-${slashMatch[1].padStart(2, '0')}`;
  // "15th august", "august 15", "15 aug 2026"
  const monthDayYear = q.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*(\d{4})?/i);
  if (monthDayYear) {
    const month = MONTH_SYNONYMS[monthDayYear[2].toLowerCase()] || '01';
    const day = monthDayYear[1].padStart(2, '0');
    const year = monthDayYear[3] || new Date().getFullYear().toString();
    return `${year}-${month}-${day}`;
  }
  const monthFirst = q.match(/(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})?/i);
  if (monthFirst) {
    const month = MONTH_SYNONYMS[monthFirst[1].toLowerCase()] || '01';
    const day = monthFirst[2].padStart(2, '0');
    const year = monthFirst[3] || new Date().getFullYear().toString();
    return `${year}-${month}-${day}`;
  }
  const now = new Date();
  if (q.includes('tomorrow')) { now.setDate(now.getDate() + 1); return now.toISOString().split('T')[0]; }
  if (q.includes('today')) return now.toISOString().split('T')[0];
  if (q.includes('next week')) { now.setDate(now.getDate() + 7); return now.toISOString().split('T')[0]; }
  if (q.includes('next month')) { now.setMonth(now.getMonth() + 1); return now.toISOString().split('T')[0]; }
  if (q.includes('day after tomorrow')) { now.setDate(now.getDate() + 2); return now.toISOString().split('T')[0]; }
  if (q.includes('next year')) { now.setFullYear(now.getFullYear() + 1); return now.toISOString().split('T')[0]; }
  return undefined;
}

function extractRelation(q: string): string | undefined {
  return normalizeSynonyms(q.match(/\b(cousin|brother|sister|uncle|aunt|friend|colleague|coworker|neighbor|son|daughter|nephew|niece|father|mother|grandfather|grandmother|bhai|behen|chacha|mama|mami|dost|beta|beti|papa|maa|dada|nana|dadi|nani)\b/i)?.[0] || '', RELATION_SYNONYMS);
}

function extractTime(q: string): string | undefined {
  // "at 3pm", "at 15:00", "3:30 pm"
  const timeMatch = q.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const mins = timeMatch[2];
    if (timeMatch[3]?.toLowerCase() === 'pm' && hours < 12) hours += 12;
    if (timeMatch[3]?.toLowerCase() === 'am' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${mins}`;
  }
  const simpleTime = q.match(/(\d{1,2})\s*(am|pm)/i);
  if (simpleTime) {
    let hours = parseInt(simpleTime[1]);
    if (simpleTime[2].toLowerCase() === 'pm' && hours < 12) hours += 12;
    if (simpleTime[2].toLowerCase() === 'am' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:00`;
  }
  return undefined;
}

// ─── Pattern Database ─────────────────────────────────────────────

interface PatternDef {
  match: (q: string) => boolean;
  parse: (q: string) => ParsedCommand | null;
}

// ── DELETE patterns ───────────────────────────────────────────────

const DELETE_PATTERNS: PatternDef[] = [
  // Delete guest by name
  {
    match: q => /\b(remove|delete|clear|drop|eliminate|get rid of|kick|erase|cut|trash|ditch|discard)\b/.test(q) && /\b(guest|guests|invitee|attendee|person|people|family|relative|friend|couple|bride|groom)\b/.test(q),
    parse: q => {
      const name = extractName(q, 
        [...ACTION_SYNONYMS.delete, 'remove', 'delete', 'clear', 'drop', 'eliminate', 'get rid of', 'kick', 'erase', 'cut', 'trash', 'ditch', 'discard'],
        [...TARGET_SYNONYMS.guests, 'from guests', 'from the guest list']
      );
      if (name) {
        return {
          tool: 'delete_guests',
          args: { filter: { name_contains: name } },
          description: `Delete guest "${name}"`,
          response: `I'll delete guest "${name}". Please confirm below.`,
        };
      }
      return null;
    },
  },
  // Delete guest by dietary
  {
    match: q => /\b(remove|delete|clear|drop)\b/.test(q) && /\b(guest|guests|people|attendee)\b/.test(q) && /\b(veg|vegetarian|non-veg|non veg|jain|vegan|meat|plant)\b/.test(q),
    parse: q => {
      const dietary = normalizeSynonyms(q.match(/\b(veg|vegetarian|non-veg|non veg|jain|vegan|meat|plant)\b/i)?.[0] || '', DIETARY_SYNONYMS);
      if (dietary) {
        return {
          tool: 'delete_guests',
          args: { filter: { dietary } },
          description: `Delete all ${dietary} dietary guests`,
          response: `I'll delete all ${dietary} dietary guests. Please confirm below.`,
        };
      }
      return null;
    },
  },
  // Delete guest by side
  {
    match: q => /\b(remove|delete|clear|drop)\b/.test(q) && /\b(guest|guests|people|attendee|side|family)\b/.test(q) && /\b(bride|groom|bride side|groom side|bride's|groom's)\b/.test(q),
    parse: q => {
      const side = normalizeSynonyms(q.match(/\b(bride|groom|bride side|groom side|bride's|groom's)\b/i)?.[0] || '', SIDE_SYNONYMS);
      if (side) {
        return {
          tool: 'delete_guests',
          args: { filter: { side } },
          description: `Delete all ${side} side guests`,
          response: `I'll delete all ${side} side guests. Please confirm below.`,
        };
      }
      return null;
    },
  },
  // Delete guest by RSVP
  {
    match: q => /\b(remove|delete|clear|drop)\b/.test(q) && /\b(guest|guests|people|attendee)\b/.test(q) && /\b(pending|confirmed|declined|rejected|attending|checked in|arrived|no show)\b/.test(q),
    parse: q => {
      const rsvp = normalizeSynonyms(q.match(/\b(pending|confirmed|declined|rejected|attending|checked in|arrived|no show)\b/i)?.[0] || '', Rsvp_SYNONYMS);
      if (rsvp) {
        return {
          tool: 'delete_guests',
          args: { filter: { rsvp } },
          description: `Delete all ${rsvp} RSVP guests`,
          response: `I'll delete all ${rsvp} RSVP guests. Please confirm below.`,
        };
      }
      return null;
    },
  },
  // Delete guest by family/surname
  {
    match: q => /\b(remove|delete|clear|drop)\b/.test(q) && /\b(guest|guests|family|relative)\b/.test(q) && /\b(family|from|named|surname|last name)\b/.test(q),
    parse: q => {
      const name = extractName(q,
        [...ACTION_SYNONYMS.delete, 'remove', 'delete'],
        [...TARGET_SYNONYMS.guests, 'family', 'relative', 'from', 'named', 'surname', 'last name']
      );
      if (name) {
        return {
          tool: 'delete_guests',
          args: { filter: { name_contains: name } },
          description: `Delete guests matching "${name}"`,
          response: `I'll delete guests matching "${name}". Please confirm below.`,
        };
      }
      return null;
    },
  },
  // Delete vendor by name
  {
    match: q => /\b(remove|delete|clear|drop)\b/.test(q) && /\b(vendor|supplier|provider|contractor|business|company)\b/.test(q),
    parse: q => {
      const name = extractName(q,
        [...ACTION_SYNONYMS.delete, 'remove', 'delete'],
        [...TARGET_SYNONYMS.vendors, 'vendor', 'supplier']
      );
      if (name) {
        return {
          tool: 'delete_vendors',
          args: { filter: { name_contains: name } },
          description: `Delete vendor "${name}"`,
          response: `I'll delete vendor "${name}". Please confirm below.`,
        };
      }
      return null;
    },
  },
  // Delete vendor by contract status
  {
    match: q => /\b(remove|delete|clear|drop)\b/.test(q) && /\b(vendor|supplier)\b/.test(q) && /\b(pending|unsigned|not signed|signed|booked|completed|done)\b/.test(q),
    parse: q => {
      const contract = normalizeSynonyms(q.match(/\b(pending|unsigned|not signed|signed|booked|completed|done)\b/i)?.[0] || '', CONTRACT_SYNONYMS);
      if (contract) {
        return {
          tool: 'delete_vendors',
          args: { filter: { contract } },
          description: `Delete all ${contract} contract vendors`,
          response: `I'll delete all ${contract} contract vendors. Please confirm below.`,
        };
      }
      return null;
    },
  },
  // Delete vendor by category
  {
    match: q => /\b(remove|delete|clear|drop)\b/.test(q) && /\b(vendor|supplier)\b/.test(q) && /\b(photography|catering|decoration|makeup|dj|music|band|venue|videography|mehendi|transport|invitation|jewelry|outfit)\b/.test(q),
    parse: q => {
      const category = normalizeSynonyms(q.match(/\b(photography|catering|decoration|makeup|dj|music|band|venue|videography|mehendi|transport|invitation|jewelry|outfit)\b/i)?.[0] || '', CATEGORY_SYNONYMS);
      if (category) {
        return {
          tool: 'delete_vendors',
          args: { filter: { category } },
          description: `Delete all ${category} vendors`,
          response: `I'll delete all ${category} vendors. Please confirm below.`,
        };
      }
      return null;
    },
  },
  // Delete budget item
  {
    match: q => /\b(remove|delete|clear|drop)\b/.test(q) && /\b(budget|expense|cost|spending|item|line item)\b/.test(q),
    parse: q => {
      const name = extractName(q,
        [...ACTION_SYNONYMS.delete, 'remove', 'delete'],
        [...TARGET_SYNONYMS.budget, 'budget', 'expense', 'cost', 'spending', 'item', 'line item']
      );
      if (name) {
        return {
          tool: 'delete_budget_items',
          args: { filter: { item_contains: name } },
          description: `Delete budget item "${name}"`,
          response: `I'll delete budget item "${name}". Please confirm below.`,
        };
      }
      return null;
    },
  },
  // Delete room allocation
  {
    match: q => /\b(remove|delete|clear|drop)\b/.test(q) && /\b(room|allocation|hotel|accommodation)\b/.test(q),
    parse: q => {
      const name = extractName(q,
        [...ACTION_SYNONYMS.delete, 'remove', 'delete'],
        [...TARGET_SYNONYMS.rooms, 'room', 'allocation', 'hotel', 'accommodation']
      );
      if (name) {
        return {
          tool: 'delete_rooms',
          args: { filter: { guestName_contains: name } },
          description: `Delete room allocation for "${name}"`,
          response: `I'll delete the room allocation for "${name}". Please confirm below.`,
        };
      }
      return null;
    },
  },
  // Delete task
  {
    match: q => /\b(remove|delete|clear|drop|complete|done|finish)\b/.test(q) && /\b(task|todo|to-do|action item)\b/.test(q),
    parse: q => {
      const name = extractName(q,
        [...ACTION_SYNONYMS.delete, 'remove', 'delete', 'complete', 'done', 'finish'],
        [...TARGET_SYNONYMS.tasks, 'task', 'todo', 'to-do', 'action item']
      );
      if (name) {
        return {
          tool: 'delete_tasks',
          args: { filter: { task_contains: name } },
          description: `Delete task "${name}"`,
          response: `I'll delete the task "${name}". Please confirm below.`,
        };
      }
      return null;
    },
  },
];

// ── CREATE patterns ───────────────────────────────────────────────

const CREATE_PATTERNS: PatternDef[] = [
  // Add guest with side
  {
    match: q => /\b(add|create|new|insert|register|include)\b/.test(q) && /\b(guest|guests|invitee|person|people|family|relative|friend|couple)\b/.test(q) && /\b(bride|groom|bride side|groom side)\b/.test(q),
    parse: q => {
      const name = extractName(q,
        [...ACTION_SYNONYMS.create, 'add', 'create', 'new'],
        [...TARGET_SYNONYMS.guests, ...Object.keys(SIDE_SYNONYMS), 'bride side', 'groom side']
      );
      const side = normalizeSynonyms(q.match(/\b(bride|groom|bride side|groom side|bride's|groom's)\b/i)?.[0] || '', SIDE_SYNONYMS) || 'Bride';
      const dietary = normalizeSynonyms(q.match(/\b(veg|vegetarian|non-veg|jain|vegan)\b/i)?.[0] || '', DIETARY_SYNONYMS) || 'Veg';
      const relation = q.match(/\b(cousin|brother|sister|uncle|aunt|friend|colleague|neighbor|child|son|daughter|nephew|niece|parent|father|mother)\b/i)?.[0] || '';
      
      if (name) {
        return {
          tool: 'create_guests',
          args: { guests: [{ guestName: name, side, dietary, relation, rsvp: 'Pending' }] },
          description: `Add ${name} as ${side} side guest`,
          response: `I'll add ${name} as a ${side} side guest (${dietary}${relation ? ', ' + relation : ''}).`,
        };
      }
      return null;
    },
  },
  // Add guest (simple)
  {
    match: q => /\b(add|create|new|insert|register|include)\b/.test(q) && /\b(guest|guests|invitee|person|people)\b/.test(q),
    parse: q => {
      const name = extractName(q,
        [...ACTION_SYNONYMS.create, 'add', 'create', 'new'],
        [...TARGET_SYNONYMS.guests, 'guest', 'guests', 'invitee', 'person', 'people']
      );
      if (name) {
        return {
          tool: 'create_guests',
          args: { guests: [{ guestName: name, side: 'Bride', dietary: 'Veg', rsvp: 'Pending' }] },
          description: `Add ${name} as guest`,
          response: `I'll add ${name} as a guest. You can edit their details after.`,
        };
      }
      return null;
    },
  },
  // Add vendor with category
  {
    match: q => /\b(add|create|new|insert|register|include|book|hire)\b/.test(q) && /\b(vendor|supplier|provider|contractor|business|company|photographer|caterer|decorator|dj|band)\b/.test(q),
    parse: q => {
      const name = extractName(q,
        [...ACTION_SYNONYMS.create, 'add', 'create', 'new', 'book', 'hire'],
        [...TARGET_SYNONYMS.vendors, 'vendor', 'supplier', 'provider', 'contractor', 'photographer', 'caterer', 'decorator', 'dj', 'band']
      );
      const category = normalizeSynonyms(q.match(/\b(photography|catering|decoration|makeup|dj|music|band|venue|videography|mehendi|transport|invitation|jewelry|outfit)\b/i)?.[0] || '', CATEGORY_SYNONYMS) || 'Other';
      const contact = q.match(/\b(\d{10})\b/)?.[0];
      const quote = extractNumber(q.match(/(?:quote|price|cost|budget|rs|inr|₹)\s*(\d[\d,]*)/i)?.[0] || '');
      
      if (name) {
        return {
          tool: 'create_vendor',
          args: { name, category, contact, quote },
          description: `Add vendor "${name}" (${category})`,
          response: `I'll add vendor "${name}" in ${category}.${contact ? ' Contact: ' + contact + '.' : ''}${quote ? ' Quote: ₹' + quote.toLocaleString('en-IN') + '.' : ''}`,
        };
      }
      return null;
    },
  },
  // Add budget item
  {
    match: q => /\b(add|create|new|insert|include)\b/.test(q) && /\b(budget|expense|cost|spending|item|line item)\b/.test(q),
    parse: q => {
      const name = extractName(q,
        [...ACTION_SYNONYMS.create, 'add', 'create', 'new'],
        [...TARGET_SYNONYMS.budget, 'budget', 'expense', 'cost', 'spending', 'item', 'line item']
      );
      const category = normalizeSynonyms(q.match(/\b(photography|catering|decoration|makeup|dj|music|band|venue|videography|mehendi|transport|invitation|jewelry|outfit|venue|misc|miscellaneous)\b/i)?.[0] || '', CATEGORY_SYNONYMS) || 'Misc';
      const estimated = extractNumber(q);
      
      if (name) {
        return {
          tool: 'create_budget_item',
          args: { item: name, category, estimated: estimated || 0 },
          description: `Add budget item "${name}" (₹${(estimated || 0).toLocaleString('en-IN')})`,
          response: `I'll add "${name}" to your ${category} budget${estimated ? ' at ₹' + estimated.toLocaleString('en-IN') : ''}.`,
        };
      }
      return null;
    },
  },
  // Add task
  {
    match: q => /\b(add|create|new|insert|include)\b/.test(q) && /\b(task|todo|to-do|action item|checklist)\b/.test(q),
    parse: q => {
      const taskText = extractName(q,
        [...ACTION_SYNONYMS.create, 'add', 'create', 'new'],
        [...TARGET_SYNONYMS.tasks, 'task', 'todo', 'to-do', 'action item', 'checklist']
      );
      const deadline = extractDate(q);
      const priority = normalizeSynonyms(q.match(/\b(low|medium|high|urgent|critical|important|asap)\b/i)?.[0] || '', PRIORITY_SYNONYMS) || 'Medium';
      
      if (taskText) {
        return {
          tool: 'create_task',
          args: { task: taskText, deadline, priority },
          description: `Add task "${taskText}"`,
          response: `I'll add the task "${taskText}"${deadline ? ' due ' + deadline : ''} with ${priority} priority.`,
        };
      }
      return null;
    },
  },
];

// ── UPDATE patterns ───────────────────────────────────────────────

const UPDATE_PATTERNS: PatternDef[] = [
  // Update guest RSVP
  {
    match: q => /\b(mark|set|change|update|make|turn|switch|assign|move)\b/.test(q) && /\b(guest|guests|invitee|person|people)\b/.test(q) && /\b(yes|no|pending|confirmed|declined|attending|rejected|checked in|arrived|present)\b/.test(q),
    parse: q => {
      const name = extractName(q,
        ['mark', 'set', 'change', 'update', 'make', 'turn', 'switch', 'assign', 'move', 'guest', 'guests', 'invitee', 'person', 'people', 'rsvp', 'to', 'as'],
        ['yes', 'no', 'pending', 'confirmed', 'declined', 'attending', 'rejected', 'checked in', 'arrived', 'present']
      );
      const rsvp = normalizeSynonyms(q.match(/\b(yes|no|pending|confirmed|declined|attending|rejected|checked in|arrived|present)\b/i)?.[0] || '', Rsvp_SYNONYMS);
      
      if (rsvp) {
        const filter: any = {};
        if (name) filter.name_contains = name;
        if (q.includes('bride')) filter.side = 'Bride';
        if (q.includes('groom')) filter.side = 'Groom';
        if (q.includes('veg') && !q.includes('non')) filter.dietary = 'Veg';
        if (q.includes('jain')) filter.dietary = 'Jain';
        
        return {
          tool: 'update_guests',
          args: { filter, updates: { rsvp } },
          description: `Update ${name || 'guests'} RSVP to ${rsvp}`,
          response: `I'll update${name ? ' ' + name + '\'' + (name.endsWith('s') ? '' : 's') : ' guests\''} RSVP to ${rsvp}.`,
        };
      }
      return null;
    },
  },
  // Update guest dietary
  {
    match: q => /\b(mark|set|change|update|make|turn|switch|assign)\b/.test(q) && /\b(guest|guests|invitee|person|people)\b/.test(q) && /\b(veg|vegetarian|non-veg|jain|vegan|dietary|food)\b/.test(q),
    parse: q => {
      const name = extractName(q,
        ['mark', 'set', 'change', 'update', 'make', 'turn', 'switch', 'assign', 'guest', 'guests', 'invitee', 'person', 'people', 'dietary', 'food', 'to', 'as'],
        ['veg', 'vegetarian', 'non-veg', 'jain', 'vegan']
      );
      const dietary = normalizeSynonyms(q.match(/\b(veg|vegetarian|non-veg|jain|vegan)\b/i)?.[0] || '', DIETARY_SYNONYMS);
      
      if (dietary) {
        const filter: any = {};
        if (name) filter.name_contains = name;
        if (q.includes('bride')) filter.side = 'Bride';
        if (q.includes('groom')) filter.side = 'Groom';
        
        return {
          tool: 'update_guests',
          args: { filter, updates: { dietary } },
          description: `Update ${name || 'guests'} dietary to ${dietary}`,
          response: `I'll update${name ? ' ' + name + '\'' + (name.endsWith('s') ? '' : 's') : ' guests\''} dietary to ${dietary}.`,
        };
      }
      return null;
    },
  },
  // Update vendor contract
  {
    match: q => /\b(mark|set|change|update|make|turn|switch|assign)\b/.test(q) && /\b(vendor|supplier)\b/.test(q) && /\b(pending|signed|booked|completed|done)\b/.test(q),
    parse: q => {
      const name = extractName(q,
        ['mark', 'set', 'change', 'update', 'make', 'turn', 'switch', 'assign', 'vendor', 'supplier', 'contract', 'to', 'as'],
        ['pending', 'signed', 'booked', 'completed', 'done']
      );
      const contract = normalizeSynonyms(q.match(/\b(pending|signed|booked|completed|done)\b/i)?.[0] || '', CONTRACT_SYNONYMS);
      
      if (contract) {
        const filter: any = {};
        if (name) filter.name_contains = name;
        
        return {
          tool: 'update_vendors',
          args: { filter, updates: { contract } },
          description: `Update ${name || 'vendors'} contract to ${contract}`,
          response: `I'll update${name ? ' ' + name + '\'' + (name.endsWith('s') ? '' : 's') : ' vendors\''} contract to ${contract}.`,
        };
      }
      return null;
    },
  },
  // Update room status
  {
    match: q => /\b(mark|set|change|update|make|turn|switch|assign)\b/.test(q) && /\b(room|allocation|hotel)\b/.test(q) && /\b(reserved|checked in|checked out|cancelled|no show)\b/.test(q),
    parse: q => {
      const name = extractName(q,
        ['mark', 'set', 'change', 'update', 'make', 'turn', 'switch', 'assign', 'room', 'allocation', 'hotel', 'status', 'to'],
        ['reserved', 'checked in', 'checked out', 'cancelled', 'no show']
      );
      const status = normalizeSynonyms(q.match(/\b(reserved|checked in|checked out|cancelled|no show)\b/i)?.[0] || '', ROOM_STATUS_SYNONYMS);
      
      if (status) {
        const filter: any = {};
        if (name) filter.guestName_contains = name;
        
        return {
          tool: 'update_rooms',
          args: { filter, updates: { status } },
          description: `Update ${name || 'rooms'} status to ${status}`,
          response: `I'll update${name ? ' ' + name + '\'' + (name.endsWith('s') ? '' : 's') : ' rooms\''} status to ${status}.`,
        };
      }
      return null;
    },
  },
  // Update task priority
  {
    match: q => /\b(mark|set|change|update|make|turn|switch|assign)\b/.test(q) && /\b(task|todo|to-do)\b/.test(q) && /\b(low|medium|high|urgent|critical|important)\b/.test(q),
    parse: q => {
      const name = extractName(q,
        ['mark', 'set', 'change', 'update', 'make', 'turn', 'switch', 'assign', 'task', 'todo', 'to-do', 'priority', 'to'],
        ['low', 'medium', 'high', 'urgent', 'critical', 'important']
      );
      const priority = normalizeSynonyms(q.match(/\b(low|medium|high|urgent|critical|important)\b/i)?.[0] || '', PRIORITY_SYNONYMS);
      
      if (priority) {
        const filter: any = {};
        if (name) filter.task_contains = name;
        
        return {
          tool: 'update_tasks',
          args: { filter, updates: { priority } },
          description: `Update ${name || 'tasks'} priority to ${priority}`,
          response: `I'll update${name ? ' ' + name + '\'' + (name.endsWith('s') ? '' : 's') : ' tasks\''} priority to ${priority}.`,
        };
      }
      return null;
    },
  },
];

// ── BULK operations ───────────────────────────────────────────────

const BULK_PATTERNS: PatternDef[] = [
  // Bulk delete all guests of a type
  {
    match: q => /\b(remove|delete|clear|drop)\b/.test(q) && /\b(all|every|each|entire)\b/.test(q) && /\b(guest|guests|invitee|people|attendee)\b/.test(q),
    parse: q => {
      const filter: any = {};
      if (q.includes('bride')) filter.side = 'Bride';
      if (q.includes('groom')) filter.side = 'Groom';
      const dietary = normalizeSynonyms(q.match(/\b(veg|vegetarian|non-veg|jain|vegan)\b/i)?.[0] || '', DIETARY_SYNONYMS);
      if (dietary) filter.dietary = dietary;
      const rsvp = normalizeSynonyms(q.match(/\b(pending|confirmed|declined|rejected|attending|checked in)\b/i)?.[0] || '', Rsvp_SYNONYMS);
      if (rsvp) filter.rsvp = rsvp;
      
      return {
        tool: 'delete_guests',
        args: { filter },
        description: `Delete all guests${Object.keys(filter).length ? ' matching filters' : ''}`,
        response: `I'll delete all guests${Object.keys(filter).length ? ' matching your criteria' : ''}. Please confirm below.`,
      };
    },
  },
  // Bulk delete all vendors
  {
    match: q => /\b(remove|delete|clear|drop)\b/.test(q) && /\b(all|every|each|entire)\b/.test(q) && /\b(vendor|vendors|supplier)\b/.test(q),
    parse: q => {
      const filter: any = {};
      const contract = normalizeSynonyms(q.match(/\b(pending|signed|completed|done)\b/i)?.[0] || '', CONTRACT_SYNONYMS);
      if (contract) filter.contract = contract;
      const category = normalizeSynonyms(q.match(/\b(photography|catering|decoration|makeup|dj|music|band|venue|videography|mehendi)\b/i)?.[0] || '', CATEGORY_SYNONYMS);
      if (category) filter.category = category;
      
      return {
        tool: 'delete_vendors',
        args: { filter },
        description: `Delete all vendors${Object.keys(filter).length ? ' matching filters' : ''}`,
        response: `I'll delete all vendors${Object.keys(filter).length ? ' matching your criteria' : ''}. Please confirm below.`,
      };
    },
  },
  // Bulk update RSVP for all guests
  {
    match: q => /\b(mark|set|change|update|make)\b/.test(q) && /\b(all|every|each|entire)\b/.test(q) && /\b(guest|guests|invitee|people)\b/.test(q) && /\b(yes|no|pending|confirmed|declined)\b/.test(q),
    parse: q => {
      const rsvp = normalizeSynonyms(q.match(/\b(yes|no|pending|confirmed|declined)\b/i)?.[0] || '', Rsvp_SYNONYMS);
      if (rsvp) {
        const filter: any = {};
        if (q.includes('bride')) filter.side = 'Bride';
        if (q.includes('groom')) filter.side = 'Groom';
        const dietary = normalizeSynonyms(q.match(/\b(veg|vegetarian|non-veg|jain|vegan)\b/i)?.[0] || '', DIETARY_SYNONYMS);
        if (dietary) filter.dietary = dietary;
        
        return {
          tool: 'update_guests',
          args: { filter, updates: { rsvp } },
          description: `Update all guests RSVP to ${rsvp}`,
          response: `I'll update all guests${Object.keys(filter).length ? ' matching filters' : ''} RSVP to ${rsvp}. Please confirm below.`,
        };
      }
      return null;
    },
  },
  // Bulk update dietary for all guests
  {
    match: q => /\b(mark|set|change|update|make)\b/.test(q) && /\b(all|every|each|entire)\b/.test(q) && /\b(guest|guests|invitee|people)\b/.test(q) && /\b(veg|vegetarian|non-veg|jain|vegan|dietary|food)\b/.test(q),
    parse: q => {
      const dietary = normalizeSynonyms(q.match(/\b(veg|vegetarian|non-veg|jain|vegan)\b/i)?.[0] || '', DIETARY_SYNONYMS);
      if (dietary) {
        const filter: any = {};
        if (q.includes('bride')) filter.side = 'Bride';
        if (q.includes('groom')) filter.side = 'Groom';
        
        return {
          tool: 'update_guests',
          args: { filter, updates: { dietary } },
          description: `Update all guests dietary to ${dietary}`,
          response: `I'll update all guests${Object.keys(filter).length ? ' matching filters' : ''} dietary to ${dietary}. Please confirm below.`,
        };
      }
      return null;
    },
  },
  // Bulk update vendor contract
  {
    match: q => /\b(mark|set|change|update|make)\b/.test(q) && /\b(all|every|each|entire)\b/.test(q) && /\b(vendor|vendors|supplier)\b/.test(q) && /\b(pending|signed|completed|done)\b/.test(q),
    parse: q => {
      const contract = normalizeSynonyms(q.match(/\b(pending|signed|completed|done)\b/i)?.[0] || '', CONTRACT_SYNONYMS);
      if (contract) {
        return {
          tool: 'update_vendors',
          args: { filter: {}, updates: { contract } },
          description: `Update all vendors contract to ${contract}`,
          response: `I'll update all vendors contract to ${contract}. Please confirm below.`,
        };
      }
      return null;
    },
  },
];

// ── ROOM ALLOCATION patterns ──────────────────────────────────────

const ROOM_PATTERNS: PatternDef[] = [
  // Allocate room
  {
    match: q => /\b(allocate|assign|book|reserve|give|allot)\b/.test(q) && /\b(room|hotel|accommodation|stay|lodging)\b/.test(q),
    parse: q => {
      const name = extractName(q,
        ['allocate', 'assign', 'book', 'reserve', 'give', 'allot', 'room', 'hotel', 'accommodation', 'stay', 'lodging', 'to', 'for'],
        []
      );
      const hotel = q.match(/(?:at|in|hotel|resort|inn)\s+([a-z][a-z\s]+?)(?:\s+(?:room|for|with|$))/i)?.[1]?.trim();
      const roomType = normalizeSynonyms(q.match(/\b(standard|deluxe|suite|premium|vip|ac|non-ac|non ac)\b/i)?.[0] || '', { standard: 'Standard', deluxe: 'Deluxe', suite: 'Suite', premium: 'Premium', vip: 'VIP', ac: 'AC', 'non-ac': 'Non-AC', 'non ac': 'Non-AC' }) || 'Standard';
      const count = extractNumber(q);
      
      return {
        tool: 'allocate_rooms',
        args: { count: count || 1, hotel: hotel || 'TBD', roomType },
        description: `Allocate ${count || 1} ${roomType} room(s)${hotel ? ' at ' + hotel : ''}`,
        response: `I'll allocate ${count || 1} ${roomType} room(s)${hotel ? ' at ' + hotel : ''}${name ? ' for ' + name : ''}.`,
      };
    },
  },
  // Update room status
  {
    match: q => /\b(mark|set|change|update|make)\b/.test(q) && /\b(room|allocation|hotel)\b/.test(q) && /\b(reserved|checked in|checked out|cancelled|no show)\b/.test(q),
    parse: q => {
      const name = extractName(q,
        ['mark', 'set', 'change', 'update', 'make', 'room', 'allocation', 'hotel', 'status', 'to'],
        ['reserved', 'checked in', 'checked out', 'cancelled', 'no show']
      );
      const status = normalizeSynonyms(q.match(/\b(reserved|checked in|checked out|cancelled|no show)\b/i)?.[0] || '', ROOM_STATUS_SYNONYMS);
      
      if (status) {
        const filter: any = {};
        if (name) filter.guestName_contains = name;
        
        return {
          tool: 'update_rooms',
          args: { filter, updates: { status } },
          description: `Update ${name || 'rooms'} status to ${status}`,
          response: `I'll update${name ? ' ' + name + '\'' + (name.endsWith('s') ? '' : 's') : ' rooms\''} status to ${status}.`,
        };
      }
      return null;
    },
  },
];

// ── TIMELINE/EVENT patterns ───────────────────────────────────────

const EVENT_PATTERNS: PatternDef[] = [
  // Create event
  {
    match: q => /\b(add|create|new|schedule|plan|set)\b/.test(q) && /\b(event|function|ceremony|ritual|day|programme)\b/.test(q),
    parse: q => {
      const name = extractName(q,
        ['add', 'create', 'new', 'schedule', 'plan', 'set', 'event', 'function', 'ceremony', 'ritual', 'day', 'programme'],
        []
      );
      const date = extractDate(q);
      const time = extractTime(q);
      
      if (name) {
        return {
          tool: '__event_create',
          args: { name, date, time },
          description: `Create event "${name}"`,
          response: `I'll create the event "${name}"${date ? ' on ' + date : ''}${time ? ' at ' + time : ''}.`,
        };
      }
      return null;
    },
  },
  // Wedding knowledge: rituals
  {
    match: q => /\b(ritual|rituals|tradition|traditions|ceremony|ceremonies|customs|what.*happen|what.*include|what.*involve)\b/.test(q) && /\b(hindu|muslim|sikh|christian|jain|wedding)\b/.test(q),
    parse: q => {
      const religion = normalizeSynonyms(q.match(/\b(hindu|muslim|sikh|christian|jain)\b/i)?.[0] || '', { hindu: 'Hindu', muslim: 'Muslim', sikh: 'Sikh', christian: 'Christian', jain: 'Jain' });
      if (religion) {
        return {
          tool: '__knowledge',
          args: { type: 'rituals', religion },
          description: `${religion} wedding rituals`,
          response: '', // Will be handled by AI
        };
      }
      return null;
    },
  },
  // Wedding knowledge: budget allocation
  {
    match: q => /\b(budget|allocation|percent|split|divide|breakdown|how much)\b/.test(q) && /\b(should|would|could|recommend|suggest|ideal)\b/.test(q),
    parse: q => ({
      tool: '__knowledge',
      args: { type: 'budget' },
      description: 'Budget allocation advice',
      response: '',
    }),
  },
  // Wedding knowledge: vendor prices
  {
    match: q => /\b(how much|price|cost|rate|charge|expensive|cheap|budget)\b/.test(q) && /\b(photographer|caterer|decorator|dj|band|makeup|mehendi|venue|videographer)\b/.test(q),
    parse: q => {
      const category = normalizeSynonyms(q.match(/\b(photographer|caterer|decorator|dj|band|makeup|mehendi|venue|videographer)\b/i)?.[0] || '', CATEGORY_SYNONYMS);
      if (category) {
        return {
          tool: '__knowledge',
          args: { type: 'pricing', category },
          description: `${category} pricing info`,
          response: '',
        };
      }
      return null;
    },
  },
];

// ── MORE QUERY patterns ───────────────────────────────────────────

const MORE_QUERY_PATTERNS: PatternDef[] = [
  // What's my budget
  {
    match: q => /\b(what|show|tell|give)\b/.test(q) && /\b(budget|spending|cost|money|expense)\b/.test(q),
    parse: q => ({ tool: '__query', args: { type: 'budget' }, description: 'Query budget', response: '' }),
  },
  // How many guests
  {
    match: q => /\b(how many|what.*count|total|number)\b/.test(q) && /\b(guest|guests|invitee|invited|people|attending)\b/.test(q),
    parse: q => ({ tool: '__query', args: { type: 'guests' }, description: 'Query guests', response: '' }),
  },
  // How many vendors
  {
    match: q => /\b(how many|what.*count|total|number)\b/.test(q) && /\b(vendor|vendors|booked|hired)\b/.test(q),
    parse: q => ({ tool: '__query', args: { type: 'vendors' }, description: 'Query vendors', response: '' }),
  },
  // How many tasks
  {
    match: q => /\b(how many|what.*count|total|number|remaining|pending|done|completed)\b/.test(q) && /\b(task|tasks|todo|to-do)\b/.test(q),
    parse: q => ({ tool: '__query', args: { type: 'tasks' }, description: 'Query tasks', response: '' }),
  },
  // Show guests by filter
  {
    match: q => /\b(show|list|display|who|give me|find|search)\b/.test(q) && /\b(guest|guests|invitee|attendee)\b/.test(q) && /\b(bride|groom|veg|non-veg|jain|pending|confirmed|declined|yes|no)\b/.test(q),
    parse: q => ({ tool: '__query', args: { type: 'guests', filter: q }, description: 'List filtered guests', response: '' }),
  },
  // What's pending
  {
    match: q => /\b(what|show|list|give)\b/.test(q) && /\b(pending|remaining|left|todo|to-do|still)\b/.test(q),
    parse: q => ({ tool: '__query', args: { type: 'pending' }, description: 'Query pending items', response: '' }),
  },
  // Search vendors in city
  {
    match: q => /\b(find|search|look|show|recommend|suggest|where)\b/.test(q) && /\b(vendor|photographer|caterer|decorator|dj|band|makeup|mehendi|venue)\b/.test(q) && /\b(in|at|near|around)\b/.test(q),
    parse: q => {
      const city = q.match(/(?:in|at|near|around)\s+([a-z][a-z\s]+?)(?:\s|$)/i)?.[1]?.trim();
      const vendorType = normalizeSynonyms(q.match(/\b(vendor|photographer|caterer|decorator|dj|band|makeup|mehendi|venue)\b/i)?.[0] || '', CATEGORY_SYNONYMS);
      if (city && vendorType) {
        return {
          tool: 'search_vendors',
          args: { query: `${vendorType.toLowerCase()} in ${city}` },
          description: `Search ${vendorType} in ${city}`,
          response: `I'll search for ${vendorType.toLowerCase()} in ${city}.`,
        };
      }
      return null;
    },
  },
];

// ── QUICK COMMAND patterns (short/colloquial) ─────────────────────

const QUICK_PATTERNS: PatternDef[] = [
  // "yes" / "confirm" / "do it"
  {
    match: q => /^(yes|all\s*yes|mark\s*all|set\s*all|do\s*it|confirm|y|go|proceed|approve|accept)$/i.test(q),
    parse: q => ({
      tool: '__quick',
      args: { action: 'confirm' },
      description: 'Confirm pending action',
      response: 'Confirmed!',
    }),
  },
  // "no" / "cancel"
  {
    match: q => /^(no|cancel|n|nah|nope|stop|abort|nevermind|never mind)$/i.test(q),
    parse: q => ({
      tool: '__quick',
      args: { action: 'cancel' },
      description: 'Cancel pending action',
      response: 'Action cancelled.',
    }),
  },
  // "help" / "what can you do"
  {
    match: q => /\b(help|what can you do|commands|options|menu|guide)\b/.test(q),
    parse: q => ({
      tool: '__quick',
      args: { action: 'help' },
      description: 'Show help',
      response: '',
    }),
  },
  // "thank you" / "thanks"
  {
    match: q => /\b(thank|thanks|thx|ty|appreciate|grateful)\b/.test(q),
    parse: q => ({
      tool: '__quick',
      args: { action: 'thanks' },
      description: 'Thank you',
      response: 'You\'re welcome! Let me know if you need anything else for your wedding.',
    }),
  },
];

// ─── Main parser ──────────────────────────────────────────────────

export function parseWithPatterns(q: string): ParsedCommand | null {
  const normalized = q.toLowerCase().trim();
  
  // Try QUICK patterns first (yes/no/help)
  for (const pattern of QUICK_PATTERNS) {
    if (pattern.match(normalized)) {
      const result = pattern.parse(normalized);
      if (result) return result;
    }
  }
  
  // Try DELETE patterns
  for (const pattern of DELETE_PATTERNS) {
    if (pattern.match(normalized)) {
      const result = pattern.parse(normalized);
      if (result) return result;
    }
  }
  
  // Try BULK DELETE patterns
  for (const pattern of BULK_PATTERNS) {
    if (pattern.match(normalized)) {
      const result = pattern.parse(normalized);
      if (result) return result;
    }
  }
  
  // Try CREATE patterns
  for (const pattern of CREATE_PATTERNS) {
    if (pattern.match(normalized)) {
      const result = pattern.parse(normalized);
      if (result) return result;
    }
  }
  
  // Try UPDATE patterns
  for (const pattern of UPDATE_PATTERNS) {
    if (pattern.match(normalized)) {
      const result = pattern.parse(normalized);
      if (result) return result;
    }
  }
  
  // Try ROOM patterns
  for (const pattern of ROOM_PATTERNS) {
    if (pattern.match(normalized)) {
      const result = pattern.parse(normalized);
      if (result) return result;
    }
  }
  
  // Try EVENT patterns
  for (const pattern of EVENT_PATTERNS) {
    if (pattern.match(normalized)) {
      const result = pattern.parse(normalized);
      if (result) return result;
    }
  }
  
  // Try QUERY patterns
  for (const pattern of [...QUERY_PATTERNS, ...MORE_QUERY_PATTERNS]) {
    if (pattern.match(normalized)) {
      const result = pattern.parse(normalized);
      if (result) return result;
    }
  }
  
  return null;
}

// ─── Get all pattern categories for help ──────────────────────────

export function getPatternCategories(): string[] {
  return [
    'DELETE: guests (by name, dietary, side, RSVP, family), vendors (by name, contract, category), budget items, rooms, tasks',
    'CREATE: guests (with side/dietary/relation), vendors (with category/contact/quote), budget items, tasks (with deadline/priority), events',
    'UPDATE: guest RSVP, dietary, vendor contract, room status, task priority',
    'BULK: delete/update all guests/vendors by filter',
    'ROOMS: allocate, update status',
    'EVENTS: create events with date/time',
    'QUERIES: count, list, show by filter, search vendors in city',
    'QUICK: yes/no/cancel/help/thanks',
    'KNOWLEDGE: rituals, budget allocation, vendor pricing',
    'Examples:',
    '- "Remove Sameer Jain from guests"',
    '- "Add Rahul on groom side as cousin"',
    '- "Mark all veg guests as RSVP Yes"',
    '- "Delete all pending vendors"',
    '- "Allocate 2 deluxe rooms at Taj Gateway"',
    '- "Create mehendi event on 15th november"',
    '- "Find photographers in Nashik"',
    '- "How much does a photographer cost?"',
    '- "What rituals are there in a Hindu wedding?"',
  ];
}
