/* ══════════════════════════════════════════════════
   IPL AUCTION ARENA — server.js
   ══════════════════════════════════════════════════ */
"use strict";

const path    = require("path");
const fs      = require("fs");
const http    = require("http");
const https   = require("https");
const express = require("express");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3000;
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const PURSE_PER_TEAM = 120;   // crores

const TEAM_NAMES = [
  "Chennai Super Kings",
  "Mumbai Indians",
  "Royal Challengers Bengaluru",
  "Kolkata Knight Riders",
  "Rajasthan Royals",
  "Delhi Capitals",
  "Sunrisers Hyderabad",
  "Punjab Kings",
  "Lucknow Super Giants",
  "Gujarat Titans",
];

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

/* ══════════════════════════════════════════════════
   ROUTING
══════════════════════════════════════════════════ */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/war-room", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "war-room-new.html"));
});

/* ══════════════════════════════════════════════════
   PLAYER DATA — prefers external dataset file
══════════════════════════════════════════════════ */
const BASE_PLAYERS = loadAuctionPlayers();

function normalizeRole(rawRole = "") {
  const role = String(rawRole).trim().toLowerCase();
  if (role.includes("all")) return "All-Rounder";
  if (role.includes("keep") || role === "wk") return "Wicket-Keeper";
  if (role.includes("bowl")) return "Bowler";
  return "Batter";
}

function estimateRating(basePrice) {
  const p = Number(basePrice) || 1;
  const normalized = Math.min(20, Math.max(1, p));
  return Math.round(62 + (normalized - 1) * 1.8);
}

function loadPlayersFromJsonFile(filePath) {
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed) || parsed.length === 0) return null;

  const normalized = parsed
    .map((p, index) => {
      const id = String(
        p.id ||
        p.playerId ||
        p.player_id ||
        `ext-${index + 1}`
      );
      const name = String(p.name || p.playerName || p.player_name || "").trim();
      if (!name) return null;

      const basePriceRaw =
        p.basePrice ?? p.base_price ?? p.base ?? p.price ?? p.amount ?? p.baseAmount;
      const basePrice = Number(basePriceRaw);
      const safeBasePrice = Number.isFinite(basePrice) ? basePrice : 2;

      const ratingRaw = Number(p.rating);
      const rating = Number.isFinite(ratingRaw) ? ratingRaw : estimateRating(safeBasePrice);

      let overseas = Boolean(p.overseas);
      if (typeof p.country === "string") {
        overseas = p.country.trim().toLowerCase() !== "india";
      }

      const setOrderRaw = p.setOrder ?? p.set_order;
      const setOrder = Number.isFinite(Number(setOrderRaw)) ? Number(setOrderRaw) : undefined;

      return {
        id,
        name,
        role: normalizeRole(p.role),
        basePrice: safeBasePrice,
        rating,
        overseas,
        marquee: Boolean(p.marquee),
        team: p.team || p.teamName || p.team_name || null,
        auctionSet: p.auctionSet || p.auction_set || "Open",
        setOrder,
      };
    })
    .filter(Boolean);

  return normalized.length ? normalized : null;
}

function loadAuctionPlayers() {
  const rootDatasetPath = path.join(__dirname, "players_data.json");
  const dataDatasetPath = path.join(__dirname, "data", "players.json");

  const rootPlayers = loadPlayersFromJsonFile(rootDatasetPath);
  if (rootPlayers) {
    console.log(`Loaded ${rootPlayers.length} players from players_data.json`);
    return rootPlayers;
  }

  const dataPlayers = loadPlayersFromJsonFile(dataDatasetPath);
  if (dataPlayers) {
    console.log(`Loaded ${dataPlayers.length} players from data/players.json`);
    return dataPlayers;
  }

  const fallback = buildBasePlayers();
  console.log(`Loaded ${fallback.length} fallback generated players`);
  return fallback;
}

