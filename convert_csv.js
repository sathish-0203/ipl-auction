const fs = require("fs");
const csv = fs.readFileSync("c:/Users/ps sathish/Downloads/ipl_2026_mega_auction_pool.csv", "utf8");
const lines = csv.trim().split("\n").slice(1); // skip header

// Known overseas players (common international names not from India)
const OVERSEAS_KEYWORDS = [
  "Buttler","Miller","Livingstone","Rashid Khan","Gill","Finch","Markram","Hales",
  "Ross","Fernando","Rajapaksa","King","Pujara","Lynn","Bravo","Warner","Malan",
  "Conway","Brevis","Morgan","Lewis","Du Plessis","Allen","Shahidi","Zazai",
  "Williamson","Labuschagne","Guptill","Powell","Vince","Roy","Smith","Rossouw",
  "Van Der Dussen","Hetmyer","Khawaja","Hamza","Agar","Hosein","Kitchen",
  "Phehlukwayo","Russell","Cutting","Howell","Swanepoel","Brathwaite","Karunaratne",
  "Asalanka","Green","Jordan","De Grandhomme","Munro","Bosch","Overton","Campher",
  "Sams","Gunatilaka","Short","Mitchell","Shanaka","Wiese","Willey","Lakshan",
  "Drakes","Jansen","Wellalage","Pretorius","Bravo","Fabian","Delany","Garton",
  "Coetzee","Maxwell","Naib","Holder","Neesham","Archer","Van Dyk","Smit",
  "Paul","Faulkner","Sangha","Santner","Nabi","Henriques","Stoinis","Adnair",
  "Deyal","Marsh","Ali","Gregory","Mayers","Reifer","Shepherd","Chase",
  "Kuggeleijn","Prasanna","Perera","David","Rogers","Hasaranga","Sundar",
  "Parnell","Cummins","Pollard","Narine","Tare","Fletcher","Mcdermott",
  "Phillips","Bairstow","Philippe","Billings","Pooran","De Kock","Seifert",
  "Wade","Dickwella","Hope","Gurbaz","Rickelton","Lewis","Mendis","Das",
  "Milne","Zampa","Rashid","Dhananjaya","Nortje","Joseph","Hazlewood",
  "Rabada","Richardson","Maharaj","Ferguson","Coulter-Nile","Ellis",
  "Boult","Mills","Shamsi","Southee","Astle","Wood","Shami","Topley",
  "Meredith","Behrendorff","Wagner","Thomas","Mccoy","Cottrell","Abbott",
  "Stanlake","Tickner","Muzarabani","Wheal","Dupavillon","Chameera",
  "Farooqi","Edwards","Walsh","Tahir","Sodhi","Udana","Lintott",
  "Bennett","Kumara","Sealey","Guthrie","Hatcher","Morris","Ngidi",
  "Theekshana","De Lange","Kelly","Pathirana","Trumpelmann","Burger",
  "Islam","Ahmad","Salamkheil","Agar","Mahmood","Lamichhane",
  "Rahul","Kishan","Dhoni","Kohli","Bumrah","Pandya","Yadav",
  "Pant","Iyer","Chahal","Siraj","KL Rahul","Ravi Bishnoi",
  "Varun Chakaravarthy","Umran Malik","Arshdeep","Jadeja","Axar",
  "Thakur","Chahar","Kuldeep Yadav","Natarajan","Krishna"
];

// Determine overseas based on nationality hints
// For simplicity: Indian domestic players are NOT overseas
// Players with clearly non-Indian names are overseas
const KNOWN_INDIAN = new Set([
  "Arshdeep Singh","Rishabh Pant","Shreyas Iyer","Venkatesh Iyer",
  "Mohammed Siraj","Yuzvendra Chahal","Shubman Gill","Hardik Pandya",
  // We'll use a heuristic: if name doesn't match common overseas surnames, treat as Indian
]);

function parseBasePrice(priceStr) {
  const s = priceStr.trim();
  if (s === "Retained" || s === "Draft Pick") return 2; // default base for retained/draft
  
  // "2 Cr" -> 2
  const crMatch = s.match(/^([\d.]+)\s*Cr$/i);
  if (crMatch) return parseFloat(crMatch[1]);
  
  // "20 Lakh" -> 0.20, "50 Lakh" -> 0.50, "75 Lakh" -> 0.75
  const lakhMatch = s.match(/^(\d+)\s*Lakh$/i);
  if (lakhMatch) return parseInt(lakhMatch[1]) / 100;
  
  return 0.20; // default
}

