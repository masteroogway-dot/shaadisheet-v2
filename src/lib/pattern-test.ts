// Quick test to verify pattern coverage
// Run with: npx tsx src/lib/pattern-test.ts

import { parseWithPatterns } from './patterns';

const testCases = [
  // DELETE guests
  { input: 'remove Sameer Jain from guests', expected: 'delete_guests' },
  { input: 'delete Priya from guest list', expected: 'delete_guests' },
  { input: 'clear all veg guests', expected: 'delete_guests' },
  { input: 'drop all bride side guests', expected: 'delete_guests' },
  { input: 'remove all pending guests', expected: 'delete_guests' },
  { input: 'delete Sharma family', expected: 'delete_guests' },
  { input: 'get rid of non-veg guests', expected: 'delete_guests' },
  { input: 'erase all confirmed guests', expected: 'delete_guests' },
  
  // DELETE vendors
  { input: 'remove ABC Photography vendor', expected: 'delete_vendors' },
  { input: 'delete all signed vendors', expected: 'delete_vendors' },
  { input: 'drop all catering vendors', expected: 'delete_vendors' },
  { input: 'clear pending vendors', expected: 'delete_vendors' },
  
  // DELETE budget
  { input: 'remove decoration budget item', expected: 'delete_budget_items' },
  { input: 'delete catering expense', expected: 'delete_budget_items' },
  { input: 'clear all misc items', expected: 'delete_budget_items' },
  
  // DELETE tasks
  { input: 'remove book venue task', expected: 'delete_tasks' },
  { input: 'delete all urgent tasks', expected: 'delete_tasks' },
  { input: 'clear high priority tasks', expected: 'delete_tasks' },
  
  // DELETE rooms
  { input: 'remove room for Priya', expected: 'delete_rooms' },
  { input: 'delete all checked in rooms', expected: 'delete_rooms' },
  { input: 'clear reserved rooms', expected: 'delete_rooms' },
  
  // DELETE events
  { input: 'remove mehendi event', expected: 'delete_events' },
  { input: 'delete all events on 15th december', expected: 'delete_events' },
  
  // CREATE guests
  { input: 'add Rahul on groom side', expected: 'create_guests' },
  { input: 'add Priya Patel as cousin', expected: 'create_guests' },
  { input: 'create guest Sharma family bride side', expected: 'create_guests' },
  { input: 'new guest Amit non-veg', expected: 'create_guests' },
  { input: 'register Soham as friend', expected: 'create_guests' },
  
  // CREATE vendors
  { input: 'add Royal Photography as photographer', expected: 'create_vendors' },
  { input: 'new vendor Taj Catering catering', expected: 'create_vendors' },
  { input: 'book DJ Ravi for music', expected: 'create_vendors' },
  { input: 'hire Mehendi Master for mehendi', expected: 'create_vendors' },
  
  // CREATE budget
  { input: 'add catering expense 50000', expected: 'create_budget_item' },
  { input: 'new budget item photography 100000', expected: 'create_budget_item' },
  { input: 'insert decoration cost 30000', expected: 'create_budget_item' },
  
  // CREATE tasks
  { input: 'add task book venue by tomorrow', expected: 'create_task' },
  { input: 'new todo send invitations high priority', expected: 'create_task' },
  { input: 'create action item confirm caterer urgent', expected: 'create_task' },
  
  // CREATE rooms
  { input: 'allocate 2 deluxe rooms at Taj', expected: 'allocate_rooms' },
  { input: 'book standard room for Priya', expected: 'allocate_rooms' },
  { input: 'reserve suite at Grand Hyatt', expected: 'allocate_rooms' },
  
  // CREATE events
  { input: 'create mehendi event on 15th november', expected: '__event_create' },
  { input: 'add sangeet function tomorrow at 6pm', expected: '__event_create' },
  { input: 'new wedding ceremony on 25th december', expected: '__event_create' },
  
  // UPDATE guest RSVP
  { input: 'mark Priya as confirmed', expected: 'update_guests' },
  { input: 'set Sameer to attending', expected: 'update_guests' },
  { input: 'change Rahul RSVP to yes', expected: 'update_guests' },
  { input: 'update all veg guests to confirmed', expected: 'update_guests' },
  
  // UPDATE guest dietary
  { input: 'mark Amit as non-veg', expected: 'update_guests' },
  { input: 'change Priya dietary to jain', expected: 'update_guests' },
  { input: 'set Rahul as vegetarian', expected: 'update_guests' },
  
  // UPDATE guest side
  { input: 'mark Sharma family as groom side', expected: 'update_guests' },
  { input: 'change Rahul to bride side', expected: 'update_guests' },
  
  // UPDATE vendor contract
  { input: 'mark ABC Photography as signed', expected: 'update_vendors' },
  { input: 'set vendor contract to completed', expected: 'update_vendors' },
  { input: 'change DJ Ravi contract to pending', expected: 'update_vendors' },
  
  // UPDATE vendor category
  { input: 'change ABC Photography category to videography', expected: 'update_vendors' },
  
  // UPDATE vendor contact
  { input: 'update vendor contact to 9876543210', expected: 'update_vendors' },
  
  // UPDATE budget amount
  { input: 'change catering budget to 50000', expected: 'update_budget' },
  { input: 'update photography amount to 100000', expected: 'update_budget' },
  
  // UPDATE task priority
  { input: 'mark book venue task as urgent', expected: 'update_tasks' },
  { input: 'set task priority to high', expected: 'update_tasks' },
  
  // UPDATE task deadline
  { input: 'change task deadline to tomorrow', expected: 'update_tasks' },
  
  // UPDATE room status
  { input: 'mark room as checked in', expected: 'update_rooms' },
  { input: 'set Priya room status to reserved', expected: 'update_rooms' },
  
  // UPDATE room type
  { input: 'change room type to deluxe', expected: 'update_rooms' },
  
  // UPDATE event date
  { input: 'change mehendi event date to 20th december', expected: 'update_events' },
  { input: 'reschedule sangeet to tomorrow', expected: 'update_events' },
  
  // BULK operations
  { input: 'delete all guests', expected: 'delete_guests' },
  { input: 'delete all vendors', expected: 'delete_vendors' },
  { input: 'delete all budget items', expected: 'delete_budget_items' },
  { input: 'delete all tasks', expected: 'delete_tasks' },
  { input: 'delete all rooms', expected: 'delete_rooms' },
  { input: 'delete all events', expected: 'delete_events' },
  
  // QUERIES
  { input: 'how many guests', expected: '__query' },
  { input: 'count vendors', expected: '__query' },
  { input: 'show all tasks', expected: '__query' },
  { input: 'list budget items', expected: '__query' },
  { input: 'what is my budget', expected: '__query' },
  { input: 'what is pending', expected: '__query' },
  
  // SEARCH
  { input: 'find photographers in Mumbai', expected: 'search_vendors' },
  { input: 'search caterers in Delhi', expected: 'search_vendors' },
  
  // KNOWLEDGE
  { input: 'what rituals are in Hindu wedding', expected: '__knowledge' },
  { input: 'how much does a photographer cost', expected: '__knowledge' },
  { input: 'budget allocation advice', expected: '__knowledge' },
  
  // QUICK
  { input: 'yes', expected: '__quick' },
  { input: 'confirm', expected: '__quick' },
  { input: 'cancel', expected: '__quick' },
  { input: 'help', expected: '__quick' },
  { input: 'thanks', expected: '__quick' },
];

let passed = 0;
let failed = 0;

for (const tc of testCases) {
  const result = parseWithPatterns(tc.input);
  if (result && result.tool === tc.expected) {
    passed++;
  } else {
    failed++;
    console.log(`FAIL: "${tc.input}" -> expected ${tc.expected}, got ${result?.tool || 'null'}`);
  }
}

console.log(`\n${passed}/${testCases.length} passed (${failed} failed)`);