function buildBasePlayers() {
  /* ─── Real IPL Player Seed List ─── */
  const seed = [
    // CSK
    { name:"MS Dhoni",           role:"Wicket-Keeper", rating:95, basePrice:20, overseas:false },
    { name:"Ruturaj Gaikwad",    role:"Batter",        rating:87, basePrice:14, overseas:false },
    { name:"Ravindra Jadeja",    role:"All-Rounder",   rating:90, basePrice:16, overseas:false },
    { name:"Deepak Chahar",      role:"Bowler",        rating:82, basePrice:14, overseas:false },
    { name:"Shivam Dube",        role:"All-Rounder",   rating:80, basePrice:12, overseas:false },
    { name:"Ajinkya Rahane",     role:"Batter",        rating:78, basePrice:10, overseas:false },
    { name:"Moeen Ali",          role:"All-Rounder",   rating:83, basePrice:14, overseas:true  },
    { name:"Devon Conway",       role:"Wicket-Keeper", rating:86, basePrice:14, overseas:true  },
    { name:"Matheesha Pathirana",role:"Bowler",        rating:82, basePrice:13, overseas:true  },
    { name:"Tushar Deshpande",   role:"Bowler",        rating:76, basePrice:10, overseas:false },
    { name:"Mitchell Santner",   role:"All-Rounder",   rating:79, basePrice:11, overseas:true  },

    // MI
    { name:"Rohit Sharma",       role:"Batter",        rating:94, basePrice:16, overseas:false },
    { name:"Hardik Pandya",      role:"All-Rounder",   rating:91, basePrice:15, overseas:false },
    { name:"Suryakumar Yadav",   role:"Batter",        rating:93, basePrice:16, overseas:false },
    { name:"Jasprit Bumrah",     role:"Bowler",        rating:97, basePrice:16, overseas:false },
    { name:"Ishan Kishan",       role:"Wicket-Keeper", rating:84, basePrice:15, overseas:false },
    { name:"Tilak Varma",        role:"Batter",        rating:81, basePrice:14, overseas:false },
    { name:"Tim David",          role:"All-Rounder",   rating:83, basePrice:14, overseas:true  },
    { name:"Romario Shepherd",   role:"All-Rounder",   rating:78, basePrice:11, overseas:true  },
    { name:"Gerald Coetzee",     role:"Bowler",        rating:79, basePrice:12, overseas:true  },
    { name:"Naman Dhir",         role:"All-Rounder",   rating:74, basePrice:8,  overseas:false },

    // RCB
    { name:"Virat Kohli",        role:"Batter",        rating:97, basePrice:16, overseas:false },
    { name:"Faf du Plessis",     role:"Batter",        rating:85, basePrice:14, overseas:true  },
    { name:"Glenn Maxwell",      role:"All-Rounder",   rating:88, basePrice:14, overseas:true  },
    { name:"Mohammed Siraj",     role:"Bowler",        rating:85, basePrice:16, overseas:false },
    { name:"Dinesh Karthik",     role:"Wicket-Keeper", rating:81, basePrice:12, overseas:false },
    { name:"Cameron Green",      role:"All-Rounder",   rating:83, basePrice:17, overseas:true  },
    { name:"Alzarri Joseph",     role:"Bowler",        rating:80, basePrice:11, overseas:true  },
    { name:"Yash Dayal",         role:"Bowler",        rating:74, basePrice:8,  overseas:false },
    { name:"Anuj Rawat",         role:"Wicket-Keeper", rating:72, basePrice:6,  overseas:false },

    // KKR
    { name:"Shreyas Iyer",       role:"Batter",        rating:87, basePrice:12, overseas:false },
    { name:"Andre Russell",      role:"All-Rounder",   rating:91, basePrice:12, overseas:true  },
    { name:"Sunil Narine",       role:"All-Rounder",   rating:89, basePrice:12, overseas:true  },
    { name:"Phil Salt",          role:"Wicket-Keeper", rating:85, basePrice:13, overseas:true  },
    { name:"Mitchell Starc",     role:"Bowler",        rating:90, basePrice:24, overseas:true  },
    { name:"Rinku Singh",        role:"Batter",        rating:82, basePrice:13, overseas:false },
    { name:"Venkatesh Iyer",     role:"All-Rounder",   rating:81, basePrice:14, overseas:false },
    { name:"Harshit Rana",       role:"Bowler",        rating:77, basePrice:10, overseas:false },
    { name:"Varun Chakravarthy", role:"Bowler",        rating:83, basePrice:12, overseas:false },
    { name:"Manish Pandey",      role:"Batter",        rating:73, basePrice:6,  overseas:false },

    // RR
    { name:"Sanju Samson",       role:"Wicket-Keeper", rating:88, basePrice:14, overseas:false },
    { name:"Jos Buttler",        role:"Wicket-Keeper", rating:91, basePrice:14, overseas:true  },
    { name:"Ravichandran Ashwin",role:"All-Rounder",   rating:88, basePrice:12, overseas:false },
    { name:"Shimron Hetmyer",    role:"Batter",        rating:82, basePrice:11, overseas:true  },
    { name:"Dhruv Jurel",        role:"Wicket-Keeper", rating:78, basePrice:14, overseas:false },
    { name:"Riyan Parag",        role:"All-Rounder",   rating:79, basePrice:11, overseas:false },
    { name:"Trent Boult",        role:"Bowler",        rating:87, basePrice:12, overseas:true  },
    { name:"Yuzvendra Chahal",   role:"Bowler",        rating:87, basePrice:18, overseas:false },
    { name:"Jason Roy",          role:"Batter",        rating:82, basePrice:10, overseas:true  },
    { name:"Yashasvi Jaiswal",   role:"Batter",        rating:86, basePrice:14, overseas:false },

    // DC
    { name:"David Warner",       role:"Batter",        rating:88, basePrice:12, overseas:true  },
    { name:"Rishabh Pant",       role:"Wicket-Keeper", rating:91, basePrice:16, overseas:false },
    { name:"Axar Patel",         role:"All-Rounder",   rating:85, basePrice:16, overseas:false },
    { name:"Anrich Nortje",      role:"Bowler",        rating:86, basePrice:13, overseas:true  },
    { name:"Kuldeep Yadav",      role:"Bowler",        rating:86, basePrice:13, overseas:false },
    { name:"Mitchell Marsh",     role:"All-Rounder",   rating:84, basePrice:11, overseas:true  },
    { name:"Prithvi Shaw",       role:"Batter",        rating:78, basePrice:8,  overseas:false },
    { name:"Jake Fraser-McGurk", role:"Batter",        rating:80, basePrice:10, overseas:true  },
    { name:"Mukesh Kumar",       role:"Bowler",        rating:76, basePrice:10, overseas:false },
    { name:"Tristan Stubbs",     role:"Batter",        rating:78, basePrice:7,  overseas:true  },

    // SRH
    { name:"Abhishek Sharma",    role:"All-Rounder",   rating:82, basePrice:14, overseas:false },
    { name:"Travis Head",        role:"Batter",        rating:90, basePrice:14, overseas:true  },
    { name:"Heinrich Klaasen",   role:"Wicket-Keeper", rating:87, basePrice:23, overseas:true  },
    { name:"Pat Cummins",        role:"All-Rounder",   rating:92, basePrice:20, overseas:true  },
    { name:"Bhuvneshwar Kumar",  role:"Bowler",        rating:82, basePrice:10, overseas:false },
    { name:"Nitish Kumar Reddy", role:"All-Rounder",   rating:78, basePrice:6,  overseas:false },
    { name:"Adam Zampa",         role:"Bowler",        rating:82, basePrice:11, overseas:true  },
    { name:"Shahbaz Ahmed",      role:"All-Rounder",   rating:76, basePrice:10, overseas:false },
    { name:"T Natarajan",        role:"Bowler",        rating:81, basePrice:11, overseas:false },
    { name:"Aiden Markram",      role:"All-Rounder",   rating:83, basePrice:11, overseas:true  },

    // PBKS
    { name:"Shikhar Dhawan",     role:"Batter",        rating:80, basePrice:8,  overseas:false },
    { name:"Sam Curran",         role:"All-Rounder",   rating:83, basePrice:18, overseas:true  },
    { name:"Jonny Bairstow",     role:"Wicket-Keeper", rating:86, basePrice:12, overseas:true  },
    { name:"Arshdeep Singh",     role:"Bowler",        rating:84, basePrice:18, overseas:false },
    { name:"Liam Livingstone",   role:"All-Rounder",   rating:83, basePrice:13, overseas:true  },
    { name:"Kagiso Rabada",      role:"Bowler",        rating:90, basePrice:14, overseas:true  },
    { name:"Harpreet Brar",      role:"All-Rounder",   rating:74, basePrice:8,  overseas:false },
    { name:"Matthew Short",      role:"All-Rounder",   rating:77, basePrice:8,  overseas:true  },
    { name:"Rilee Rossouw",      role:"Batter",        rating:80, basePrice:8,  overseas:true  },

    // LSG
    { name:"KL Rahul",           role:"Wicket-Keeper", rating:88, basePrice:17, overseas:false },
    { name:"Nicholas Pooran",    role:"Wicket-Keeper", rating:86, basePrice:21, overseas:true  },
    { name:"Marcus Stoinis",     role:"All-Rounder",   rating:83, basePrice:16, overseas:true  },
    { name:"Quinton de Kock",    role:"Wicket-Keeper", rating:87, basePrice:15, overseas:true  },
    { name:"Avesh Khan",         role:"Bowler",        rating:79, basePrice:10, overseas:false },
    { name:"Kyle Mayers",        role:"All-Rounder",   rating:80, basePrice:11, overseas:true  },
    { name:"Krunal Pandya",      role:"All-Rounder",   rating:79, basePrice:8,  overseas:false },
    { name:"Shamar Joseph",      role:"Bowler",        rating:78, basePrice:11, overseas:true  },
    { name:"Ravi Bishnoi",       role:"Bowler",        rating:81, basePrice:12, overseas:false },

    // GT
    { name:"Shubman Gill",       role:"Batter",        rating:90, basePrice:12, overseas:false },
    { name:"Hardik Pandya",      role:"All-Rounder",   rating:91, basePrice:15, overseas:false },
    { name:"David Miller",       role:"Batter",        rating:86, basePrice:14, overseas:true  },
    { name:"Rashid Khan",        role:"All-Rounder",   rating:94, basePrice:15, overseas:true  },
    { name:"Mohammed Shami",     role:"Bowler",        rating:90, basePrice:19, overseas:false },
    { name:"Wriddhiman Saha",    role:"Wicket-Keeper", rating:77, basePrice:6,  overseas:false },
    { name:"Vijay Shankar",      role:"All-Rounder",   rating:74, basePrice:6,  overseas:false },
    { name:"Rahul Tewatia",      role:"All-Rounder",   rating:78, basePrice:9,  overseas:false },
    { name:"Spencer Johnson",    role:"Bowler",        rating:79, basePrice:10, overseas:true  },
    { name:"Noor Ahmad",         role:"Bowler",        rating:79, basePrice:10, overseas:true  },
  ];

  /* ─── Domestic / Emerging Players ─── */
  const domesticBatters = [
    "Prabhsimran Singh","Tilak Varma","Rajat Patidar","Sachin Baby","Robin Uthappa",
    "Ajinkya Rahane","Cheteshwar Pujara","Mayank Agarwal","Shubman Gill","Devdutt Padikkal",
    "Sarfaraz Khan","Musheer Khan","Abhimanyu Easwaran","Sai Sudharsan","Priyank Panchal",
    "Baba Aparajith","Anmolpreet Singh","Aryan Juyal","Smit Patel","Vishnu Vinod",
    "Ricky Bhui","Sudip Chatterjee","Upendra Yadav","Karan Sharma","Parthi Nishanth",
    "Shaik Rasheed","Rohan Kunnummal","Yash Dubey","Samarth R","N Jagadeesan",
    "R Sai Kishore","Aryaman Birla","Nikin Jose","Nishant Sindhu","Kumar Kushagra",
    "Shashank Singh","Ayush Mhatre","Harsh Garg","Himanshu Sharma","Arslan Khan",
  ];
  const domesticBowlers = [
    "Navdeep Saini","Jaydev Unadkat","Shardul Thakur","Khaleel Ahmed","Umesh Yadav",
    "Shivam Mavi","Kamlesh Nagarkoti","Sandeep Warrior","Akash Deep","Yash Thakur",
    "Basil Thampi","Chetan Sakariya","Gaurav Sharma","Tushar Deshpande","Aman Khan",
    "Vijaykumar Vyshak","Shams Mulani","Atit Sheth","Mohit Sharma","Vidwath Kaverappa",
    "Sai Kishore","Kulwant Khejroliya","Harshal Patel","Simarjeet Singh","Abhimanyu Mithun",
    "Nandre Burger","Lukman Meriwala","Manav Suthar","Hardus Viljoen","Kartik Tyagi",
    "Rajvardhan Hangargekar","Mukesh Choudhary","Prasidh Krishna","Avesh Khan","Ankit Rajpoot",
  ];
  const domesticAllRounders = [
    "Washington Sundar","Deepak Hooda","Vijay Shankar","Stuart Binny","Piyush Chawla",
    "Imran Tahir","Amit Mishra","Ellyse Perry (Men Equiv)","Karn Sharma","Suyash Prabhudessai",
    "Nitish Rana","Aditya Tare","Pravin Tambe","Swapnil Singh","Pawan Negi",
    "Sachin Dhas","Fabian Allen","Sumit Kumar","Kevin Koththigoda","M Siddharth",
    "Akash Madhwal","Akash Rajput","Pradeep Sangwan","Gursewak Singh","Chama Milind",
    "Akash Singh","Mayank Dagar","Anmol Malhotra","Tanveer Sangha","Beau Webster",
  ];
  const domesticWK = [
    "Naman Ojha","Parthiv Patel","Sheldon Jackson","B Sai Sudharsan","Kona Bharat",
    "Rahul Tripathi","Srikar Bharat","Tanmay Agarwal","Akshay Wadkar","Jitesh Sharma",
    "Prabhsimran Singh","Urvil Patel","Aryan Juyal","Sai Kishore (WK)","Finn Allen",
    "Dane van Niekerk","Manish Pandey","Rishi Dhawan","Deepak Chahar (WK)","Kumar Kushagra",
  ];
  const overseasExtras = [
    { name:"Chris Jordan",       role:"Bowler",        rating:79, basePrice:6,  overseas:true },
    { name:"Chris Woakes",       role:"All-Rounder",   rating:82, basePrice:8,  overseas:true },
    { name:"Daryl Mitchell",     role:"All-Rounder",   rating:81, basePrice:10, overseas:true },
    { name:"Mark Wood",          role:"Bowler",        rating:84, basePrice:12, overseas:true },
    { name:"Lockie Ferguson",    role:"Bowler",        rating:82, basePrice:10, overseas:true },
    { name:"Wanindu Hasaranga",  role:"All-Rounder",   rating:85, basePrice:15, overseas:true },
    { name:"Dushmantha Chameera",role:"Bowler",        rating:80, basePrice:10, overseas:true },
    { name:"Michael Bracewell",  role:"All-Rounder",   rating:79, basePrice:8,  overseas:true },
    { name:"Ben Stokes",         role:"All-Rounder",   rating:90, basePrice:16, overseas:true },
    { name:"Jofra Archer",       role:"Bowler",        rating:88, basePrice:16, overseas:true },
    { name:"Adil Rashid",        role:"Bowler",        rating:82, basePrice:10, overseas:true },
    { name:"Jason Holder",       role:"All-Rounder",   rating:82, basePrice:8,  overseas:true },
    { name:"Kemar Roach",        role:"Bowler",        rating:78, basePrice:6,  overseas:true },
    { name:"Alzarri Joseph",     role:"Bowler",        rating:80, basePrice:9,  overseas:true },
    { name:"Reeza Hendricks",    role:"Batter",        rating:79, basePrice:8,  overseas:true },
    { name:"Rassie van der Dussen",role:"Batter",      rating:82, basePrice:10, overseas:true },
    { name:"Marco Jansen",       role:"All-Rounder",   rating:82, basePrice:13, overseas:true },
    { name:"Corbin Bosch",       role:"All-Rounder",   rating:78, basePrice:7,  overseas:true },
    { name:"Mujeeb Ur Rahman",   role:"Bowler",        rating:82, basePrice:10, overseas:true },
    { name:"Naveen ul Haq",      role:"Bowler",        rating:79, basePrice:8,  overseas:true },
    { name:"Azmatullah Omarzai", role:"All-Rounder",   rating:79, basePrice:8,  overseas:true },
    { name:"Fazalhaq Farooqi",   role:"Bowler",        rating:84, basePrice:12, overseas:true },
    { name:"Ibrahim Zadran",     role:"Batter",        rating:80, basePrice:9,  overseas:true },
    { name:"Will Jacks",         role:"All-Rounder",   rating:80, basePrice:8,  overseas:true },
    { name:"Tom Latham",         role:"Wicket-Keeper", rating:82, basePrice:10, overseas:true },
    { name:"Devon Conway",       role:"Wicket-Keeper", rating:85, basePrice:12, overseas:true },
    { name:"Rachin Ravindra",    role:"All-Rounder",   rating:83, basePrice:14, overseas:true },
    { name:"James Neesham",      role:"All-Rounder",   rating:78, basePrice:8,  overseas:true },
    { name:"Corey Anderson",     role:"All-Rounder",   rating:76, basePrice:6,  overseas:true },
    { name:"Anton Devcich",      role:"All-Rounder",   rating:74, basePrice:5,  overseas:true },
  ];

  /* ─── Build full list ─── */
  let counter = 1;

  function makeDomestic(nameList, role, ratingBase, priceBase) {
    return nameList.map(name => ({
      id: `d-${counter++}`,
      name,
      role,
      rating: ratingBase + (counter % 15),
      basePrice: priceBase + (counter % 6),
      overseas: false,
    }));
  }

  let players = seed.map((p, i) => ({ id: `s-${i + 1}`, ...p }));

  players = players.concat(
    makeDomestic(domesticBatters,      "Batter",        65, 5),
    makeDomestic(domesticBowlers,      "Bowler",        64, 5),
    makeDomestic(domesticAllRounders,  "All-Rounder",   64, 5),
    makeDomestic(domesticWK,          "Wicket-Keeper", 62, 5),
    overseasExtras.map((p, i) => ({ id: `o-${i + 1}`, ...p })),
  );

  /* ─── Pad to 450 with generic prospects ─── */
  const generatedRoles = ["Batter","Bowler","All-Rounder","Wicket-Keeper"];
  let gCounter = 1;
  while (players.length < 450) {
    const role = generatedRoles[gCounter % generatedRoles.length];
    players.push({
      id:        `gen-${gCounter}`,
      name:      `${role} Prospect #${gCounter}`,
      role,
      rating:    50 + (gCounter % 32),
      basePrice: 2 + (gCounter % 6),
      overseas:  false,
    });
    gCounter++;
  }

  return players;
}

