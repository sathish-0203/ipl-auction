## IPL Auction War Room - UI Layout Guide

### DESKTOP VIEW (1024px+)
```
┌────────────────────────────────────────────────────────────────────────┐
│ Room Code  │ Status: 45/450 │          │ Teams: 8/10 │ START │ END │  │
└────────────────────────────────────────────────────────────────────────┘
┌──────────────┬──────────────────────────────────────────────────────────┐
│   TEAMS      │  Upcoming Players (Horizontal Scroll)                     │
│              │                                                          │
│ ┌──────────┐ │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │
│ │ CSK      │ │  │Player1 │ │Player2 │ │Player3 │ │Player4 │ ➜      │
│ │8/10      │ │  │₹50 Cr  │ │₹60 Cr  │ │₹75 Cr  │ │₹2 Cr   │          │
│ │Purse:10Cr│ │  │ BOWLER │ │BATTER  │ │ALL-RND │ │KEEPER  │          │
│ │           │ │  └────────┘ └────────┘ └────────┘ └────────┘          │
│ │ Virat    │ │                                                          │
│ │ Bumrah   │ │  ┌─────────────────────────────────────────────────────┐│
│ │ ...      │ │  │  Current Player Under Hammer                       ││
│ │           │ │  ├─────────────────────────────────────────────────────┤│
│ │           │ │  │ 🔨 Virat Kohli          │ Highest: ₹15 Cr (MI)   ││
│ │           │ │  │ Base: ₹2 Cr             │ Next: ₹15.5 Cr         ││
│ │           │ │  ├─────────────────────────────────────────────────────┤│
│ │           │ │  │ Role: Batter       Type: Indian  Rating: 92/100   ││
│ │           │ │  ├─────────────────────────────────────────────────────┤│
│ │           │ │  │ [+0.5Cr] [+0.75Cr] [+1Cr]                         ││
│ │           │ │  │ [━━━━━ PLACE BID ━━━━━]                            ││
│ │           │ │  └─────────────────────────────────────────────────────┘│
│ │           │ │                                                          │
│ │           │ │  Bid History                                            │
│ │           │ │  ├─ CSK placed ₹15 Cr                                  │
│ │           │ │  ├─ RCB placed ₹14.5 Cr                                │
│ │           │ │  └─ MI placed ₹15 Cr                                   │
│ └──────────┘ │                                                          │
└──────────────┴──────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────────────┐
│ Live Chat                                                               │
│ [Host message]                                                          │
│ [Your team message] ➤                                                   │
│ [Input field...________________________________________] [SEND]        │
└────────────────────────────────────────────────────────────────────────┘
```

### TABLET VIEW (768-1024px)
```
┌─────────────────────────────────────────────────┐
│ Room Code  Status  Teams  [START] [END]  [MENU] │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ Upcoming Players (Scroll)                        │
│ ┌─────┐ ┌─────┐ ┌─────┐ ➜                       │
│ │P1   │ │P2   │ │P3   │                         │
│ └─────┘ └─────┘ └─────┘                         │
├─────────────────────────────────────────────────┤
│                                                  │
│  Player Display + Bidding Controls               │
│  [All content stacked vertically]                │
│                                                  │
│  Bid History                                     │
│  [Scrollable list]                               │
│                                                  │
├─────────────────────────────────────────────────┤
│ Live Chat                                        │
│ [Messages...] [Input] [SEND]                     │
└─────────────────────────────────────────────────┘
```

### MOBILE VIEW (<768px)
```
┌──────────────────────┐
│ ☰ │Code │ Teams │ ⋯ │
├──────────────────────┤
│ Upcoming (Scroll →)   │
│ ┌─────┐ ┌─────┐      │
│ │P1   │ │P2   │ ➜    │
│ └─────┘ └─────┘      │
├──────────────────────┤
│                      │
│  Player Display      │
│  [Responsive Stack]  │
│                      │
│  Bid Controls        │
│  [Full Width Buttons]│
│                      │
│  Bid History         │
│  [Compact List]      │
│                      │
│  Chat                │
│  [Messages]          │
│  [Input] [Send]      │
│                      │
├──────────────────────┤
│ 🏠 │ 📊 │ 💬 │ ⋯     │
└──────────────────────┘
Bottom Navigation Tabs
```

