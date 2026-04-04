# War Room UI Preview - Visual Guide

## 🎨 Color Palette

```
┌──────────────────────────────────────────────┐
│                 COLORS USED                  │
├──────────────────────────────────────────────┤
│ PRIMARY GOLD        #e1ab00  ■ ← Actions     │
│ BACKGROUND NAVY     #0f1216  ■ ← Main BG    │
│ SURFACE             #191c1f  ■ ← Cards      │
│ SURFACE HIGH        #1f2225  ■ ← Elevated   │
│ TEXT LIGHT          #e1e2e7  ■ ← Default    │
│ TEXT MUTED          #49454f  ■ ← Secondary  │
│ SUCCESS EMERALD     #4caf50  ■ ← Positive   │
│ ERROR RED           #f2b8b5  ■ ← Negative   │
└──────────────────────────────────────────────┘
```

## 📱 Desktop View (1024px+)

```
╔════════════════════════════════════════════════════════════════════════════╗
║ 🏏 Room: ABC123    Status: 🔴 LIVE · 45/450    Teams: 8/10    [START][END] ║
╠═════════════════════════════════╦═══════════════════════════════════════════╣
║   TEAMS                         ║ ⬤ Next Players ←→                         ║
║  ┌─────────────────────────────┐║ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    ║
║  │ CSK                         │║ │Virat │ │Bumrah│ │ Dhoni│ │ ...  │➜  ║
║  │ 8/10 · ₹10 Cr              │║ │₹2Cr  │ │₹1Cr  │ │₹75L  │ │      │    ║
║  │                             │║ │BAT   │ │BOWL  │ │KEEP  │ │      │    ║
║  │ ▼ Squad [Spent: ₹110 Cr]  │║ └──────┘ └──────┘ └──────┘ └──────┘    ║
║  │ ├─ Mahi - ₹75 Cr           │║                                          ║
║  │ ├─ Raina - ₹60 Cr          │║  ╔════════════════════════════════════╗ ║
║  │ └─ ... 6 more              │║  ║ 🔨 Virat Kohli                     ║ ║
║  │                             │║  ║ Base: ₹2 Cr  Rating: 92/100       ║ ║
║  │ ┌─────────────────────────┐ ║║  ╠════════════════════════════════════╣ ║
║  │ │ MI                      │ ║║  ║ Highest Bid: ₹15 Cr (MI)          ║ ║
║  │ │ 7/10 · ₹35 Cr          │ ║║  ║ Next Bid: ₹15.5 Cr                ║ ║
║  │ │                         │ ║║  ╠════════════════════════════════════╣ ║
║  │ └─ [More Teams...] ──────→│ ║║  ║ [+0.5Cr] [+0.75Cr] [+1.0Cr]      ║ ║
║  │                           │ ║║  ║ [━━━━ PLACE BID ━━━━]             ║ ║
║  │                           │ ║║  ╚════════════════════════════════════╝ ║
║  │                           │ ║║                                          ║
║  │ Status: All Present ✓     │ ║║  📊 Bid History                       ║
║  └─────────────────────────────┘║  ├─ CSK placed ₹15 Cr (5 sec ago)    ║
║                                  ║  ├─ RCB placed ₹14.5 Cr (10s ago)   ║
║                                  ║  └─ MI placed ₹15 Cr (2 sec ago)    ║
╚════════════════════════════════════════════════════════════════════════════╝
┌────────────────────────────────────────────────────────────────────────────┐
│ 💬 Live Chat                                                               │
│ [Host]: Bidding is intense! · [Your Team]: Let's go CSK! · [Spec]: ..    │
│ [Input: Type message...________________________________] [SEND]          │
└────────────────────────────────────────────────────────────────────────────┘
```

## 📱 Tablet View (768-1024px)