/* ── Fisher-Yates shuffle ── */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRandomizedAuctionOrder(players, previousSignature = "") {
  const cloned = players.map((p) => ({ ...p }));
  const buckets = new Map();

  for (const p of cloned) {
    const key = Number.isFinite(p.setOrder)
      ? `set-${p.setOrder}`
      : `group-${p.auctionSet || "Open"}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(p);
  }

  function randomizeOnce() {
    // Fallback: if no usable set metadata, fully shuffle with slight marquee opening flavor.
    if (buckets.size <= 1) {
      const marquee = shuffle(cloned.filter((p) => Boolean(p.marquee) || p.rating >= 85));
      const rest = shuffle(cloned.filter((p) => !(Boolean(p.marquee) || p.rating >= 85)));
      const openingSize = Math.min(marquee.length, 8 + Math.floor(Math.random() * 8));
      return [...marquee.slice(0, openingSize), ...shuffle([...marquee.slice(openingSize), ...rest])];
    }

    const pool = shuffle(Array.from(buckets.values()).map((group) => shuffle(group)));
    const mixed = [];

    // Draw from a random bunch of sets each round so lot flow changes every auction.
    while (true) {
      const available = pool.filter((group) => group.length > 0);
      if (!available.length) break;

      const bunchSize = Math.min(available.length, 2 + Math.floor(Math.random() * 3));
      const chosen = shuffle(available).slice(0, bunchSize);
      for (const group of chosen) {
        const player = group.pop();
        if (player) mixed.push(player);
      }
    }

    return mixed;
  }

  // Retry a few times so first lots do not repeat previous auction signature.
  let attempt = 0;
  while (attempt < 5) {
    const ordered = randomizeOnce();
    const signature = ordered.slice(0, 25).map((p) => p.id).join("|");
    if (!previousSignature || signature !== previousSignature || attempt === 4) {
      return { ordered, signature };
    }
    attempt += 1;
  }

  const fallback = randomizeOnce();
  return {
    ordered: fallback,
    signature: fallback.slice(0, 25).map((p) => p.id).join("|"),
  };
}

/* ══════════════════════════════════════════════════
   ROOM HELPERS
══════════════════════════════════════════════════ */
const rooms = new Map();

function createRoomCode() {
  const alpha = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += alpha[Math.floor(Math.random() * alpha.length)];
  return code;
}

function buildInitialTeams() {
  return TEAM_NAMES.map((name, i) => ({
    id:            `team-${i + 1}`,
    name,
    purse:         PURSE_PER_TEAM,
    ownerName:     "Vacant",
    ownerSocketId: null,
    squad:         [],
  }));
}

function getPublicState(room) {
  const soldPlayers = room.players
    .filter((p) => p.sold)
    .map((p) => ({ id: p.id, name: p.name, role: p.role, soldPrice: p.soldPrice, soldTo: p.soldTo }));

  const unsoldPlayers = room.players
    .filter((p) => p.unsold)
    .map((p) => ({ id: p.id, name: p.name, role: p.role, basePrice: p.basePrice }));

  const upcomingPlayers = [];
  for (let i = room.lotIndex; i < room.players.length && upcomingPlayers.length < 20; i += 1) {
    const p = room.players[i];
    if (!p.sold && !p.unsold) {
      upcomingPlayers.push({ id: p.id, name: p.name, role: p.role, basePrice: p.basePrice, overseas: p.overseas });
    }
  }

  return {
    roomId:           room.roomId,
    status:           room.status,
    hostSocketId:     room.hostSocketId,
    hostControls:     room.hostControls !== undefined ? Boolean(room.hostControls) : true,
    hostName:         room.hostName,
    teams:            room.teams,
    logs:             room.logs,
    currentLot:       room.currentLot,
    currentBid:       room.currentBid,
    lotIndex:         room.lotIndex,
    totalLots:        room.players.length,
    rankings:         room.rankings,
    submissionsCount: Object.keys(room.playing11Submissions).length,
    timerDuration:    room.timerDuration,
    isPaused:         room.isPaused,
    soldPlayers,
    unsoldPlayers,
    upcomingPlayers,
  };
}

function pushLog(room, message) {
  room.logs.push({ time: new Date().toISOString(), message });
  if (room.logs.length > 120) room.logs.shift();
}

function broadcastState(room) {
  io.to(room.roomId).emit("room_state", getPublicState(room));
}

function findNextLot(room) {
  stopTimer(room);
  // Reset skip votes for the new lot
  room.skipVotes = new Set();
  room.skipVoteLotId = null;
  while (room.lotIndex < room.players.length) {
    const candidate = room.players[room.lotIndex];
    room.lotIndex++;
    if (!candidate.sold && !candidate.unsold) {
      room.currentLot = candidate;
      room.currentBid = null;
      // Auto-start timer for every new lot
      if (!room.isPaused) startTimer(room);
      return;
    }
  }
  room.currentLot = null;
  room.currentBid = null;
  room.status     = "ended";
  room.isPaused   = false;
  pushLog(room, "Auction ended! Teams can now submit their Playing XI.");
}

function endAuction(room, reason = "Auction ended by host.") {
  stopTimer(room);
  room.status = "ended";
  room.isPaused = false;
  room.currentLot = null;
  room.currentBid = null;
  pushLog(room, reason);
  pushLog(room, "Playing XI phase is now open for all team owners.");
  broadcastState(room);
}

/* ── Timer Mechanics ── */
function stopTimer(room) {
  if (room.timerInterval) {
    clearInterval(room.timerInterval);
    room.timerInterval = null;
  }
  room.timerLeft = 0;
  io.to(room.roomId).emit("timer_tick", { timeLeft: 0 });
}

function startTimer(room) {
  if (room.isPaused || room.status !== "live" || !room.currentLot) {
    return;
  }
  stopTimer(room);
  room.timerLeft = room.timerDuration;
  io.to(room.roomId).emit("timer_tick", { timeLeft: room.timerLeft });
  
  room.timerInterval = setInterval(() => {
    room.timerLeft--;
    io.to(room.roomId).emit("timer_tick", { timeLeft: room.timerLeft });
    
    if (room.timerLeft <= 0) {
      stopTimer(room);
      pushLog(room, "⏰ Time's up!");
      finalizeLot(room, room.currentBid ? "sold" : "unsold");
    }
  }, 1000);
}

/* ── Auto-finalize Logic ── */
function finalizeLot(room, action) {
  const lot = room.currentLot;
  if (!lot) return;

  if (action === "sold" && room.currentBid) {
    const winner = room.teams.find(t => t.id === room.currentBid.teamId);
    if (winner) {
      winner.purse -= room.currentBid.amount;
      winner.squad.push({ ...lot, soldPrice: room.currentBid.amount });
      lot.sold     = true;
      lot.soldTo   = winner.id;
      lot.soldPrice = room.currentBid.amount;
      pushLog(room, `🎉 ${lot.name} SOLD to ${winner.name} for ₹${room.currentBid.amount} Cr!`);

      // Emit sold celebration event
      io.to(room.roomId).emit("lot_result", {
        type: "sold",
        playerName: lot.name,
        playerRole: lot.role,
        amount: room.currentBid.amount,
        teamId: winner.id,
        teamName: winner.name,
        ownerName: winner.ownerName,
      });
    } else {
      lot.unsold = true;
      pushLog(room, `❌ ${lot.name} went UNSOLD (winner not found).`);
      io.to(room.roomId).emit("lot_result", { type: "unsold", playerName: lot.name, playerRole: lot.role });
    }
  } else {
    lot.unsold = true;
    pushLog(room, `❌ ${lot.name} went UNSOLD.`);
    io.to(room.roomId).emit("lot_result", { type: "unsold", playerName: lot.name, playerRole: lot.role });
  }

  findNextLot(room);
  broadcastState(room);
}

/* ── Real IPL Bid Increment Calculation ── */
function getMinimumNextBid(currentAmount, basePrice) {
  if (!currentAmount) return basePrice;
  const num = currentAmount;
  let increment = 0.05; // default 5 Lakhs
  
  if (num < 1.0) increment = 0.05;
  else if (num < 2.0) increment = 0.10;
  else if (num < 5.0) increment = 0.20;
  else if (num < 10.0) increment = 0.25;
  else increment = 0.50;

  // JS floating point correction
  return Math.round((currentAmount + increment) * 100) / 100;
}

/* ══════════════════════════════════════════════════
   PLAYING XI ANALYSIS
══════════════════════════════════════════════════ */
function analyzePlaying11(xiPlayers, impactPlayer = null) {
  const roles = { batter: 0, bowler: 0, allRounder: 0, wicketKeeper: 0 };
  let overseas = 0, ratingTotal = 0;

  xiPlayers.forEach(p => {
    ratingTotal += p.rating;
    if (p.overseas) overseas++;
    const r = (p.role || "").toLowerCase();
    if (r.includes("bat"))                              roles.batter++;
    else if (r.includes("bowl"))                        roles.bowler++;
    else if (r.includes("all"))                         roles.allRounder++;
    else if (r.includes("keep") || r.includes("wk"))   roles.wicketKeeper++;
  });

  const rolePenalty =
    Math.abs(roles.batter       - 5) * 8 +
    Math.abs(roles.bowler       - 4) * 8 +
    Math.abs(roles.allRounder   - 2) * 6 +
    (roles.wicketKeeper >= 1 ? 0 : 25) +
    Math.max(0, overseas - 4) * 20;

  const qualityBonus = Math.max(0, ratingTotal - 760) * 0.15;
  const impactBonusRaw = impactPlayer ? Number(impactPlayer.rating || 0) * 0.12 : 0;
  const impactBonus = Number(Math.min(14, impactBonusRaw).toFixed(2));
  const finalScore   = Number((ratingTotal - rolePenalty + qualityBonus + impactBonus).toFixed(2));

  return {
    ratingTotal,
    rolePenalty,
    qualityBonus: Number(qualityBonus.toFixed(2)),
    impactBonus,
    roles,
    overseas,
    finalScore,
  };
}

function buildTeamInsights(analysis) {
  const strengths = [];
  const weaknesses = [];
  const recommendations = [];

  if (analysis.roles.batter >= 4 && analysis.roles.batter <= 6) strengths.push("Good batting depth for most match situations.");
  else weaknesses.push(`Batting balance is off (${analysis.roles.batter}); ideal is around 5.`);

  if (analysis.roles.bowler >= 3 && analysis.roles.bowler <= 5) strengths.push("Bowling unit has reasonable coverage across overs.");
  else weaknesses.push(`Bowling composition is unbalanced (${analysis.roles.bowler}); ideal is around 4.`);

  if (analysis.roles.allRounder >= 1 && analysis.roles.allRounder <= 3) strengths.push("All-rounders provide flexibility in game situations.");
  else weaknesses.push(`All-rounder count (${analysis.roles.allRounder}) limits tactical flexibility.`);

  if (analysis.roles.wicketKeeper >= 1) strengths.push("Wicket-keeper slot is properly covered.");
  else weaknesses.push("No wicket-keeper selected in XI.");

  if (analysis.overseas <= 4) strengths.push("Overseas combination is within IPL limit.");
  else weaknesses.push(`Overseas count is above limit (${analysis.overseas}/4).`);

  if (analysis.ratingTotal >= 860) strengths.push("High aggregate quality based on player ratings.");
  else if (analysis.ratingTotal < 780) weaknesses.push("Overall XI quality is below top-tier benchmark.");

  if (analysis.roles.batter < 4) recommendations.push("Add one specialist batter to stabilize innings structure.");
  if (analysis.roles.bowler < 3) recommendations.push("Add at least one front-line bowler for death and middle overs.");
  if (analysis.roles.wicketKeeper < 1) recommendations.push("Include a specialist wicket-keeper to avoid structural penalty.");
  if (analysis.overseas > 4) recommendations.push("Replace one overseas player with an Indian option to satisfy constraints.");
  if (analysis.ratingTotal < 800) recommendations.push("Prioritize higher-rated impact players for key batting/bowling roles.");

  if (!recommendations.length) recommendations.push("Squad structure is solid; focus on matchup-specific tactical swaps.");

  return { strengths, weaknesses, recommendations };
}

function getOwnedTeamIds(room) {
  return room.teams.filter((t) => Boolean(t.ownerSocketId)).map((t) => t.id);
}

function evaluateRankings(room) {
  const ownedTeamIds = getOwnedTeamIds(room);
  const rankings = room.teams
    .filter((team) => ownedTeamIds.includes(team.id))
    .map(team => {
    const submission = room.playing11Submissions[team.id];
    const selectedIds = Array.isArray(submission)
      ? submission
      : submission?.playerIds;
    const impactPlayerId = Array.isArray(submission)
      ? null
      : submission?.impactPlayerId || null;
    const sorted = [...team.squad].sort((a, b) => b.rating - a.rating);
    let resolvedXI = selectedIds;
    if (!resolvedXI || resolvedXI.length !== 11) {
      resolvedXI = sorted.slice(0, 11).map(p => p.id);
    }
    const xi = resolvedXI.map(id => team.squad.find(p => p.id === id)).filter(Boolean).slice(0, 11);
    const impactPlayer = impactPlayerId
      ? team.squad.find((p) => p.id === impactPlayerId) || null
      : null;
    const analysis = analyzePlaying11(xi, impactPlayer);
    const insights = buildTeamInsights(analysis);
    return {
      teamId: team.id,
      teamName: team.name,
      ownerName: team.ownerName,
      xi,
      impactPlayer,
      analysis,
      insights,
    };
  });

  rankings.sort((a, b) => b.analysis.finalScore - a.analysis.finalScore);
  rankings.forEach((e, i) => {
    e.rank = i + 1;
    const next = rankings[i + 1];
    const margin = next ? Number((e.analysis.finalScore - next.analysis.finalScore).toFixed(2)) : null;
    const topStrength = e.insights?.strengths?.[0] || "Balanced XI composition";
    const topWeakness = e.insights?.weaknesses?.[0] || "No major structural weakness";
    e.rankReason = margin === null
      ? `Position ${e.rank}: ${topStrength}. Watchout: ${topWeakness}.`
      : `Position ${e.rank}: ${topStrength}. Margin to next team: ${margin}. Watchout: ${topWeakness}.`;
  });
  room.rankings = rankings;
}

/* ══════════════════════════════════════════════════
   GEMINI AI — /api/analyze-xi
══════════════════════════════════════════════════ */
function callGemini(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 600 },
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const parsed = new URL(url);

    const options = {
      hostname: parsed.hostname,
      path:     parsed.pathname + parsed.search,
      method:   "POST",
      headers:  { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
    };

    const req = https.request(options, res => {
      let data = "";
      res.on("data", chunk => { data += chunk; });
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          resolve(text);
        } catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function ruleBasedAnalysis(teamName, players, impactPlayer = null) {
  const a   = analyzePlaying11(players, impactPlayer);
  let grade = a.finalScore > 870 ? "Elite" : a.finalScore > 820 ? "Strong" : a.finalScore > 770 ? "Balanced" : "Developing";
  const lines = [
    `⚡ Team "${teamName}" — ${grade} XI`,
    ``,
    `📊 Rating Total: ${a.ratingTotal} | Role Penalty: ${a.rolePenalty} | Quality Bonus: ${a.qualityBonus} | Impact Bonus: ${a.impactBonus}`,
    `Final Score: ${a.finalScore}`,
    ``,
    `🏏 Composition: ${a.roles.batter} Batters · ${a.roles.bowler} Bowlers · ${a.roles.allRounder} All-Rounders · ${a.roles.wicketKeeper} Wicket-Keepers`,
    `🌍 Overseas: ${a.overseas}/4`,
    impactPlayer ? `🎯 Impact Player: ${impactPlayer.name} (${impactPlayer.role})` : `🎯 Impact Player: Not selected`,
    ``,
    a.roles.wicketKeeper === 0 ? "⚠️  No wicket-keeper — significant penalty applied." : "✅ Wicket-keeper present.",
    a.overseas > 4 ? "❌ Too many overseas players — exceeds the limit of 4." : "✅ Overseas compliant.",
    a.roles.batter < 4 ? "⚠️  Batting depth is thin — consider more batters." : "",
    a.roles.bowler < 3 ? "⚠️  Bowling attack looks thin — consider more bowlers." : "",
    ``,
    `💡 Tip: ${grade === "Elite" ? "Excellent squad balance. Keep it up!" : "Focus on improving the weakest role category to boost your score."}`
  ].filter(l => l !== undefined).join("\n");

  return { commentary: lines, score: a.finalScore, grades: [grade, `${a.roles.bowler} Bowlers`, `${a.overseas} Overseas`] };
}

app.post("/api/analyze-xi", async (req, res) => {
  const { teamId, teamName, players, impactPlayer } = req.body;

  if (!Array.isArray(players) || players.length !== 11) {
    return res.status(400).json({ error: "Provide exactly 11 players." });
  }

  const analysis = analyzePlaying11(players, impactPlayer || null);

  // Fallback if no API key
  if (!GEMINI_API_KEY) {
    const result = ruleBasedAnalysis(teamName, players, impactPlayer || null);
    return res.json({ ...result, analysis });
  }

  const roster = players.map((p, i) =>
    `${i + 1}. ${p.name} (${p.role}, Rating: ${p.rating}, ${p.overseas ? "Overseas 🌍" : "Indian 🇮🇳"}, Bought at ₹${p.soldPrice} Cr, Base ₹${p.basePrice} Cr)`
  ).join("\n");

  const prompt = `You are an expert IPL cricket analyst and commentator. Analyse the following Playing XI for the team "${teamName}" in an IPL auction context.

Playing XI:
${roster}

Key Stats:
- Total Rating: ${analysis.ratingTotal}
- Role Composition: ${analysis.roles.batter} Batters, ${analysis.roles.bowler} Bowlers, ${analysis.roles.allRounder} All-Rounders, ${analysis.roles.wicketKeeper} Wicket-Keepers
- Overseas Players in XI: ${analysis.overseas}/4
- Role Balance Penalty: ${analysis.rolePenalty}
- Quality Bonus: ${analysis.qualityBonus}
- Impact Bonus: ${analysis.impactBonus}
- Final Score: ${analysis.finalScore}
- Impact Player: ${impactPlayer ? `${impactPlayer.name} (${impactPlayer.role})` : "Not selected"}

Write a detailed, engaging, 4-6 sentence analysis covering:
1. Overall team balance and strengths
2. Any weaknesses or areas of concern
3. Key performers and match-winners
4. How this XI compares to an ideal IPL team
5. A fun, punchy conclusion verdict

Be specific, enthusiastic, and use cricket terminology. Keep it under 200 words.`;

  try {
    const commentary = await callGemini(prompt);
    const grade      = analysis.finalScore > 870 ? "Elite 🔥" : analysis.finalScore > 820 ? "Strong 💪" : analysis.finalScore > 770 ? "Balanced ⚖️" : "Developing 📈";
    return res.json({
      commentary,
      score:   analysis.finalScore,
      grades:  [grade, `${analysis.roles.bowler} Bowlers`, `${analysis.overseas} Overseas`],
      analysis,
    });
  } catch (err) {
    console.error("Gemini error:", err.message);
    const result = ruleBasedAnalysis(teamName, players, impactPlayer || null);
    return res.json({ ...result, analysis });
  }
});

app.post("/api/analyze-rankings", async (req, res) => {
  const { rankings } = req.body;
  if (!Array.isArray(rankings) || rankings.length === 0) {
    return res.status(400).json({ error: "Rankings data is required." });
  }

  const top = rankings[0];
  if (!GEMINI_API_KEY) {
    return res.json({
      bestTeam: top.teamName,
      summary: `${top.teamName} is currently the best team based on XI score (${top.analysis.finalScore}). It shows strong composition and balance against the role model constraints.`
    });
  }

  const rankText = rankings
    .slice(0, 5)
    .map((r, idx) => `${idx + 1}. ${r.teamName} - Score ${r.analysis.finalScore} | Bat ${r.analysis.roles.batter}, Bowl ${r.analysis.roles.bowler}, AR ${r.analysis.roles.allRounder}, WK ${r.analysis.roles.wicketKeeper}, Overseas ${r.analysis.overseas}`)
    .join("\n");

  const prompt = `You are an IPL strategy analyst. Given these ranked teams from an auction simulation, identify the best overall team and explain why in 4 concise points.\n\n${rankText}\n\nReturn plain text only.`;

  try {
    const summary = await callGemini(prompt);
    return res.json({ bestTeam: top.teamName, summary });
  } catch (err) {
    return res.json({
      bestTeam: top.teamName,
      summary: `${top.teamName} is currently the best team based on XI score (${top.analysis.finalScore}). It shows strong composition and balance against the role model constraints.`
    });
  }
});

/* ══════════════════════════════════════════════════
   SHARE ENDPOINT — generates share URLs
══════════════════════════════════════════════════ */
app.get("/api/share/:roomId", (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId.toUpperCase());
  if (!room) return res.status(404).json({ error: "Room not found" });

  const link = `${req.protocol}://${req.get("host")}?room=${roomId}`;
  const text = encodeURIComponent(`🏏 Join my IPL Auction! Room: ${roomId}\nEach team has ₹120 Cr. 10 teams, 450 players!`);
  const url  = encodeURIComponent(link);

  res.json({
    link,
    whatsapp:  `https://wa.me/?text=${text}%20${url}`,
    telegram:  `https://t.me/share/url?url=${url}&text=${text}`,
    twitter:   `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
    email:     `mailto:?subject=Join%20IPL%20Auction&body=${text}%20${url}`,
  });
});

/* ══════════════════════════════════════════════════
   SOCKET.IO
══════════════════════════════════════════════════ */
function getParticipantRoom(socket) {
  if (!socket.data.roomId) return null;
  return rooms.get(socket.data.roomId) || null;
}
function assertHost(socket, room) {
  return room.hostSocketId === socket.id;
}

io.on("connection", socket => {

  /* ── create_room ── */
  socket.on("create_room", ({ hostName, preferredTeamId, hostControls = true } = {}) => {
    let roomId = createRoomCode();
    while (rooms.has(roomId)) roomId = createRoomCode();

    const room = {
      roomId,
      status:         "lobby",
      hostSocketId:   hostControls ? socket.id : null,
      hostName:       (hostName || "Host").trim(),
      hostControls:   Boolean(hostControls),
      teams:          buildInitialTeams(),
      players:        BASE_PLAYERS.map(p => ({ ...p })), // clone; shuffle at start
      lotIndex:       0,
      currentLot:     null,
      currentBid:     null,
      logs:           [],
      participants:   {},
      playing11Submissions: {},
      rankings:       null,
      timerDuration:  10,
      timerLeft:      0,
      timerInterval:  null,
      isPaused:       false,
      lastAuctionSignature: "",
    };

    // Host can also own a team — if they own a team, register them
    // as a `team-owner` in participants so their capabilities match joiners.
    let hostTeamId = null;
    let role = hostControls ? "host" : "team-owner"; // if hostControls disabled, creator acts as a normal team-owner when owning a team
    const chosenTeam = preferredTeamId
      ? room.teams.find(t => t.id === preferredTeamId)
      : room.teams[0];
    if (chosenTeam) {
      chosenTeam.ownerSocketId = socket.id;
      chosenTeam.ownerName     = (hostName || "Host").trim();
      hostTeamId = chosenTeam.id;
      role = "team-owner"; // creator owning a team becomes team-owner
    }

    // If hostControls is false and creator does not own a team, they are a spectator (no host privileges)
    if (!hostControls && !hostTeamId) role = "spectator";

    room.participants[socket.id] = { name: room.hostName, role, teamId: hostTeamId };

    rooms.set(roomId, room);
    socket.join(roomId);
    socket.data.roomId = roomId;

    const teamMsg = hostTeamId ? ` (also owning team ${room.teams.find(t=>t.id===hostTeamId)?.name})` : " as Host only";
    pushLog(room, `${room.hostName} created the room${teamMsg}. Waiting for other teams…`);

    const shareLink = `${APP_URL}?room=${roomId}`;
    socket.emit("room_joined", { roomId, role, teamId: hostTeamId, shareLink });

    // If hostControls is disabled, start the auction automatically so everyone
    // can bid without host start/pause/end controls.
    if (!room.hostControls) {
      const randomized = buildRandomizedAuctionOrder(BASE_PLAYERS, room.lastAuctionSignature);
      room.players = randomized.ordered;
      room.lastAuctionSignature = randomized.signature || "";
      room.status = "live";
      room.lotIndex = 0;
      room.rankings = null;
      room.playing11Submissions = {};
      room.isPaused = false;
      pushLog(room, `Auto-started auction (host controls disabled). Players loaded: ${room.players.length}. Timer: ${room.timerDuration}s.`);
      findNextLot(room);
    }

    broadcastState(room);
  });

  /* ── join_room ── */
  socket.on("join_room", ({ roomId, participantName, preferredTeamId }) => {
    const room = rooms.get((roomId || "").trim().toUpperCase());
    if (!room) { socket.emit("join_error", "Room not found. Check the code."); return; }

    const cleanedName = (participantName || "Participant").trim();

    // Try to assign preferred team first, then any available
    let chosenTeam = null;
    if (preferredTeamId) {
      const preferred = room.teams.find(t => t.id === preferredTeamId);
      if (!preferred) {
        socket.emit("join_error", "Selected team is invalid.");
        return;
      }
      if (preferred.ownerSocketId) {
        socket.emit("join_error", `${preferred.name} is already taken. Please choose another team.`);
        return;
      }
      chosenTeam = preferred;
    }
    if (!chosenTeam) {
      chosenTeam = room.teams.find(t => !t.ownerSocketId);
    }

    let role   = "spectator";
    let teamId = null;

    if (chosenTeam) {
      role   = "team-owner";
      teamId = chosenTeam.id;
      chosenTeam.ownerSocketId = socket.id;
      chosenTeam.ownerName     = cleanedName;
    }

    room.participants[socket.id] = { name: cleanedName, role, teamId };

    socket.join(room.roomId);
    socket.data.roomId = room.roomId;

    pushLog(room,
      role === "team-owner"
        ? `${cleanedName} joined as owner of ${chosenTeam.name}.`
        : `${cleanedName} joined as spectator (all 10 teams are filled).`
    );

    const shareLink = `${APP_URL}?room=${room.roomId}`;
    socket.emit("room_joined", { roomId: room.roomId, role, teamId, shareLink });
    broadcastState(room);
  });

  /* ── start_auction ── */
  socket.on("start_auction", ({ timerDuration } = {}) => {
    const room = getParticipantRoom(socket);
    if (!room || !assertHost(socket, room) || room.status !== "lobby") return;

    const parsedTimer = Number(timerDuration);
    if (Number.isFinite(parsedTimer) && parsedTimer >= 5 && parsedTimer <= 120) {
      room.timerDuration = Math.floor(parsedTimer);
    }

    const randomized = buildRandomizedAuctionOrder(BASE_PLAYERS, room.lastAuctionSignature);
    room.players = randomized.ordered;
    room.lastAuctionSignature = randomized.signature || "";
    room.status   = "live";
    room.lotIndex = 0;
    room.rankings = null;
    room.playing11Submissions = {};
    room.isPaused = false;

    pushLog(room, `Auction started! ${room.players.length} players loaded in randomized mixed-set order. Timer: ${room.timerDuration}s.`);
    findNextLot(room);
    broadcastState(room);
  });

  /* ── place_bid ── */
  socket.on("place_bid", ({ amount }) => {
    const room = getParticipantRoom(socket);
    if (!room || room.status !== "live" || !room.currentLot) return;
    if (room.isPaused) {
      socket.emit("bid_error", "Auction is paused. Wait for host to resume.");
      return;
    }

    const participant = room.participants[socket.id];
    // Allow bidding for both team-owner role AND host if they own a team
    if (!participant || !participant.teamId) return;

    const team = room.teams.find(t => t.id === participant.teamId);
    if (!team) return;

    if (room.currentBid && room.currentBid.teamId === team.id) {
      socket.emit("bid_error", "You are already the highest bidder. Wait for another team to counter bid.");
      return;
    }

    const bidAmount = parseFloat(amount);
    const minimum   = room.currentBid
      ? getMinimumNextBid(room.currentBid.amount, room.currentLot.basePrice)
      : room.currentLot.basePrice;

    if (!Number.isFinite(bidAmount) || bidAmount < minimum) {
      socket.emit("bid_error", `Minimum bid is ₹${minimum} Cr.`); return;
    }
    if (bidAmount > team.purse) {
      socket.emit("bid_error", `Bid exceeds your purse (₹${team.purse} Cr remaining).`); return;
    }

    if (room.currentLot.overseas) {
      const overseasInSquad = team.squad.filter((p) => p.overseas).length;
      if (overseasInSquad >= 8) {
        socket.emit("bid_error", "You already have 8 overseas players. Max allowed per squad is 8.");
        return;
      }
    }

    room.currentBid = {
      teamId:    team.id,
      teamName:  team.name,
      ownerName: team.ownerName,
      amount:    bidAmount,
    };

    pushLog(room, `${team.ownerName} (${team.name}) bid ₹${bidAmount} Cr for ${room.currentLot.name}.`);
    
    // Always restart timer on a valid bid (reset to full duration)
    startTimer(room);

    broadcastState(room);
  });

  /* ── Timer Host Controls ── */
  socket.on("set_timer_duration", ({ duration }) => {
    const room = getParticipantRoom(socket);
    if (!room || !assertHost(socket, room)) return;
    const parsed = Number(duration);
    if (!Number.isFinite(parsed) || parsed < 5 || parsed > 120) {
      socket.emit("join_error", "Timer must be between 5 and 120 seconds.");
      return;
    }
    room.timerDuration = Math.floor(parsed);
    pushLog(room, `Timer interval set to ${room.timerDuration}s.`);

    // If timer is already running for a lot, immediately restart with new duration.
    if (room.status === "live" && room.currentLot && room.timerInterval && !room.isPaused) {
      startTimer(room);
      pushLog(room, `Running timer restarted with ${room.timerDuration}s.`);
    }

    broadcastState(room);
  });

  socket.on("pause_auction", ({ paused } = {}) => {
    const room = getParticipantRoom(socket);
    if (!room || !assertHost(socket, room) || room.status !== "live") return;
    const nextPaused = typeof paused === "boolean" ? paused : !room.isPaused;
    if (nextPaused === room.isPaused) return;

    room.isPaused = nextPaused;
    if (room.isPaused) {
      pushLog(room, "Auction paused by host.");
      stopTimer(room);
    } else {
      pushLog(room, `Auction resumed. Timer running (${room.timerDuration}s).`);
      startTimer(room);
    }

    broadcastState(room);
  });

  socket.on("end_auction", () => {
    const room = getParticipantRoom(socket);
    if (!room || !assertHost(socket, room)) return;
    if (room.status !== "live") return;
    endAuction(room, "Auction ended by host.");
  });

  /* ── finalize_lot ── */
  socket.on("finalize_lot", ({ action }) => {
    const room = getParticipantRoom(socket);
    if (!room || !assertHost(socket, room) || room.status !== "live" || !room.currentLot) return;
    stopTimer(room);
    finalizeLot(room, action);
  });

  /* ── skip_player ── */
  socket.on("skip_player", () => {
    const room = getParticipantRoom(socket);
    if (!room || room.status !== "live" || !room.currentLot) return;

    const participant = room.participants[socket.id];
    if (!participant || !participant.teamId) return; // only team owners (incl. host with team) can vote

    const lotId = room.currentLot.id;

    // Init skip votes for this lot
    if (!room.skipVotes || room.skipVoteLotId !== lotId) {
      room.skipVotes = new Set();
      room.skipVoteLotId = lotId;
    }

    room.skipVotes.add(socket.id);

    // Count active team owners (connected participants with a teamId)
    const activeOwners = Object.values(room.participants).filter(p => p.teamId).length;
    const voteCount = room.skipVotes.size;

    if (voteCount >= activeOwners) {
      // All voted — skip silently
      room.skipVotes = new Set();
      room.skipVoteLotId = null;
      stopTimer(room);
      room.currentLot.unsold = true;
      findNextLot(room);
      broadcastState(room);
    } else {
      // Broadcast updated vote count so clients can show progress
      broadcastState(room);
      io.to(room.roomId).emit("skip_vote_update", { votes: voteCount, needed: activeOwners });
    }
  });

  /* ── submit_playing11 ── */
  socket.on("submit_playing11", ({ playerIds, impactPlayerId }) => {
    const room = getParticipantRoom(socket);
    if (!room || room.status !== "ended") return;

    const participant = room.participants[socket.id];
    if (!participant || !(participant.role === "team-owner" || (participant.role === "host" && participant.teamId))) return;

    const team      = room.teams.find(t => t.id === participant.teamId);
    if (!team) return;

    const uniqueIds = [...new Set((Array.isArray(playerIds) ? playerIds : []))];
    const validIds  = uniqueIds.filter(id => team.squad.some(p => p.id === id));

    if (validIds.length !== 11) {
      socket.emit("playing11_error", "Select exactly 11 players from your squad."); return;
    }

    // Overseas check
    const xiPlayers   = validIds.map(id => team.squad.find(p => p.id === id));
    const overseasCnt = xiPlayers.filter(p => p?.overseas).length;
    if (overseasCnt > 4) {
      socket.emit("playing11_error", `Max 4 overseas players allowed. You have ${overseasCnt}.`); return;
    }

    let validImpactPlayerId = null;
    if (impactPlayerId) {
      const impactPlayer = team.squad.find((p) => p.id === impactPlayerId);
      if (!impactPlayer) {
        socket.emit("playing11_error", "Selected Impact Player is not in your squad.");
        return;
      }
      if (validIds.includes(impactPlayerId)) {
        socket.emit("playing11_error", "Impact Player must be selected from bench players.");
        return;
      }
      const overseasWithImpact = overseasCnt + (impactPlayer.overseas ? 1 : 0);
      if (overseasWithImpact > 4) {
        socket.emit("playing11_error", `Overseas limit exceeded with Impact Player (${overseasWithImpact}/4).`);
        return;
      }
      validImpactPlayerId = impactPlayerId;
    }

    room.playing11Submissions[team.id] = {
      playerIds: validIds,
      impactPlayerId: validImpactPlayerId,
      submittedAt: Date.now(),
    };
    pushLog(
      room,
      validImpactPlayerId
        ? `${team.name} submitted Playing XI with Impact Player.`
        : `${team.name} submitted their Playing XI.`
    );

    socket.emit("playing11_ok", "✅ Playing XI submitted successfully!");

    const ownedTeamIds = getOwnedTeamIds(room);
    const allSubmitted = ownedTeamIds.length > 0
      && ownedTeamIds.every((teamId) => Boolean(room.playing11Submissions[teamId]));

    if (allSubmitted) {
      evaluateRankings(room);
      pushLog(room, "All active teams submitted — Final Rankings evaluated!");
    }

    broadcastState(room);
  });

  /* ── evaluate_rankings ── */
  socket.on("evaluate_rankings", () => {
    const room = getParticipantRoom(socket);
    if (!room || !assertHost(socket, room) || room.status !== "ended") return;
    evaluateRankings(room);
    pushLog(room, "Host manually evaluated rankings.");
    broadcastState(room);
  });

  /* ── rejoin_room ── */
  socket.on("rejoin_room", ({ roomId, participantName, teamId, role }) => {
    const room = rooms.get((roomId || "").trim().toUpperCase());
    if (!room) { socket.emit("join_error", "Room not found. Session expired or room was closed."); return; }

    const cleanedName = (participantName || "").trim();

    // Restore host session: name must match and host slot must be vacant (disconnected)
    if (role === "host" && room.hostName === cleanedName && !room.hostSocketId) {
      room.hostSocketId = socket.id;
      room.participants[socket.id] = { name: cleanedName, role: "host", teamId: teamId || null };
      socket.join(room.roomId);
      socket.data.roomId = room.roomId;

      // Restore team ownership if host had a team
      if (teamId) {
        const team = room.teams.find(t => t.id === teamId);
        if (team && !team.ownerSocketId) {
          team.ownerSocketId = socket.id;
          team.ownerName = cleanedName;
        }
      }

      pushLog(room, `${cleanedName} (host) reconnected.`);
      const shareLink = `${APP_URL}?room=${room.roomId}`;
      socket.emit("room_joined", { roomId: room.roomId, role: "host", teamId: teamId || null, shareLink });
      broadcastState(room);
      return;
    }

    // Restore team-owner session: match by name + teamId, slot must be vacant
    if (role === "team-owner" && teamId) {
      const team = room.teams.find(t => t.id === teamId);
      if (!team) { socket.emit("join_error", "Team not found."); return; }

      // Allow rejoin if slot is vacant and name matches the stored owner name
      if (team.ownerSocketId && team.ownerSocketId !== socket.id) {
        socket.emit("join_error", `${team.name} is already taken by another player.`);
        return;
      }

      if (team.ownerName && team.ownerName !== cleanedName && team.ownerSocketId) {
        socket.emit("join_error", `${team.name} is already taken.`);
        return;
      }

      team.ownerSocketId = socket.id;
      team.ownerName = cleanedName;
      room.participants[socket.id] = { name: cleanedName, role: "team-owner", teamId };
      socket.join(room.roomId);
      socket.data.roomId = room.roomId;

      pushLog(room, `${cleanedName} reconnected to ${team.name}.`);
      const shareLink = `${APP_URL}?room=${room.roomId}`;
      socket.emit("room_joined", { roomId: room.roomId, role: "team-owner", teamId, shareLink });
      broadcastState(room);
      return;
    }

    // Spectator rejoin
    room.participants[socket.id] = { name: cleanedName, role: "spectator", teamId: null };
    socket.join(room.roomId);
    socket.data.roomId = room.roomId;
    const shareLink = `${APP_URL}?room=${room.roomId}`;
    socket.emit("room_joined", { roomId: room.roomId, role: "spectator", teamId: null, shareLink });
    broadcastState(room);
  });

  /* ── send_message ── */
  socket.on("send_message", ({ message }) => {
    const room = getParticipantRoom(socket);
    if (!room) return;
    
    const participant = room.participants[socket.id];
    if (!participant) return;
    
    const cleanedMessage = String(message || "").trim().slice(0, 100);
    if (!cleanedMessage) return;
    
    io.to(room.roomId).emit("chat_message", {
      sender: participant.name,
      senderRole: participant.role,
      message: cleanedMessage
    });
  });

  /* ── disconnect ── */
  socket.on("disconnect", () => {
    const room = getParticipantRoom(socket);
    if (!room) return;

    const participant = room.participants[socket.id];
    delete room.participants[socket.id];

    if (participant?.role === "team-owner" && participant.teamId) {
      const team = room.teams.find(t => t.id === participant.teamId);
      // Keep ownerName so rejoin can match, but clear socketId
      if (team) { team.ownerSocketId = null; }
      pushLog(room, `${participant.name} disconnected. Waiting for reconnect…`);
    }

    if (socket.id === room.hostSocketId) {
      // Keep hostName so rejoin can match; only reassign if no reconnect
      room.hostSocketId = null;
      // Also clear team ownership if host owned a team
      if (participant?.teamId) {
        const team = room.teams.find(t => t.id === participant.teamId);
        if (team) { team.ownerSocketId = null; }
      }
      pushLog(room, `Host (${room.hostName}) disconnected. Waiting for reconnect…`);
    }

    if (Object.keys(room.participants).length === 0) {
      // Give a grace period before deleting the room so reconnects work
      setTimeout(() => {
        if (rooms.has(room.roomId) && Object.keys(room.participants).length === 0) {
          rooms.delete(room.roomId);
        }
      }, 30000); // 30 second grace period
      return;
    }
    broadcastState(room);
  });
});

server.listen(PORT, () => {
  console.log(`\n🏏  IPL Auction Arena running at http://localhost:${PORT}`);
  if (!GEMINI_API_KEY) {
    console.log(`⚠️   No GEMINI_API_KEY set — AI analysis will use rule-based fallback.`);
    console.log(`    To enable: $env:GEMINI_API_KEY="your_key_here"  (then restart)\n`);
  } else {
    console.log(`✅  Gemini AI analysis enabled.\n`);
  }
});
