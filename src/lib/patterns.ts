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
  urgent: 'Urgent', critical: 'Urgent, asap: 'Urgent', immediately: 'Urgent', now: 'Urgent',
};

const CATEGORY_SYNONYMS: Record<string, string> = {
  photography: 'Photography', photographer: 'Photography', photos: 'Photography', pictures: 'Photography', shoot: 'Photography',
  videography: 'Videography', videographer: 'Videography', video: 'Videography', filming: 'Videography',
  catering: 'Catering', food: 'Catering', meals: 'Catering', cuisine: 'Catering', caterer: 'Catering',
  decoration: 'Decoration', decor: 'Decoration', flowers: 'Decoration', floral: 'Decoration', mandap: 'Decoration', stage: 'Decoration',
  makeup: 'Makeup', 'make up': 'Makeup', cosmetics: 'Makeup', beauty: 'Makeup',
  mehendi: 'Mehendi', henna: 'Mehendi', 'mehndi': 'Mehendi',
  dj: 'DJ', music: 'DJ', 'sound system': 'DJ', 'sound': 'DJ',
  band: 'Band', 'baraat': 'Band', 'brass band': 'Band', orchestra: 'Band',
  venue: 'Venue', 'wedding venue': 'Venue', location: 'Venue', 'banquet': 'Venue', 'farmhouse': 'Venue', 'hotel': 'Venue',
  transport: 'Transport', travel: 'Transport', car: 'Transport', 'wedding car': 'Transport', logistics: 'Transport',
  invitation: 'Invitation', invites: 'Invitation', 'wedding card': 'Invitation', cards: 'Invitation',
  jewelry: 'Jewellery', jewellery: 'Jewellery', gold: 'Jewellery', ornaments: 'Jewellery',
  outfit: 'Outfit', dress: 'Outfit', lehenga: 'Outfit', sherwani: 'Outfit', 'wedding dress': 'Outfit',
};

// ─── Helper functions ─────────────────────────────────────────────

function normalizeSynonyms(input: string, map: Record<string, string>): string | undefined {
  const lower = input.toLowerCase().trim();
  for (const [key, value] of Object.entries(map)) {
    if (lower === key || lower.includes(key)) return value;
  }
  return undefined;
}

function extractName(q: string, actionWords: string[], targetWords: string[]): string | undefined {
  let cleaned = q;
  for (const word of actionWords) {
    cleaned = cleaned.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
  }
  for (const word of targetWords) {
    cleaned = cleaned.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
  }
  cleaned = cleaned.replace(/\b(from|the|a|an|all|every|each|some|any|no|my|his|her|their|its|our)\b/gi, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  if (cleaned.length < 2) return undefined;
  return cleaned;
}

function extractNumber(q: string): number | undefined {
  const match = q.match(/(\d[\d,]*)/);
  if (match) return parseInt(match[1].replace(/,/g, ''), 10);
  // Word numbers
  const wordNums: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, twenty: 20, thirty: 30, fifty: 50, hundred: 100,
  };
  for (const [word, num] of Object.entries(wordNums)) {
    if (q.includes(word)) return num;
  }
  return undefined;
}

function extractDate(q: string): string | undefined {
  // YYYY-MM-DD
  const isoMatch = q.match(/(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];
  // DD/MM/YYYY or DD-MM-YYYY
  const slashMatch = q.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (slashMatch) return `${slashMatch[3]}-${slashMatch[2].padStart(2, '0')}-${slashMatch[1].padStart(2, '0')}`;
  // "tomorrow", "next week", etc.
  const now = new Date();
  if (q.includes('tomorrow')) {
    now.setDate(now.getDate() + 1);
    return now.toISOString().split('T')[0];
  }
  if (q.includes('today')) return now.toISOString().split('T')[0];
  if (q.includes('next week')) {
    now.setDate(now.getDate() + 7);
    return now.toISOString().split('T')[0];
  }
  if (q.includes('next month')) {
    now.setMonth(now.getMonth() + 1);
    return now.toISOString().split('T')[0];
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

// ── QUERY patterns ────────────────────────────────────────────────

const QUERY_PATTERNS: PatternDef[] = [
  // Count guests
  {
    match: q => /\b(how many|what's|what is|count|number of|total)\b/.test(q) && /\b(guest|guests|invitee|attendee|people|invited)\b/.test(q),
    parse: q => ({ tool: '__query', args: { type: 'guests' }, description: 'Query guests', response: '' }),
  },
  // Count vendors
  {
    match: q => /\b(how many|what's|what is|count|number of|total)\b/.test(q) && /\b(vendor|vendors|supplier|booked)\b/.test(q),
    parse: q => ({ tool: '__query', args: { type: 'vendors' }, description: 'Query vendors', response: '' }),
  },
  // Count budget
  {
    match: q => /\b(how many|what's|what is|count|total|remaining|left|spent|allocated)\b/.test(q) && /\b(budget|expense|cost|spending|money)\b/.test(q),
    parse: q => ({ tool: '__query', args: { type: 'budget' }, description: 'Query budget', response: '' }),
  },
  // Count tasks
  {
    match: q => /\b(how many|what's|what is|count|number of|total|done|remaining|pending)\b/.test(q) && /\b(task|tasks|todo|to-do)\b/.test(q),
    parse: q => ({ tool: '__query', args: { type: 'tasks' }, description: 'Query tasks', response: '' }),
  },
  // Count rooms
  {
    match: q => /\b(how many|what's|what is|count|number of|total)\b/.test(q) && /\b(room|rooms|allocation|hotel|accommodation)\b/.test(q),
    parse: q => ({ tool: '__query', args: { type: 'rooms' }, description: 'Query rooms', response: '' }),
  },
  // List guests by filter
  {
    match: q => /\b(show|list|display|who|give me)\b/.test(q) && /\b(guest|guests|invitee|attendee)\b/.test(q) && /\b(bride|groom|veg|non-veg|jain|pending|confirmed|declined)\b/.test(q),
    parse: q => ({ tool: '__query', args: { type: 'guests', filter: q }, description: 'List filtered guests', response: '' }),
  },
];

// ─── Main parser ──────────────────────────────────────────────────

export function parseWithPatterns(q: string): ParsedCommand | null {
  const normalized = q.toLowerCase().trim();
  
  // Try DELETE patterns
  for (const pattern of DELETE_PATTERNS) {
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
  
  // Try QUERY patterns
  for (const pattern of QUERY_PATTERNS) {
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
    'Guests: add, remove, update (RSVP, dietary, side)',
    'Vendors: add, remove, update (contract, category)',
    'Budget: add, remove, update (category, amount)',
    'Tasks: add, remove, update (priority, deadline)',
    'Rooms: add, remove, update (status)',
    'Queries: count, list, show by filter',
    'Examples: "Remove Sameer Jain from guests", "Add Rahul on groom side", "Mark all veg guests as RSVP Yes"',
  ];
}