```
╔══════════════════════════════════════════════════╗
║ Room: ABC │ Status: 🔴 LIVE · 45/450 │ Teams: 8 ║
╠══════════════════════════════════════════════════╣
║ ⬤ Next Players ←→                               ║
║ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐            ║
║ │Virat │ │Bumrah│ │Dhoni │ │...   │➜           ║
║ │₹2Cr  │ │₹1Cr  │ │₹75L  │ │      │            ║
║ └──────┘ └──────┘ └──────┘ └──────┘            ║
║                                                  ║
║  ╔════════════════════════════════════════╗     ║
║  ║ 🔨 Virat Kohli                        ║     ║
║  ║ Highest: ₹15 Cr (MI) | Next: ₹15.5 Cr║     ║
║  ║ [+0.5] [+0.75] [+1]                   ║     ║
║  ║ [━━━━ PLACE BID ━━━━]                 ║     ║
║  ╚════════════════════════════════════════╝     ║
║                                                  ║
║  📊 Bid History                                 ║
║  ├─ CSK placed ₹15 Cr                          ║
║  ├─ RCB placed ₹14.5 Cr                        ║
║  └─ MI placed ₹15 Cr                           ║
║                                                  ║
╠══════════════════════════════════════════════════╣
║ 💬 Chat [Input__________________] [SEND]        ║
╚══════════════════════════════════════════════════╝
```

## 📱 Mobile View (<768px)

```
╔════════════════════════════════╗
║ 🏏 ABC │ 8/10 │ LIVE · 45/450  ║
╠════════════════════════════════╣
║ ⬡ Upcoming Players            ║
║ ┌────────┐ ┌────────┐          ║
║ │Virat   │ │Bumrah  │ ➜        ║
║ │₹2 Cr   │ │₹1 Cr   │          ║
║ └────────┘ └────────┘          ║
║                                 ║
║ ╔════════════════════════════╗  ║
║ ║ 🔨 Virat Kohli            ║  ║
║ ║ Highest: ₹15 Cr (MI)      ║  ║
║ ║ Next: ₹15.5 Cr            ║  ║
║ ╚════════════════════════════╝  ║
║                                 ║
║ [+0.5 Cr] [+0.75 Cr] [+1 Cr]   ║
║ [━━ PLACE BID ━━]              ║
║                                 ║
║ 📊 Recent Bids                  ║
║ ├─ CSK ₹15 Cr                  ║
║ ├─ RCB ₹14.5 Cr                ║
║ └─ MI ₹15 Cr                   ║
║                                 ║
║ [Chat: Last message...] ▼      ║
║ [Input_________] [→]           ║
╠════════════════════════════════╣
║ 🏠  📊  💬  ☰                  ║  ← Bottom Nav
╚════════════════════════════════╝
```

## 🎯 Component Details

### Header
```
┌─────────────────────────────────────────────────────────┐
│ 🏏 Room: ABC123      │ 🔴 LIVE · 45/450 │ 8/10 Teams   │
│ Room ID displayed     Auction status        Live count   │
│ Quick reference       Progress indicator    Present/Max  │
└─────────────────────────────────────────────────────────┘
```

### Current Player Card
```
┌──────────────────────────────────────┐
│ 🔨 LIVE UNDER HAMMER                │
│ Virat Kohli                          │
│ Base Price: ₹2 Cr                    │
├──────────────────────────────────────┤
│ Role: Batter          Rating: 92/100 │
│ Type: 🇮🇳 Indian       Home: RCB     │
│ Overseas: NO                         │
└──────────────────────────────────────┘
```

### Bid Display (with Glow)
```
┌──────────────────────────────────────┐
│✨ HIGHEST BID      NEXT BID REQUIRED ✨│
│✨ ₹15.00 Cr        ₹15.50 Cr        ✨│
│✨ Team: MI         (Minimum)        ✨│
│✨ [Pulsing Glow Effect]             ✨│
└──────────────────────────────────────┘
```

### Team Accordion (Open State)
```
┌─────────────────────────────────────────┐
│ ▼ CSK   8/10 Squad · ₹10 Cr Remaining  │
├─────────────────────────────────────────┤
│ Spent: ₹110 Cr                          │
│ ├─ Mahi Dhoni (W/K) - ₹75 Cr           │
│ ├─ Suresh Raina (Bat) - ₹60 Cr         │
│ ├─ Ajinkya Rahane (Bat) - ₹50 Cr       │
│ ├─ Dwayne Bravo (Bowl) - ₹45 Cr        │
│ ├─ ... 4 more players                   │
│ └─ Total Squad Value: ₹110 Cr           │
└─────────────────────────────────────────┘
```

