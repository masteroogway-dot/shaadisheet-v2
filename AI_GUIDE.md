# ShaadiSheet AI Assistant — Welcome Guide

## Overview

Your ShaadiSheet AI assistant helps you manage your wedding planning through natural language commands. It has two modes:

- **Fast Commands** — Instant responses for bulk updates, deletions, and queries
- **Smart Commands** — AI-powered commands that can create, update, and delete actual records in your database

---

## Fast Commands (Instant)

These commands are processed instantly by the built-in parser.

### Guest Management

| Command | What it does |
|---|---|
| `Mark all guests as RSVP Yes` | Sets all guests RSVP to Yes |
| `Mark all guests as RSVP Pending` | Sets all guests RSVP to Pending |
| `Set all Bride side guests dietary to Veg` | Updates dietary for Bride side |
| `Mark all Sharma guests as RSVP Yes` | Updates guests with "Sharma" in name |
| `Set dietary to Non-Veg for Groom side` | Updates dietary by side |
| `Delete all Declined guests` | Removes guests with Declined RSVP |
| `Delete all Pending guests` | Removes guests with Pending RSVP |
| `How many guests do I have?` | Shows guest count and RSVP breakdown |

### Vendor Management

| Command | What it does |
|---|---|
| `Set all vendor contracts to Signed` | Marks all vendors as booked |
| `Delete all Pending vendors` | Removes vendors with Pending contract |
| `How many vendors are booked?` | Shows vendor count and status |

### Budget Management

| Command | What it does |
|---|---|
| `What's my budget remaining?` | Shows budget summary |
| `Delete all budget items in Venue category` | Removes items by category |
| `How much have I spent?` | Shows allocated vs spent |

### Task Management

| Command | What it does |
|---|---|
| `Mark all tasks as done` | Marks all tasks complete |
| `How many tasks are remaining?` | Shows task count |

### Room Allocation

| Command | What it does |
|---|---|
| `Delete all Reserved rooms` | Removes rooms by status |
| `How many rooms do I have?` | Shows room count |

---

## Smart Commands (AI-Powered)

These commands use Groq AI with function calling. They **actually create, update, or delete records** in your database.

### Add Guests

```
Add these guests:
- Rahul Sharma, Groom side, Veg, Pending RSVP
- Priya Patel, Bride side, Non-Veg, Yes RSVP
- Amit Kumar, Groom side, Jain, Pending RSVP
```

```
Add 10 guests from the Bride side
```

```
Add guest: Neha Singh, Bride side, Friend, Veg
```

### Add Vendors

```
Create a vendor: Sharma Catering, Catering, contact 9876543210, quote 500000
```

```
Add a photographer: SnapShot Studios, Photography, quote 150000
```

### Add Budget Items

```
Create a budget item: Venue Decoration, Decorations, 300000
```

```
Add to budget: DJ Sound System, Music, 80000
```

### Add Tasks

```
Create a task: Book mehndi artist, deadline 2026-10-15
```

```
Add task: Finalize menu with caterer
```

### Allocate Rooms

```
Allocate 10 rooms at Hotel Express Inn, Deluxe type
```

```
Create 5 Standard rooms at Taj Residency
```

### Update Guests (Bulk)

```
Mark all Sharma guests as RSVP Yes
```

```
Set all Groom side guests dietary to Veg
```

```
Mark all Pending guests as Declined
```

### Delete Records

```
Delete all Declined guests
```

```
Delete all Pending vendors
```

### Query Your Data

```
What's my budget summary?
```

```
How many guests are confirmed?
```

```
What should I prioritize next?
```

```
Summarize my wedding planning status
```

---

## Complex AI Queries

The AI can also answer planning questions:

| Command | What it does |
|---|---|
| `Summarize my wedding planning status` | Full status overview |
| `What should I prioritize next?` | Smart task prioritization |
| `Analyze my budget and suggest savings` | Budget optimization |
| `Tell me about Mehndi ceremony traditions` | Cultural advice |
| `Which guests haven't RSVP'd yet?` | Guest tracking |
| `How does my vendor spend compare?` | Comparative analysis |
| `What am I missing for the wedding?` | Completeness check |
| `Create a timeline for me` | Event planning |

---

## Command Tips

### Be Specific
- ✅ `Mark all Sharma guests as RSVP Yes`
- ❌ `Update guests`

### Use Natural Language
- ✅ `Add 5 guests from Groom side`
- ✅ `Create a vendor for catering`
- ✅ `How much budget is left?`

### Combine Filters
- ✅ `Set dietary to Veg for all Bride side guests`
- ✅ `Delete all Pending guests from Groom side`

### The AI Understands Context
- Your wedding date, city, and budget are always available
- The AI knows your guest count, vendor count, and task progress
- It can give personalized suggestions based on your data

---

## What's Coming Next

- Smarter conversation memory
- Learning from your corrections
- Multi-step wedding planning workflows
- Integration with external vendor databases
- RSVP tracking via WhatsApp/SMS

---

## Need Help?

Type `help` in the AI chat panel anytime for a quick reference.

For issues or suggestions, contact support through the app.

---

*Last updated: July 2026*
