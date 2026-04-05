# IPL Auction Arena (10-Team Live Auction)

A realtime IPL-style auction app where:
- 1 person creates the room as **Host**.
- Up to **10 participants** auto-join as team owners.
- Others can still join as spectators.
- Host runs the player lots and finalizes sold/unsold decisions.
- Each team submits **Playing XI** after the auction.
- App evaluates teams with a transparent scoring model and publishes rankings.

## Features

- Shared room link and room code join
- 10 preset IPL-style franchises
- Player dataset with base prices, roles, overseas flag, and rating
- Live bidding and purse deduction
- Squad tracking per team
- Playing XI submission by each team owner
- Fair ranking engine based on:
  - XI quality (total rating)
  - Role balance (batters, bowlers, all-rounders, wicket-keeper)
  - Overseas player cap check

## Tech

- Node.js
- Express
- Socket.IO
- Vanilla HTML/CSS/JS frontend

## Run

```bash
npm install
npm start
```

Open:
- `http://localhost:3000`

## How to Use

1. Open app in browser tab/window A, enter name, click **Create as Host**.
2. Copy the share link and open it in other tabs/devices.
3. 10 participants join as team owners automatically (first-come-first-serve).
4. Host clicks **Start Auction**.
5. Team owners place bids, host marks lot **Sold** or **Unsold**.
6. After auction ends, each owner selects and submits exactly 11 players.
7. Host can click **Evaluate Rankings** anytime after auction, or it auto-evaluates when all 10 XIs are submitted.

## Ranking Formula (transparent)

For each team's Playing XI:

- Base quality = sum of player ratings
- Penalties:
  - batting balance: `|batters - 5| * 8`
  - bowling balance: `|bowlers - 4| * 8`
  - all-rounder balance: `|all-rounders - 2| * 6`
  - no wicket-keeper: `+25`
  - overseas above 4: `(overseas - 4) * 20`
- Quality bonus: `max(0, ratingTotal - 760) * 0.15`

Final score:

`finalScore = ratingTotal - rolePenalty + qualityBonus`

Higher final score = better rank.

## Notes

- Room state is in-memory. Restarting server clears rooms.
- Dataset is auto-expanded to ensure enough players for 10 full XIs.
- This is an MVP foundation; you can next add authentication, persistent DB, timers, and anti-sniping rules.