## Color Scheme

```
PRIMARY: #e1ab00 (Gold)         ← Action buttons, highlights, glowing effects
├─ Light overlay: rgba(225,171,0,0.1)
├─ Medium glow: rgba(225,171,0,0.3)
└─ Full glow: rgba(225,171,0,0.6)

BACKGROUND: #0f1216 (Deep Navy)  ← Main page background
├─ Surface Container: #191c1f    ← Elevated cards
├─ Surface Container High: #1f2225
└─ Surface Container Highest: #2b2f33

TEXT: #e1e2e7 (Light Gray)
├─ Disabled: opacity 0.5
├─ Secondary: #a8adb5
└─ Muted: #49454f (Outline Variant)

SEMANTIC:
├─ Error: #f2b8b5
├─ Success: #4caf50 (Emerald)
└─ Warning: #ffc107
```

## Component States

### Button States
```
Default:    [PLACE BID]      (Enabled, ready to click)
Hover:      [PLACE BID]      (Gold glow, slight lift)
Disabled:   [PLACE BID]      (50% opacity, no interaction)
Pressed:    [PLACE BID]      (Slight depression)
```

### Bid Display Glow
```
Off:        Highest Bid display with normal border
Glow:       ✨ Pulsing gold glow (2s animation loop)
```

### Team Accordion
```
Closed:     [▼ CSK 8/10 Purse: ₹10Cr]
Open:       [▲ CSK 8/10 Purse: ₹10Cr]
            [Player 1 - ₹50 Cr]
            [Player 2 - ₹75 Cr]
```

## Responsive Breakpoints

```
Mobile:     < 768px   (Portrait phones, small tablets)
Tablet:     768px - 1024px (Landscape phones, tablets)
Desktop:    >= 1024px (Laptops, desktop monitors)

Key Changes:
768px:  Hide sidebar, mobile nav, compact header
1024px: Show full sidebar, desktop header, full controls
```

## Animation Timings

```
Transitions:    300ms cubic-bezier (smooth ease)
Glow Animation: 2s ease-in-out infinite (pulsing effect)
Accordion:      300ms ease-out (smooth expand/collapse)
Button Hover:   150ms (quick response)
Icon Rotate:    180deg (accordion expand indicator)
```

---

## Element IDs (for JavaScript reference)

```javascript
// Header & Status
roomCodeDisplay          // Room code display
auctionStatusText        // Auction status (LIVE/ENDED/etc)
playersRemainingText     // Players remaining count
teamsLiveCount           // Teams present count
teamsPresentCount        // Full team status text

// Sidebar
teamsAccordion           // Teams accordion container

// Upcoming Queue
upcomingQueueContainer   // Horizontal scroll player queue

// Player Display
playerNameDisplay        // Current player name
playerStatusBadge        // Status badge (LIVE/WAITING)
basePriceDisplay         // Base price amount
playerRoleDisplay        // Player role (Batter/Bowler/etc)
playerRatingDisplay      // Player rating
playerTypeDisplay        // Player type (Indian/Overseas)
playerTeamDisplay        // Home team
playerOverseasDisplay    // Overseas indicator

// Bidding Controls
highestBidDisplay        // Highest bid amount
highestBidTeamDisplay    // Team with highest bid
nextBidAmountDisplay     // Minimum next bid
presetBid1/2/3          // Preset bid buttons (+0.5, +0.75, +1)
placeBidBtn             // Place bid button
bidMessage              // Bid status message

// Bid History
bidHistoryContainer      // Bid history list

// Chat
chatInput               // Chat message input
chatSendBtn             // Send chat button
chatMessagesContainer   // Chat messages display

// Buttons
startAuctionBtn         // Start auction (host only)
endAuctionBtn           // End auction (host only)
leaveRoomBtn            // Leave room button
mobileLeaveBtn          // Mobile leave button
```

---

## Key Features Location

| Feature | Location | Breakpoint |
|---------|----------|-----------|
| Team Sidebar | Left 25% | 1024px+ only |
| Upcoming Queue | Top center | All |
| Player Display | Center | All |
| Bid Controls | Center | All |
| Bid History | Center | All |
| Live Chat | Bottom | All |
| Header Controls | Top right | All |
| Mobile Nav | Bottom | <768px |