### Bid History
```
┌──────────────────────────────────────┐
│ 📊 Recent Bids (Last 10)            │
├──────────────────────────────────────┤
│ 🔘 CSK placed ₹15 Cr (2 sec ago)    │
│ 🔘 RCB placed ₹14.5 Cr (5 sec ago)  │
│ 🔘 MI placed ₹15 Cr (10 sec ago)    │
│ 🔘 DC placed ₹14 Cr (15 sec ago)    │
│ 🔘 ... scrollable list               │
└──────────────────────────────────────┘
```

### Chat Interface
```
┌──────────────────────────────────────────┐
│ 💬 Live Chat                            │
├──────────────────────────────────────────┤
│ Host: Bidding starts in 5 seconds!       │
│ Your Team: Let's bid high!               │
│ Spectator: This is exciting!             │
│ Your Team: Need to save purse            │
├──────────────────────────────────────────┤
│ [Type message here...___________] [→]   │
└──────────────────────────────────────────┘
```

## 🎬 Animation Effects

### Glow Animation (2s loop)
```
Frame 1:   ╔══════════════╗
           ║ ✨ ₹15 Cr ✨ ║  (Subtle glow)
           ╚══════════════╝

Frame 2:   ╔═════════════════════════╗
           ║ ✨✨ ₹15 Cr ✨✨ ║  (Strong glow)
           ╚═════════════════════════╝

Frame 3:   ╔══════════════╗
           ║ ✨ ₹15 Cr ✨ ║  (Back to subtle)
           ╚══════════════╝
```

### Button Hover Effect
```
Default:   [PLACE BID]        (Normal appearance)

Hover:     [PLACE BID]        (Glowing gold, lifted slightly)
           └─ ✨ glow effect

Active:    [PLACE BID]        (Pressed appearance)
```

## 📊 Responsive Behavior

### Breakpoint Changes
```
< 768px (Mobile)
├─ Sidebar: Hidden
├─ Layout: Full-width stacked
├─ Header: Compact with menu
├─ Chat: Bottom of page
└─ Nav: Bottom tab bar

768-1024px (Tablet)
├─ Sidebar: Hidden by default
├─ Layout: Full-width content area
├─ Header: Flexible with icons
├─ Chat: Inline at bottom
└─ Nav: Top menu only

1024px+ (Desktop)
├─ Sidebar: 25% width, left side
├─ Layout: 3-column grid
├─ Header: Full controls visible
├─ Chat: Bottom full-width
└─ Nav: No bottom nav

Transitions: 300ms smooth animation
```

## 🎨 Visual Hierarchy

```
1. HIGHEST PRIORITY (Largest, brightest)
   ├─ Current player name
   ├─ Highest bid amount
   └─ Place bid button (gold)

2. HIGH PRIORITY (Large, clear)
   ├─ Player stats
   ├─ Next bid amount
   └─ Preset buttons

3. MEDIUM PRIORITY (Normal size)
   ├─ Bid history
   ├─ Team accordion
   └─ Upcoming queue

4. LOW PRIORITY (Small, muted)
   ├─ Timestamps
   ├─ Helper text
   └─ Status messages

Color Emphasis:
  Gold (#e1ab00) → Action items
  White text → Primary content
  Gray text → Secondary content
  Muted → Disabled/inactive
```

## ✨ Key Design Features

### 1. Glow Effect on Bid Card
- Animates continuously during auction
- Shows highest bid is active
- Draws attention naturally
- Doesn't distract from other content

### 2. Color Coding
- Role badges: Blue (Bowler), Green (All-rounder), etc.
- Team indicators: Team colors in accent
- Status: Green (success), Red (error), Gold (active)

### 3. Responsive Images
- Player images scale with container
- No layout shift when loading
- Placeholder color if missing

### 4. Touch Friendly
- Buttons: Min 44px tap target
- Spacing: 8px minimum between elements
- Scrollable areas: Full-width swipe zones

### 5. Dark Theme Benefits
- Reduces eye strain during long auctions
- Professional appearance
- Gold accents stand out naturally
- Better contrast for text

---

This is the visual identity of your new war room! 🎉