function isOverseas(name) {
  // Common Indian first/last name patterns
  const indianPatterns = [
    /Singh$/i, /Kumar$/i, /Sharma$/i, /Patel$/i, /Yadav$/i, /Mishra$/i,
    /Pandey$/i, /Chauhan$/i, /Reddy$/i, /Nair$/i, /Tiwary$/i, /Raina$/i,
    /Kohli$/i, /Dhawan$/i, /Shaw$/i, /Garg$/i, /Rawat$/i, /Agarwal$/i,
    /Rahane$/i, /Jaiswal$/i, /Pant$/i, /Iyer$/i, /Chahal$/i, /Siraj$/i,
    /Bumrah$/i, /Jadeja$/i, /Dhoni$/i, /Pandya$/i, /Kishan$/i, /Samson$/i,
    /Ashwin$/i, /Axar$/i, /Chahar$/i, /Thakur$/i, /Bishnoi$/i, /Natarajan$/i,
    /Gaikwad$/i, /Padikkal$/i, /Varma$/i, /Dube$/i, /Sundar$/i, /Hooda$/i,
    /Shukla$/i, /Kaul$/i, /Arora$/i, /Brar$/i, /Gill$/i, /Arshdeep$/i,
  ];
  
  // Known overseas surnames
  const overseasPatterns = [
    /Buttler$/i, /Miller$/i, /Livingstone$/i, /Warner$/i, /Smith$/i,
    /Maxwell$/i, /Russell$/i, /Narine$/i, /Pollard$/i, /Bravo$/i,
    /Archer$/i, /Cummins$/i, /Rabada$/i, /Boult$/i, /Hazlewood$/i,
    /Ferguson$/i, /Rashid$/i, /Williamson$/i, /Conway$/i, /Bairstow$/i,
    /Du Plessis$/i, /De Kock$/i, /Pooran$/i, /Holder$/i, /Jordan$/i,
    /Green$/i, /Joseph$/i, /Marsh$/i, /Stoinis$/i, /David$/i,
    /Hasaranga$/i, /Santner$/i, /Ali$/i, /Malan$/i, /Roy$/i,
    /Lewis$/i, /Finch$/i, /Hales$/i, /Brevis$/i, /Morgan$/i,
    /Khan$/i, /Hetmyer$/i, /Powell$/i, /Rossouw$/i, /Shannon$/i,
    /Neesham$/i, /Lynn$/i, /Munro$/i, /Shepherd$/i, /Agar$/i,
    /Zampa$/i, /Tahir$/i, /Nortje$/i, /Wood$/i, /Topley$/i,
    /Thomas$/i, /Cottrell$/i, /Mccoy$/i, /Billings$/i, /Phillips$/i,
    /Seifert$/i, /Wade$/i, /Southee$/i, /Coulter-Nile$/i,
    /Pathirana$/i, /Theekshana$/i, /Shamsi$/i, /Parnell$/i,
    /Pretorius$/i, /Jansen$/i, /Coetzee$/i, /De Lange$/i,
    /Milne$/i, /Ellis$/i, /Behrendorff$/i, /Stanlake$/i,
    /Richardson$/i, /Short$/i, /Mitchell$/i, /Willey$/i,
    /Garton$/i, /Curran$/i, /Overton$/i,
  ];
  
  for (const p of overseasPatterns) if (p.test(name)) return true;
  for (const p of indianPatterns) if (p.test(name)) return false;
  
  // Quick heuristic: retained/well-known names
  const retainedIndian = [
    "Arshdeep Singh","Rishabh Pant","Shreyas Iyer","Venkatesh Iyer",
    "Mohammed Siraj","Yuzvendra Chahal","Shubman Gill","Hardik Pandya",
    "MS Dhoni","Ruturaj Gaikwad","Ravindra Jadeja","Virat Kohli",
    "Rohit Sharma","Suryakumar Yadav","Jasprit Bumrah","Prithvi Shaw",
    "Mayank Agarwal","Yashaswi Jaiswal","Abdul Samad","Axar Patel",
    "Moeen Ali","KL Rahul","Sanju Samson","Ravi Bishnoi",
    "Varun Chakaravarthy","Umran Malik","Anrich Nortje","Andre Russell",
    "Glenn Maxwell","Kieron Pollard","Sunil Narine","Marcus Stoinis",
  ];
  if (retainedIndian.includes(name)) {
    // Some of these are actually overseas
    const overseasRetained = ["Moeen Ali","Anrich Nortje","Andre Russell","Glenn Maxwell","Kieron Pollard","Sunil Narine","Marcus Stoinis"];
    return overseasRetained.includes(name);
  }
  
  // Default: if name has non-Indian feel, mark overseas
  // Simple check: if any overseas keyword substring matches
  for (const kw of OVERSEAS_KEYWORDS) {
    if (name.includes(kw)) return true;
  }
  
  return false; // default to Indian
}

function mapRole(type) {
  switch(type.toUpperCase()) {
    case "BATTER": return "Batter";
    case "BOWLER": return "Bowler";
    case "ALL-ROUNDER": return "All-Rounder";
    case "WICKETKEEPER": return "Wicket-Keeper";
    default: return type;
  }
}

function getSetOrder(set) {
  if (set.includes("M1")) return 0;
  if (set.includes("M2")) return 1;
  if (set.includes("Set 1")) return 2;
  if (set.includes("Set 2")) return 3;
  if (set.includes("Set 3")) return 4;
  if (set.includes("Set 4")) return 5;
  return 6;
}

const players = [];
lines.forEach((line, i) => {
  // Parse CSV carefully (no quoted fields in this data)
  const parts = line.split(",");
  if (parts.length < 4) return;
  
  const auctionSet = parts[0].trim();
  const name = parts[1].trim();
  const type = parts[2].trim();
  const priceStr = parts[3].trim();
  
  if (!name) return;
  
  const basePrice = parseBasePrice(priceStr);
  const overseas = isOverseas(name);
  const role = mapRole(type);
  const setOrder = getSetOrder(auctionSet);
  
  players.push({
    id: `p-${i + 1}`,
    name,
    role,
    basePrice,
    overseas,
    auctionSet,
    setOrder,
  });
});

// Sort: marquee sets first, then by set order
players.sort((a, b) => a.setOrder - b.setOrder);

console.log(`Total players: ${players.length}`);
console.log(`Overseas: ${players.filter(p => p.overseas).length}`);
console.log(`Indian: ${players.filter(p => !p.overseas).length}`);
console.log(`Sets: ${[...new Set(players.map(p => p.auctionSet))].join(", ")}`);

// Write the JSON
fs.writeFileSync(
  "c:/Users/ps sathish/OneDrive/Desktop/auction/players_data.json",
  JSON.stringify(players, null, 2)
);
console.log("Written to players_data.json");
