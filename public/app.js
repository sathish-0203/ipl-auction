/* ══════════════════════════════════════════════════
   IPL AUCTION ARENA — app.js
   ══════════════════════════════════════════════════ */

// Use same-origin in production, but fall back to localhost:3000 for local preview/file modes.
const socketServerUrl = (() => {
  if (window.__SOCKET_URL) return window.__SOCKET_URL;

  const host = window.location.hostname;
  const port = window.location.port;
  const isLocalHost = host === "localhost" || host === "127.0.0.1";
  const isFileProtocol = window.location.protocol === "file:";

  if (isFileProtocol) return "http://localhost:3000";
  if (isLocalHost && port && port !== "3000") return `${window.location.protocol}//${host}:3000`;

  return undefined;
})();

const socket = (typeof io === "function")
  ? io(socketServerUrl, { transports: ["websocket", "polling"] })
  : {
      connected: false,
      emit: () => {},
      on: () => {}
    };

const TEAM_DATA = (typeof IPL_TEAMS !== "undefined" && Array.isArray(IPL_TEAMS) && IPL_TEAMS.length)
  ? IPL_TEAMS
  : [
      { id: "team-1", name: "Chennai Super Kings", short: "CSK", primary: "#F5A623", secondary: "#002E5D", logo: "" },
      { id: "team-2", name: "Mumbai Indians", short: "MI", primary: "#004BA0", secondary: "#D1AB3E", logo: "" },
      { id: "team-3", name: "Royal Challengers Bengaluru", short: "RCB", primary: "#C8102E", secondary: "#1A1A1A", logo: "" },
      { id: "team-4", name: "Kolkata Knight Riders", short: "KKR", primary: "#3A225D", secondary: "#F0C416", logo: "" },
      { id: "team-5", name: "Rajasthan Royals", short: "RR", primary: "#E91E8C", secondary: "#254AA5", logo: "" },
      { id: "team-6", name: "Delhi Capitals", short: "DC", primary: "#0078BC", secondary: "#EF1C25", logo: "" },
      { id: "team-7", name: "Sunrisers Hyderabad", short: "SRH", primary: "#F7A721", secondary: "#E7511B", logo: "" },
      { id: "team-8", name: "Punjab Kings", short: "PBKS", primary: "#ED1B24", secondary: "#A7A9AC", logo: "" },
      { id: "team-9", name: "Lucknow Super Giants", short: "LSG", primary: "#A0CFEC", secondary: "#003F88", logo: "" },
      { id: "team-10", name: "Gujarat Titans", short: "GT", primary: "#1B3A6B", secondary: "#ADB5BD", logo: "" },
    ];

function on(el, eventName, handler) {
  if (el) el.addEventListener(eventName, handler);
}

function buildTeamFallbackDataUri(team, size = 88) {
  const short = ((team?.short || "TM").toUpperCase()).slice(0, 3);
  const primary = team?.primary || "#1f2937";
  const secondary = team?.secondary || "#0f172a";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${primary}"/>
          <stop offset="100%" stop-color="${secondary}"/>
        </linearGradient>
      </defs>
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="url(#g)" stroke="rgba(255,255,255,0.35)" stroke-width="3"/>
      <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-size="${Math.floor(size * 0.28)}" font-weight="800" font-family="Arial, sans-serif" fill="#ffffff">${short}</text>
    </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\n\s*/g, ""))}`;
}

function getSafeTeamLogo(team, size = 88) {
  if (team?.logo) return team.logo;
  return buildTeamFallbackDataUri(team, size);
}

function buildTeamLogoImg(team, className, size = 36, extraAttr = "") {
  const safe = getSafeTeamLogo(team, Math.max(size * 2, 80));
  const fallback = buildTeamFallbackDataUri(team, Math.max(size * 2, 80));
  const cls = className ? ` class="${className}"` : "";
  const alt = (team?.short || team?.name || "Team").replace(/"/g, "&quot;");
  return `<img src="${safe}" alt="${alt}" width="${size}" height="${size}"${cls} ${extraAttr} onerror="this.onerror=null;this.src='${fallback}'" />`;
}

/* ── DOM refs ── */
const els = {
  // Team selector
  teamSelectCard:    document.getElementById("teamSelectCard"),
  teamSelectGrid:    document.getElementById("teamSelectGrid"),
  teamSelectMsg:     document.getElementById("teamSelectMsg"),
  selectedTeamBadge: document.getElementById("selectedTeamBadge"),

  // Join
  joinCard:    document.getElementById("joinCard"),
  nameInput:   document.getElementById("nameInput"),
  roomInput:   document.getElementById("roomInput"),
  createBtn:   document.getElementById("createBtn"),
  joinBtn:     document.getElementById("joinBtn"),
  joinMessage: document.getElementById("joinMessage"),

  // Room
  roomCard:       document.getElementById("roomCard"),
  roomCodeText:   document.getElementById("roomCodeText"),
  identityText:   document.getElementById("identityText"),
  shareLinkInput: document.getElementById("shareLinkInput"),
  copyLinkBtn:    document.getElementById("copyLinkBtn"),
  shareApps:      document.getElementById("shareApps"),
  shareWhatsapp:  document.getElementById("shareWhatsapp"),
  shareTelegram:  document.getElementById("shareTelegram"),
  shareTwitter:   document.getElementById("shareTwitter"),
  shareEmail:     document.getElementById("shareEmail"),

  // Timer
  timerContainer: document.getElementById("timerContainer"),
  timerRingFill:  document.getElementById("timerRingFill"),
  timerText:      document.getElementById("timerText"),

  // Auction & Host Controls
  auctionCard:       document.getElementById("auctionCard"),
  statusText:        document.getElementById("statusText"),
  statusChip:        document.getElementById("statusChip"),
  myPurseText:       document.getElementById("myPurseText"),
  myPurseChip:       document.getElementById("myPurseChip"),
  hostControls:      document.getElementById("hostControls"),
  startAuctionBtn:   document.getElementById("startAuctionBtn"),
  pauseAuctionBtn:   document.getElementById("pauseAuctionBtn"),
  skipPlayerBtn:     document.getElementById("skipPlayerBtn"),
  endAuctionBtn:     document.getElementById("endAuctionBtn"),
  evaluateBtn:       document.getElementById("evaluateBtn"),
  timerSelect:       document.getElementById("timerSelect"),
  
  // Auction Deck buttons
  deckStartBtn:      document.getElementById("deckStartBtn"),
  deckPauseBtn:      document.getElementById("deckPauseBtn"),
  deckSkipBtn:       document.getElementById("deckSkipBtn"),
  deckEndBtn:        document.getElementById("deckEndBtn"),
  deckEvaluateBtn:   document.getElementById("deckEvaluateBtn"),
  deckTimerSelect:   document.getElementById("deckTimerSelect"),
  
  postAuctionActions: document.getElementById("postAuctionActions"),

  // Lot box
  lotBox:           document.getElementById("lotBox"),
  playerName:       document.getElementById("playerName"),
  playerMeta:       document.getElementById("playerMeta"),
  playerBadge:      document.getElementById("playerBadge"),
  basePriceText:    document.getElementById("basePriceText"),
  playerRatingText: document.getElementById("playerRatingText"),
  playerTypeText:   document.getElementById("playerTypeText"),
  highestBidText:   document.getElementById("highestBidText"),

  // Bid controls
  bidCard:        document.getElementById("bidCard"),
  quickBidBtn:    document.getElementById("quickBidBtn"),
  quickBidAmount: document.getElementById("quickBidAmount"),
  bidMessage:     document.getElementById("bidMessage"),
  
  // Quick bid presets
  presetBid1:     document.getElementById("presetBid1"),
  presetBid2:     document.getElementById("presetBid2"),
  presetBid3:     document.getElementById("presetBid3"),
  preset1Text:    document.getElementById("preset1Text"),
  preset2Text:    document.getElementById("preset2Text"),
  preset3Text:    document.getElementById("preset3Text"),
  
  // Chat
  chatBox:        document.getElementById("chatBox"),
  chatInput:      document.getElementById("chatInput"),
  chatSendBtn:    document.getElementById("chatSendBtn"),
  
  // Export
  exportCsvBtn:   document.getElementById("exportCsvBtn"),

  // Teams / Squads
  teamsCard:           document.getElementById("teamsCard"),
  teamsGrid:           document.getElementById("teamsGrid"),
  auctionProgressText: document.getElementById("auctionProgressText"),
  marketWatchCard:     document.getElementById("marketWatchCard"),
  upcomingList:        document.getElementById("upcomingList"),
  soldList:            document.getElementById("soldList"),
  unsoldList:          document.getElementById("unsoldList"),

  // Playing XI
  playing11Card:    document.getElementById("playing11Card"),
  playing11List:    document.getElementById("playing11List"),
  submitXIBtn:      document.getElementById("submitXIBtn"),
  playing11Message: document.getElementById("playing11Message"),
  xiCountChip:      document.getElementById("xiCountChip"),
  xiOverseasChip:   document.getElementById("xiOverseasChip"),
  impactPlayerChip: document.getElementById("impactPlayerChip"),
  impactPlayerSelect: document.getElementById("impactPlayerSelect"),
  clearImpactBtn:   document.getElementById("clearImpactBtn"),

  // AI
  aiCard:         document.getElementById("aiCard"),
  aiSquadPreview: document.getElementById("aiSquadPreview"),
  analyzeBtn:     document.getElementById("analyzeBtn"),
  aiResult:       document.getElementById("aiResult"),
  aiScoreBar:     document.getElementById("aiScoreBar"),
  aiCommentary:   document.getElementById("aiCommentary"),
  aiMessage:      document.getElementById("aiMessage"),

  // Rankings
  rankingsCard:  document.getElementById("rankingsCard"),
  rankingsTable: document.getElementById("rankingsTable"),
  bestTeamAiPanel: document.getElementById("bestTeamAiPanel"),
  bestTeamAiBtn: document.getElementById("bestTeamAiBtn"),
  bestTeamAiMsg: document.getElementById("bestTeamAiMsg"),

  // Feed
  logsCard: document.getElementById("logsCard"),
  logsBox:  document.getElementById("logsBox"),
};

/* ── Client State ── */
const state = {
  roomId:      null,
  role:        null,
  teamId:      null,
  name:        null,
  room:        null,
  selectedXI:  new Set(),
  selectedImpact: null,
  chosenTeamId: null,   // team picked in selector before joining
  shareLink:   "",
  timerMax:    10,
  isOptimisticLoading: false,
  hasAutoScrolledToPlaying11: false,
  hasAutoScrolledToRankings: false,
  prevRoomStatus: null,
};

/* ══════════════════════════════════════════════════
   TEAM SELECTOR (Circular badges)
══════════════════════════════════════════════════ */
function buildTeamCircles(container) {
  if (!container) return;
  container.innerHTML = "";
  TEAM_DATA.forEach((team) => {
    const circle = document.createElement("div");
    circle.className = "team-circle";
    circle.id = `tcircle-${team.id}-${container.id}`;
    circle.style.setProperty("--team-color", team.primary);
    circle.style.background = team.primary;
    circle.dataset.teamId = team.id;

    circle.innerHTML = `${buildTeamLogoImg(team, "team-circle-img", 36)}<span class="team-circle-label">${team.short}</span>`;

    circle.addEventListener("click", () => selectTeam(team.id));
    container.appendChild(circle);
  });
}

function buildTeamSelector() {
  // Build circles in both the New Game and Join tabs
  buildTeamCircles(els.teamSelectGrid);
  const joinGrid = document.getElementById("teamSelectGridJoin");
  if (joinGrid) buildTeamCircles(joinGrid);
}

function selectTeam(teamId) {
  const teamElement = document.querySelector(`[data-team-id="${teamId}"]`);
  if (teamElement && teamElement.classList.contains("taken")) {
    setJoinMessage("That team is already taken. Pick another one.");
    return;
  }

  if (state.chosenTeamId === teamId) {
    state.chosenTeamId = null;
    document.querySelectorAll(".team-circle").forEach(c => c.classList.remove("selected"));
    if (els.selectedTeamBadge) els.selectedTeamBadge.classList.add("hidden");
    return;
  }

  state.chosenTeamId = teamId;
  document.querySelectorAll(".team-circle").forEach(c => {
    c.classList.toggle("selected", c.dataset.teamId === teamId);
  });

  const team = TEAM_DATA.find(t => t.id === teamId);
  if (team && els.selectedTeamBadge) {
    els.selectedTeamBadge.classList.remove("hidden");
    els.selectedTeamBadge.style.background = `${team.primary}22`;
    els.selectedTeamBadge.style.borderColor = `${team.primary}55`;
    els.selectedTeamBadge.style.color = team.primary;
    els.selectedTeamBadge.innerHTML = `${buildTeamLogoImg(team, "", 16, 'style="border-radius:50%;background:#fff;padding:1px;vertical-align:middle;margin-right:4px;"')} <span>${team.short} — ${team.name}</span>`;
  }
  setJoinMessage("", false);
}

function markTeamsTaken(teams) {
  teams.forEach(serverTeam => {
    // Update all circles (both grids)
    document.querySelectorAll(`[data-team-id="${serverTeam.id}"]`).forEach(circle => {
      if (serverTeam.ownerSocketId && serverTeam.id !== state.teamId) {
        circle.classList.add("taken");
        if (!circle.querySelector(".team-taken-badge")) {
          const badge = document.createElement("div");
          badge.className = "team-taken-badge";
          badge.textContent = "✓";
          circle.appendChild(badge);
        }
      } else {
        circle.classList.remove("taken");
        const badge = circle.querySelector(".team-taken-badge");
        if (badge) badge.remove();
      }
    });

  });

  document.querySelectorAll(".team-circle").forEach((circle) => {
    const teamId = circle.dataset.teamId;
    const team = teams.find(t => t.id === teamId);
    const takenByOther = Boolean(team?.ownerSocketId && teamId !== state.teamId);
    circle.classList.toggle("taken", takenByOther);
    const existingBadge = circle.querySelector(".team-taken-badge");
    if (takenByOther && !existingBadge) {
      const badge = document.createElement("div");
      badge.className = "team-taken-badge";
      badge.textContent = "✓";
      circle.appendChild(badge);
    } else if (!takenByOther && existingBadge) {
      existingBadge.remove();
    }
  });
}

/* ══════════════════════════════════════════════════
   HELPERS & LOGIC
══════════════════════════════════════════════════ */
function cr(val) {
  if (val === undefined || val === null) return "—";
  const n = Number(val);
  return `₹${n % 1 === 0 ? n : n.toFixed(2)} Cr`;
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function getMinimumNextBid(currentAmount, basePrice) {
  if (!currentAmount) return basePrice;
  const num = currentAmount;
  let increment = 0.05; 
  
  if (num < 1.0) increment = 0.05;
  else if (num < 2.0) increment = 0.10;
  else if (num < 5.0) increment = 0.20;
  else if (num < 10.0) increment = 0.25;
  else increment = 0.50;

  return Math.round((currentAmount + increment) * 100) / 100;
}

function setJoinMessage(msg, isError = true) {
  els.joinMessage.textContent = msg;
  els.joinMessage.className = "message" + (isError ? "" : " ok");
}
function setBidMessage(msg, isError = true) {
  els.bidMessage.textContent = msg;
  els.bidMessage.className = "message" + (isError ? "" : " ok");
}
function setXIMessage(msg, isError = true) {
  els.playing11Message.textContent = msg;
  els.playing11Message.className = "message" + (isError ? "" : " ok");
}
function setAiMessage(msg, isError = true) {
  if (els.aiMessage) {
    els.aiMessage.textContent = msg;
    els.aiMessage.className = "message" + (isError ? "" : " ok");
  }
}

function buildFallbackShareUrls(roomId, link) {
  const text = encodeURIComponent(`Join my IPL Auction room: ${roomId}`);
  const url = encodeURIComponent(link);
  return {
    link,
    whatsapp: `https://wa.me/?text=${text}%20${url}`,
    telegram: `https://t.me/share/url?url=${url}&text=${text}`,
    twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
    email: `mailto:?subject=Join%20IPL%20Auction&body=${text}%20${url}`,
  };
}

function applyShareUrls(shareData) {
  if (!shareData) return;
  if (els.shareLinkInput) els.shareLinkInput.value = shareData.link || "";
  if (els.shareWhatsapp) els.shareWhatsapp.href = shareData.whatsapp || "#";
  if (els.shareTelegram) els.shareTelegram.href = shareData.telegram || "#";
  if (els.shareTwitter) els.shareTwitter.href = shareData.twitter || "#";
  if (els.shareEmail) els.shareEmail.href = shareData.email || "#";
  if (els.shareApps) els.shareApps.classList.remove("hidden");
}

async function loadShareUrls(roomId, fallbackLink) {
  if (!roomId) return;
  const localFallback = fallbackLink || `${window.location.origin}?room=${roomId}`;

  try {
    const res = await fetch(`/api/share/${encodeURIComponent(roomId)}`);
    if (!res.ok) throw new Error("share-api-failed");
    const data = await res.json();
    const safe = {
      link: data.link || localFallback,
      whatsapp: data.whatsapp,
      telegram: data.telegram,
      twitter: data.twitter,
      email: data.email,
    };
    state.shareLink = safe.link;
    applyShareUrls(safe);
  } catch (e) {
    const fallback = buildFallbackShareUrls(roomId, localFallback);
    state.shareLink = fallback.link;
    applyShareUrls(fallback);
  }
}

function roleClass(role) {
  if (!role) return "";
  const r = role.toLowerCase();
  if (r.includes("bat")) return "bat";
  if (r.includes("bowl")) return "bowl";
  if (r.includes("all")) return "ar";
  if (r.includes("keep") || r.includes("wk") || r.includes("wicket")) return "wk";
  return "";
}
function roleShort(role) {
  if (!role) return "?";
  const r = role.toLowerCase();
  if (r.includes("all")) return "AR";
  if (r.includes("keep") || r.includes("wk") || r.includes("wicket")) return "WK";
  if (r.includes("bat")) return "BAT";
  if (r.includes("bowl")) return "BOWL";
  return role.slice(0, 3).toUpperCase();
}
function teamConfig(teamId) {
  return TEAM_DATA.find(t => t.id === teamId) || { primary: "#f5a623", secondary: "#002e5d", logo: "", short: "???" };
}
function myTeam() {
  if (!state.room) return null;
  return state.room.teams.find(t => t.id === state.teamId) || null;
}

function getAvailableTeamId(preferredTeamId) {
  const preferred = TEAM_DATA.find(team => team.id === preferredTeamId);
  if (preferred) return preferred.id;
  return TEAM_DATA[0]?.id || null;
}

/* ══════════════════════════════════════════════════
   RENDER — LOT BOX & BIDS
══════════════════════════════════════════════════ */
function renderLot() {
  const lot = state.room?.currentLot;
  const bid = state.room?.currentBid;
  const status = state.room?.status;

  if (!lot) {
    els.playerName.textContent = status === "ended" ? "Auction Complete!" : "Waiting for next player…";
    els.playerMeta.textContent = "";
    if (els.playerBadge) els.playerBadge.textContent = "";
    els.basePriceText.textContent = "—";
    els.playerRatingText.textContent = "—";
    els.playerTypeText.textContent = "—";
    els.highestBidText.innerHTML = "—";
    const hbd = document.getElementById("highestBidDisplay");
    if (hbd) hbd.textContent = "—";
    return;
  }

  els.playerName.textContent = lot.name;
  els.playerMeta.textContent = lot.team ? `Team: ${lot.team}` : "";

  const rc = roleClass(lot.role);
  if (els.playerBadge) {
    els.playerBadge.textContent = roleShort(lot.role);
    els.playerBadge.className = `player-role-badge role-${rc}`;
  }

  els.basePriceText.textContent = cr(lot.basePrice);
  els.playerRatingText.textContent = lot.rating ? `${lot.rating} / 100` : "—";
  els.playerTypeText.innerHTML = lot.overseas
    ? `<span style="color:#c4b5fd">✈️ Overseas</span>`
    : `<span style="color:#86efac">🇮🇳 Indian</span>`;

  // Highest bid shown to all
  const hbd = document.getElementById("highestBidDisplay");
  if (bid) {
    const cfg = teamConfig(bid.teamId);
    const bidHtml = `<span style="color:${cfg.primary};font-weight:800;font-size:1.3rem;">${cr(bid.amount)}</span>
      <span style="font-size:0.75rem;color:var(--muted);margin-left:8px;">${cfg.short} (${bid.ownerName})</span>`;
    els.highestBidText.innerHTML = bidHtml;
    if (hbd) hbd.innerHTML = `<span style="font-family:'Space Grotesk',sans-serif;font-size:2.2rem;font-weight:700;color:#fff;">${cr(bid.amount)}</span> <span style="font-size:0.9rem;color:var(--muted);">${cfg.short}</span>`;
    els.highestBidText.classList.remove('bid-flash');
    void els.highestBidText.offsetWidth;
    els.highestBidText.classList.add('bid-flash');
  } else {
    els.highestBidText.innerHTML = `<span style="color:var(--muted)">No bids yet — Base ${cr(lot.basePrice)}</span>`;
    if (hbd) hbd.innerHTML = `<span style="font-family:'Space Grotesk',sans-serif;font-size:2.2rem;font-weight:700;color:var(--muted);">—</span>`;
  }
}

function updateBidControls() {
  const lot = state.room?.currentLot;
  const bid = state.room?.currentBid;
  
  if (!lot) return;

  const nextAmount = bid ? getMinimumNextBid(bid.amount, lot.basePrice) : lot.basePrice;
  if (els.quickBidAmount) els.quickBidAmount.textContent = cr(nextAmount);
  
  // Set the attribute so the button knows what value it represents
  if (els.quickBidBtn) els.quickBidBtn.dataset.amount = nextAmount;

  // Update preset bid buttons
  const preset1 = nextAmount + 0.5;
  const preset2 = nextAmount + 0.75;
  const preset3 = nextAmount + 1.0;
  
  if (els.preset1Text) els.preset1Text.textContent = cr(preset1);
  if (els.preset2Text) els.preset2Text.textContent = cr(preset2);
  if (els.preset3Text) els.preset3Text.textContent = cr(preset3);
  
  if (els.presetBid1) els.presetBid1.dataset.amount = preset1;
  if (els.presetBid2) els.presetBid2.dataset.amount = preset2;
  if (els.presetBid3) els.presetBid3.dataset.amount = preset3;

  const team = myTeam();
  const isHighestBidder = Boolean(team && bid && bid.teamId === team.id);

  if (isHighestBidder) {
    els.quickBidBtn.disabled = true;
    els.quickBidBtn.style.opacity = "0.45";
    els.presetBid1.disabled = true;
    els.presetBid2.disabled = true;
    els.presetBid3.disabled = true;
    setBidMessage("You are already the highest bidder. Wait for another team to counter.", false);
    return;
  }

  // Purse check — disable bid if team can't afford the next bid
  if (team && nextAmount > team.purse) {
    els.quickBidBtn.disabled = true;
    els.quickBidBtn.style.opacity = "0.4";
    els.presetBid1.disabled = true;
    els.presetBid2.disabled = true;
    els.presetBid3.disabled = true;
    setBidMessage(`💰 Insufficient purse (₹${team.purse} Cr). Next bid: ${cr(nextAmount)}`, false);
    return;
  }

  // If user can legally bid, keep button active and clear stale warnings.
  if (team) {
    els.quickBidBtn.disabled = false;
    els.quickBidBtn.style.opacity = "1";
    els.presetBid1.disabled = team.purse < preset1;
    els.presetBid2.disabled = team.purse < preset2;
    els.presetBid3.disabled = team.purse < preset3;
    if (els.bidMessage && els.bidMessage.textContent) {
      setBidMessage("", false);
    }
  }
}

/* ══════════════════════════════════════════════════
   AUDIO BEEP LOGIC
══════════════════════════════════════════════════ */
let audioCtx = null;
let beepEnabled = false;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  beepEnabled = true;
}

// AudioContext requires user interaction to resume
document.body.addEventListener("click", initAudio, { once: true });

function playBeep(frequency, durationMs, type = "sine") {
  if (!beepEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (durationMs / 1000));
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + (durationMs / 1000));
  } catch(e) { /* ignore audio errors */ }
}

/* ══════════════════════════════════════════════════
   RENDER — TIMER
══════════════════════════════════════════════════ */
socket.on("timer_tick", ({ timeLeft }) => {
  // Always show timer container
  els.timerContainer.classList.remove("hidden");

  if (state.room?.isPaused) {
    els.timerText.textContent = "||";
    els.timerRingFill.style.strokeDashoffset = 283;
    els.timerRingFill.style.stroke = "#f59e0b";
    els.timerText.style.color = "#f59e0b";
    els.lotBox.classList.remove("glow-danger");
    return;
  }

  if (timeLeft <= 0) {
    els.timerText.textContent = "0";
    els.timerRingFill.style.strokeDashoffset = 283;
    els.timerRingFill.style.stroke = "var(--accent)";
    els.timerText.style.color = "var(--ink)";
    els.lotBox.classList.remove("glow-danger");
    return;
  }
  
  els.timerText.textContent = timeLeft;
  
  // calculate ring (circumference ~ 283)
  const max = state.room?.timerDuration || 10;
  const pct = Math.max(0, timeLeft / max);
  const offset = 283 - (pct * 283);
  els.timerRingFill.style.strokeDashoffset = offset;

  // Add danger glow and play different beeps
  if (timeLeft <= 5) {
    els.timerRingFill.style.stroke = "#e53e3e";
    els.timerText.style.color = "#e53e3e";
    els.lotBox.classList.add("glow-danger");
    playBeep(800, 150, "square"); // sharp urgent beep
  } else {
    els.timerRingFill.style.stroke = "var(--accent)";
    els.timerText.style.color = "var(--ink)";
    els.lotBox.classList.remove("glow-danger");
    playBeep(400, 100, "sine"); // soft tick beep
  }
});


/* ══════════════════════════════════════════════════
   SOLD / UNSOLD OVERLAY + CONFETTI
══════════════════════════════════════════════════ */
const overlay         = document.getElementById("lotResultOverlay");
const confettiCanvas  = document.getElementById("confettiCanvas");
const lotResultTitle  = document.getElementById("lotResultTitle");
const lotResultAmount = document.getElementById("lotResultAmount");
const lotResultTeam   = document.getElementById("lotResultTeam");
const lotResultTeamLogo = document.getElementById("lotResultTeamLogo");
const lotResultTeamName = document.getElementById("lotResultTeamName");
const lotResultPlayer = document.getElementById("lotResultPlayer");
const lotResultIcon   = document.getElementById("lotResultIcon");

const LOT_RESULT_DISPLAY_MS = {
  sold: 1700,
  unsold: 1300,
};
const LOT_RESULT_FADE_MS = 280;

let confettiAnimId = null;

socket.on("lot_result", (data) => {
  if (!overlay) return;

  if (data.type === "sold") {
    const cfg = teamConfig(data.teamId);
    lotResultIcon.textContent = "🎉";
    lotResultTitle.textContent = "SOLD!";
    lotResultTitle.className = "lot-result-title sold-title";
    lotResultAmount.textContent = `₹${data.amount} Cr`;
    lotResultAmount.style.display = "";
    lotResultTeam.style.display = "";
    lotResultTeamLogo.src = getSafeTeamLogo(cfg, 72);
    lotResultTeamLogo.onerror = () => {
      lotResultTeamLogo.onerror = null;
      lotResultTeamLogo.src = buildTeamFallbackDataUri(cfg, 72);
    };
    lotResultTeamLogo.alt = cfg.short;
    lotResultTeamName.textContent = data.teamName;
    lotResultTeam.style.borderColor = cfg.primary + "55";
    lotResultTeam.style.background = cfg.primary + "22";
    lotResultPlayer.textContent = `${data.playerName} • ${data.playerRole || ""}`;

    // Celebration beep
    playBeep(600, 200, "sine");
    setTimeout(() => playBeep(800, 200, "sine"), 200);
    setTimeout(() => playBeep(1000, 300, "sine"), 400);

    // Start confetti
    startConfetti(cfg.primary);
  } else {
    lotResultIcon.textContent = "❌";
    lotResultTitle.textContent = "UNSOLD";
    lotResultTitle.className = "lot-result-title unsold-title";
    lotResultAmount.style.display = "none";
    lotResultTeam.style.display = "none";
    lotResultPlayer.textContent = `${data.playerName} • ${data.playerRole || ""}`;

    playBeep(300, 400, "sawtooth");
  }

  // Show overlay
  overlay.classList.remove("hidden", "fade-out");

  // Auto-dismiss quickly so next lot flow feels snappy
  const dismissAfter = data.type === "sold" ? LOT_RESULT_DISPLAY_MS.sold : LOT_RESULT_DISPLAY_MS.unsold;
  setTimeout(() => {
    overlay.classList.add("fade-out");
    setTimeout(() => {
      overlay.classList.add("hidden");
      overlay.classList.remove("fade-out");
      stopConfetti();
    }, LOT_RESULT_FADE_MS);
  }, dismissAfter);
});

// Click to dismiss early
if (overlay) {
  overlay.addEventListener("click", () => {
    overlay.classList.add("fade-out");
    setTimeout(() => {
      overlay.classList.add("hidden");
      overlay.classList.remove("fade-out");
      stopConfetti();
    }, 180);
  });
}

/* ── Confetti Engine ── */
function startConfetti(teamColor) {
  stopConfetti();
  if (!confettiCanvas) return;
  const ctx = confettiCanvas.getContext("2d");
  confettiCanvas.width  = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  const colors = [
    teamColor || "#f5a623",
    "#ffd700", "#ff6b6b", "#51cf66", "#339af0", "#cc5de8", "#fff"
  ];
  const pieces = [];
  for (let i = 0; i < 200; i++) {
    pieces.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * confettiCanvas.height - confettiCanvas.height,
      w: Math.random() * 10 + 4,
      h: Math.random() * 6 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 4 + 2,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 8,
      opacity: 1,
    });
  }

  function animate() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let alive = false;
    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.04;
      p.rot += p.rotSpeed;
      if (p.y > confettiCanvas.height + 20) p.opacity -= 0.02;
      if (p.opacity <= 0) return;
      alive = true;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (alive) confettiAnimId = requestAnimationFrame(animate);
  }
  confettiAnimId = requestAnimationFrame(animate);
}

function stopConfetti() {
  if (confettiAnimId) {
    cancelAnimationFrame(confettiAnimId);
    confettiAnimId = null;
  }
  if (confettiCanvas) {
    const ctx = confettiCanvas.getContext("2d");
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}


/* ══════════════════════════════════════════════════
   RENDER — TEAMS SUMMARY & OTHERS
══════════════════════════════════════════════════ */
function renderTeams() {
  if (!state.room) return;
  const PURSE_START = 120;
  const container = document.getElementById("teamsGrid");
  if (!container) return;

  container.innerHTML = "";
  state.room.teams.forEach((team, idx) => {
    const cfg = teamConfig(team.id);
    const spent = PURSE_START - team.purse;
    const pct = Math.max(0, Math.min(100, (team.purse / PURSE_START) * 100));
    const overseasCount = team.squad.filter(p => p.overseas).length;
    const isMyTeam = team.id === state.teamId;

    const item = document.createElement("div");
    item.className = "wr-team-item";
    item.innerHTML = `
      <input class="wr-team-toggle" type="radio" name="wr-team-acc" id="wr-team-${idx}" />
      <label class="wr-team-label" for="wr-team-${idx}">
        <div class="wr-team-label-left">
          <div class="wr-team-icon">
            ${buildTeamLogoImg(cfg, "", 22)}
          </div>
          <div>
            <div class="wr-team-name" style="color:${isMyTeam ? cfg.primary : ''}">${cfg.short}</div>
            <div class="wr-team-purse">${cr(team.purse)} left · ${team.squad.length} players</div>
          </div>
        </div>
        <span class="material-symbols-outlined wr-team-chevron">expand_more</span>
      </label>
      <div class="wr-team-players">
        <div class="wr-team-players-inner custom-scrollbar">
          <div class="wr-team-players-label">Squad · ✈️ ${overseasCount}/8 overseas · Spent ${cr(spent)}</div>
          ${team.squad.length === 0
            ? `<div class="wr-team-empty">No players yet</div>`
            : team.squad.map(p => `
              <div class="wr-team-player-row">
                <span class="wr-team-player-name">${p.name}${p.overseas ? ' ✈️' : ''}</span>
                <div style="display:flex;gap:5px;align-items:center;flex-shrink:0;">
                  <span class="pill-role role-${roleClass(p.role)}">${roleShort(p.role)}</span>
                  <span class="wr-team-player-price">${cr(p.soldPrice)}</span>
                </div>
              </div>`).join("")}
        </div>
      </div>
    `;
    container.appendChild(item);
  });

  // Update sidebar count
  const countEl = document.getElementById("teamsLiveChip");
  if (countEl) {
    const active = state.room.teams.filter(t => t.ownerSocketId || t.ownerName !== "Vacant").length;
    countEl.textContent = `${active}/10 PRESENT`;
  }
}

function renderMarketWatch() {
  if (!state.room) return;

  const sold = state.room.soldPlayers || [];
  const unsold = state.room.unsoldPlayers || [];
  const upcoming = state.room.upcomingPlayers || [];

  // Upcoming queue cards
  const upcomingEl = document.getElementById("upcomingList");
  if (upcomingEl) {
    if (!upcoming.length) {
      upcomingEl.innerHTML = `<div class="wr-queue-card"><div class="wr-queue-name" style="color:var(--muted)">No upcoming players</div></div>`;
    } else {
      upcomingEl.innerHTML = upcoming.slice(0, 8).map((p, i) => {
        const roleKey = roleClass(p.role);
        return `<div class="wr-queue-card" style="opacity:${Math.max(0.25, 1 - i * 0.12)}">
          <div class="wr-queue-card-top">
            <span class="wr-queue-role ${roleKey}">${roleShort(p.role)}</span>
            <span class="wr-queue-bp">B.P. ${cr(p.basePrice)}</span>
          </div>
          <div class="wr-queue-name">${p.name}</div>
          <div class="wr-queue-sub">${p.overseas ? '✈️ Overseas' : 'India'}</div>
        </div>`;
      }).join("");
    }
  }

  // Sold list
  const soldEl = document.getElementById("soldList");
  if (soldEl) {
    if (!sold.length) {
      soldEl.innerHTML = `<div class="market-empty">None yet</div>`;
    } else {
      soldEl.innerHTML = sold.slice(-10).reverse().map(p => {
        const team = state.room.teams.find(t => t.id === p.soldTo);
        return `<div class="market-item"><span>${p.name}</span><span>${team ? team.name.split(' ').pop() : '-'} · ${cr(p.soldPrice)}</span></div>`;
      }).join("");
    }
  }

  // Unsold list
  const unsoldEl = document.getElementById("unsoldList");
  if (unsoldEl) {
    if (!unsold.length) {
      unsoldEl.innerHTML = `<div class="market-empty">None yet</div>`;
    } else {
      unsoldEl.innerHTML = unsold.slice(-10).reverse().map(p =>
        `<div class="market-item"><span>${p.name}</span><span>${p.role}</span></div>`
      ).join("");
    }
  }
}

function renderPlaying11Selection() {
  const isOwner = state.role === "team-owner" || (state.role === "host" && state.teamId);
  const ended   = state.room?.status === "ended";

  els.playing11Card.classList.toggle("hidden", !(isOwner && ended));
  if (els.postAuctionActions) {
    els.postAuctionActions.classList.toggle("hidden", !(isOwner && ended));
  }

  if (!(isOwner && ended)) return;
  const team  = myTeam();
  const squad = team ? team.squad : [];

  if (team && !state.hasAutoScrolledToPlaying11 && !state.room?.playing11Submissions?.[team.id]) {
    els.playing11Card.scrollIntoView({ behavior: "smooth", block: "start" });
    state.hasAutoScrolledToPlaying11 = true;
  }

  els.playing11List.innerHTML = "";

  if (state.selectedImpact && !squad.some(p => p.id === state.selectedImpact)) {
    state.selectedImpact = null;
  }
  if (state.selectedImpact && state.selectedXI.has(state.selectedImpact)) {
    state.selectedImpact = null;
  }

  const overseasSelected = [...state.selectedXI].filter(id => squad.find(pl => pl.id === id)?.overseas).length;
  const impactPlayer = state.selectedImpact ? squad.find(p => p.id === state.selectedImpact) : null;
  const totalOverseasWithImpact = overseasSelected + (impactPlayer?.overseas ? 1 : 0);

  squad.forEach(player => {
    const isSelected  = state.selectedXI.has(player.id);
    const isOverseas  = !!player.overseas;
    const overseasFull = !isSelected && isOverseas && overseasSelected >= 4;
    const xiFull       = !isSelected && state.selectedXI.size >= 11;

    const pill = document.createElement("div");
    pill.className = `player-pill ${isSelected ? "selected" : ""} ${isOverseas ? "overseas-pill" : ""} ${(overseasFull || xiFull) ? "disabled" : ""}`;

    pill.innerHTML = `
      <div>
        <div class="pill-name">${player.name}</div>
        <div style="font-size:0.7rem;color:var(--muted);margin-top:2px">
          Rating: ${player.rating} · ${cr(player.soldPrice)}
        </div>
      </div>
      <div class="pill-meta">
        ${isOverseas ? `<span style="font-size:0.75rem">✈️</span>` : ""}
        <span class="pill-role role-${roleClass(player.role)}">${roleShort(player.role)}</span>
        ${isSelected ? `<i class="fa-solid fa-circle-check pill-check"></i>` : ""}
      </div>`;

    pill.addEventListener("click", () => {
      if (state.selectedXI.has(player.id)) state.selectedXI.delete(player.id);
      else {
        if (state.selectedXI.size >= 11) { setXIMessage("You can only select 11 players."); return; }
        const nowOverseas = [...state.selectedXI].filter(id => squad.find(p => p.id === id)?.overseas).length;
        if (isOverseas && nowOverseas >= 4) { setXIMessage("Max 4 overseas players allowed."); return; }
        state.selectedXI.add(player.id);
      }

      if (state.selectedImpact && state.selectedXI.has(state.selectedImpact)) {
        state.selectedImpact = null;
      }

      setXIMessage("", false);
      renderPlaying11Selection();
    });
    els.playing11List.appendChild(pill);
  });

  if (els.impactPlayerSelect) {
    const candidates = squad.filter(p => !state.selectedXI.has(p.id));
    const options = ["<option value=\"\">Select Impact Player</option>"];
    candidates.forEach((p) => {
      const osTag = p.overseas ? " \u00b7 OS" : "";
      options.push(`<option value="${p.id}">${p.name} (${roleShort(p.role)}${osTag})</option>`);
    });
    els.impactPlayerSelect.innerHTML = options.join("");
    els.impactPlayerSelect.value = state.selectedImpact || "";
    els.impactPlayerSelect.disabled = state.selectedXI.size !== 11 || candidates.length === 0;
  }
  
  els.xiCountChip.textContent = `${state.selectedXI.size} / 11 selected`;
  els.xiCountChip.classList.toggle("full", state.selectedXI.size === 11);
  els.xiOverseasChip.textContent = `✈️ ${totalOverseasWithImpact} / 4 overseas`;
  els.xiOverseasChip.classList.toggle("limit", totalOverseasWithImpact >= 4);

  if (els.impactPlayerChip) {
    if (impactPlayer) {
      els.impactPlayerChip.textContent = `Impact: ${impactPlayer.name}`;
      els.impactPlayerChip.classList.add("impact-pill");
    } else {
      els.impactPlayerChip.textContent = "Impact: Not selected";
      els.impactPlayerChip.classList.remove("impact-pill");
    }
  }
}

function renderRankings() {
  const rankings = state.room?.rankings;
  const visible  = Array.isArray(rankings) && rankings.length > 0;
  els.rankingsCard.classList.toggle("hidden", !visible);
  if (!visible) return;

  if (!state.hasAutoScrolledToRankings) {
    els.rankingsCard.scrollIntoView({ behavior: "smooth", block: "start" });
    state.hasAutoScrolledToRankings = true;
  }

  els.rankingsTable.innerHTML = "";
  rankings.forEach(entry => {
    const cfg   = teamConfig(entry.teamId);
    const medal = entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`;

    const div = document.createElement("div");
    div.className = `rank-entry rank-${entry.rank}`;
    const strengths = (entry.insights?.strengths || []).slice(0, 2).join(" ") || "No major strength identified.";
    const weaknesses = (entry.insights?.weaknesses || []).slice(0, 2).join(" ") || "No major weakness identified.";
    const recommendations = (entry.insights?.recommendations || []).slice(0, 2).join(" ") || "No recommendation required.";
    const impactLine = entry.impactPlayer
      ? `🎯 Impact: <strong>${entry.impactPlayer.name}</strong> (${roleShort(entry.impactPlayer.role)})`
      : `🎯 Impact: <strong>Not selected</strong>`;
    div.innerHTML = `
      <div class="rank-num">${medal}</div>
      ${buildTeamLogoImg(cfg, "rank-team-img", 48)}
      <div class="rank-info">
        <h3 style="color:${cfg.primary}">${entry.teamName}</h3>
        <p>Owner: ${entry.ownerName}</p>
      </div>
      <div class="rank-score">${entry.analysis.finalScore}</div>
      <div class="rank-details">
        <div class="rank-detail-item">⭐ Rating Total: <strong>${entry.analysis.ratingTotal}</strong></div>
        <div class="rank-detail-item">📉 Role Penalty: <strong>${entry.analysis.rolePenalty}</strong></div>
        <div class="rank-detail-item">🚀 Quality Bonus: <strong>${entry.analysis.qualityBonus}</strong></div>
        <div class="rank-detail-item">🎯 Impact Bonus: <strong>${entry.analysis.impactBonus || 0}</strong></div>
        <div class="rank-detail-item">🏏 Batters: <strong>${entry.analysis.roles.batter}</strong></div>
        <div class="rank-detail-item">🎳 Bowlers: <strong>${entry.analysis.roles.bowler}</strong></div>
        <div class="rank-detail-item">⚡ All-Rounders: <strong>${entry.analysis.roles.allRounder}</strong></div>
        <div class="rank-detail-item">🧤 Wicket-Keepers: <strong>${entry.analysis.roles.wicketKeeper}</strong></div>
        <div class="rank-detail-item">✈️ Overseas: <strong>${entry.analysis.overseas}</strong></div>
        <div class="rank-detail-item">${impactLine}</div>
      </div>
      <div class="rank-reason">${entry.rankReason || "Ranking based on XI quality, balance, and constraints."}</div>
      <div class="insight-grid">
        <div class="insight-box insight-strength"><h4>Strengths</h4><p>${strengths}</p></div>
        <div class="insight-box insight-weakness"><h4>Weaknesses</h4><p>${weaknesses}</p></div>
        <div class="insight-box insight-plan"><h4>Possibilities</h4><p>${recommendations}</p></div>
      </div>`;
    els.rankingsTable.appendChild(div);
  });
}

function renderLogs() {
  if (!state.room) return;
  els.logsBox.innerHTML = "";
  [...state.room.logs].reverse().slice(0, 50).forEach(log => {
    const div = document.createElement("div");
    const msg = log.message.toLowerCase();
    div.className = "log-item " + (msg.includes("sold to") ? "log-sold" : msg.includes("bid") ? "log-bid" : "log-info");
    const time = new Date(log.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    div.innerHTML = `<span class="log-time">${time}</span>${log.message}`;
    els.logsBox.appendChild(div);
  });
}

function renderMyPurse() {
  const team = myTeam();
  if (team && state.role === "team-owner") {
    els.myPurseText.textContent = cr(team.purse);
    els.myPurseChip.style.display = "";
  } else {
    els.myPurseChip.style.display = "none";
  }
}

function roleText() {
  if (state.role === "host") {
    if (state.teamId) {
      const team = myTeam();
      const cfg  = teamConfig(state.teamId);
      return `🎙️ Host · ${buildTeamLogoImg(cfg, "", 14, 'style="vertical-align:middle;margin-right:4px;border-radius:50%;background:#fff;padding:1px"')} <strong style="color:${cfg.primary}">${team ? team.name : "team"}</strong>`;
    }
    return "🎙️ You are the Host (no team)";
  }
  if (state.role === "team-owner") {
    const team = myTeam();
    const cfg  = teamConfig(state.teamId);
    return `${buildTeamLogoImg(cfg, "", 14, 'style="vertical-align:middle;margin-right:4px;border-radius:50%;background:#fff;padding:1px"')} You own <strong style="color:${cfg.primary}">${team ? team.name : "a team"}</strong>`;
  }
  return "👁️ Spectator";
}

/* ══════════════════════════════════════════════════
   MAIN RENDER
══════════════════════════════════════════════════ */
function render() {
  const ready = Boolean(state.room);

  // Switch between landing page and war room
  const landingPage = document.getElementById("landingPage");
  const warRoom = document.getElementById("warRoom");
  if (landingPage) landingPage.classList.toggle("hidden", ready);
  if (warRoom) warRoom.classList.toggle("hidden", !ready);

  // Keep legacy hidden elements in sync (app.js logic depends on these)
  els.joinCard.classList.toggle("hidden", ready);
  els.teamSelectCard.classList.toggle("hidden", ready);
  els.roomCard.classList.toggle("hidden", !ready);
  els.auctionCard.classList.toggle("hidden", !ready);
  els.teamsCard.classList.toggle("hidden", !ready);
  els.marketWatchCard.classList.toggle("hidden", !ready);
  els.logsCard.classList.toggle("hidden", !ready);

  if (!ready) return;

  els.roomCodeText.textContent = state.room.roomId;
  els.identityText.innerHTML = roleText();

  const statusMap = { lobby: "⏳ Lobby", live: "🔴 Live", ended: "✅ Ended" };
  const pausedTag = state.room.isPaused ? " (Paused)" : "";
  const statusLabel = (statusMap[state.room.status] || state.room.status) + pausedTag;
  els.statusText.textContent = `${statusLabel} · ${state.room.lotIndex}/${state.room.totalLots}`;

  els.hostControls.classList.toggle("hidden", state.role !== "host");
  if (els.pauseAuctionBtn) {
    els.pauseAuctionBtn.innerHTML = state.room.isPaused
      ? `<span class="material-symbols-outlined" style="font-size:1rem;">play_arrow</span> RESUME`
      : `<span class="material-symbols-outlined" style="font-size:1rem;">pause</span> PAUSE`;
    els.pauseAuctionBtn.disabled = state.room.status !== "live";
  }
  if (els.endAuctionBtn) {
    els.endAuctionBtn.disabled = state.room.status !== "live";
  }
  if (els.skipPlayerBtn) {
    const canVoteSkip = Boolean(state.teamId) && state.room.status === "live" && state.room.currentLot && !state.room.isPaused;
    els.skipPlayerBtn.disabled = !canVoteSkip;
  }
  
  const isLive = state.room.status === "live";
  
  // Bid card: visible when live. Both team-owners AND host-with-team can bid.
  const hasTeam = Boolean(state.teamId);
  els.bidCard.classList.toggle("hidden", !isLive);

  // Toggle waiting panel
  const waitingPanel = document.getElementById("waitingPanel");
  if (waitingPanel) waitingPanel.classList.toggle("hidden", isLive);

  if (isLive) {
    const canBid = hasTeam && state.room.currentLot && !state.room.isPaused;
    els.quickBidBtn.disabled = !canBid;
    
    if (!canBid) {
      els.quickBidBtn.style.opacity = "0.45";
      let msg = "";
      if (state.role === "host" && !hasTeam) msg = "🎙️ You are Host-only (no team selected). Manage the auction above.";
      else if (state.room.isPaused) msg = "⏸️ Auction is paused by host.";
      else if (!state.room.currentLot) msg = "⏳ Waiting for a player to appear on the lot…";
      else msg = "You must be a team owner to bid.";
      setBidMessage(msg, false);
    } else {
      els.quickBidBtn.style.opacity = "1";
    }
  }

  if (els.auctionProgressText) {
    els.auctionProgressText.textContent = `${state.room.lotIndex} / ${state.room.totalLots} players`;
  }

  markTeamsTaken(state.room.teams);
  renderMyPurse();
  
  if (!state.isOptimisticLoading) {
    renderLot();
    updateBidControls();
  }
  
  renderTeams();
  renderMarketWatch();
  renderLogs();
  renderPlaying11Selection();
  renderRankings();
}

/* ══════════════════════════════════════════════════
   EVENT LISTENERS — Bidding & Timer
══════════════════════════════════════════════════ */
on(els.quickBidBtn, "click", () => {
  const team = myTeam();
  const currentBid = state.room?.currentBid;
  if (team && currentBid && currentBid.teamId === team.id) {
    setBidMessage("You are already the highest bidder. Wait for another team to counter.", false);
    return;
  }

  const amount = parseFloat(els.quickBidBtn.dataset.amount);
  if (!amount || isNaN(amount)) return;
  
  // OPTIMISTIC UI: Assume success locally instantly!
  state.isOptimisticLoading = true;
  
  // Fake update local room state
  if (team) {
    state.room.currentBid = {
       teamId: team.id,
       teamName: team.name,
       ownerName: team.ownerName,
       amount: amount
    };
  }
  
  renderLot();
  updateBidControls();
  
  // Give it a split second class to feel responsive
  els.quickBidBtn.classList.add("active-pulse");
  setTimeout(() => els.quickBidBtn.classList.remove("active-pulse"), 200);

  // Send to server
  socket.emit("place_bid", { amount });
});

/* Copy share link */
on(els.copyLinkBtn, "click", () => {
  const val = els.shareLinkInput.value;
  if (val) {
    navigator.clipboard.writeText(val).then(() => {
      els.copyLinkBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
      setTimeout(() => { els.copyLinkBtn.innerHTML = `<i class="fa-solid fa-copy"></i> Copy`; }, 2000);
    }).catch(() => {
      els.shareLinkInput.select();
      document.execCommand("copy");
    });
  }
});

/* ── Host Controls ── */
on(els.timerSelect, "change", () => {
  if (state.role === "host") {
    socket.emit("set_timer_duration", { duration: els.timerSelect.value });
  }
});

on(els.pauseAuctionBtn, "click", () => {
  socket.emit("pause_auction", { paused: !state.room?.isPaused });
});

on(els.skipPlayerBtn, "click", () => {
  if (!state.room?.currentLot) return;
  socket.emit("skip_player");
});

on(els.endAuctionBtn, "click", () => {
  const ok = window.confirm("End auction now and move all teams to Playing XI submission?");
  if (!ok) return;
  localStorage.removeItem("auction_session");
  socket.emit("end_auction");
});

/* ══════════════════════════════════════════════════
   LOGIN/JOIN FLOW
══════════════════════════════════════════════════ */
on(els.createBtn, "click", () => {
  if (!socket.connected) {
    setJoinMessage("Not connected to server. Refresh page and ensure npm start is running.");
    return;
  }
  const name = els.nameInput.value.trim();
  if (!name) { setJoinMessage("Enter your name."); return; }
  const preferredTeamId = getAvailableTeamId(state.chosenTeamId);
  if (!preferredTeamId) {
    setJoinMessage("No teams are available right now.");
    return;
  }
  setJoinMessage("Creating room…", false);
  // Host may also select a team — pass it along, otherwise default to the first team.
  socket.emit("create_room", { hostName: name, preferredTeamId });
});

on(els.joinBtn, "click", () => {
  if (!socket.connected) {
    setJoinMessage("Not connected to server. Refresh page and ensure npm start is running.");
    return;
  }
  const nameEl = document.getElementById("nameInputJoin");
  const name   = nameEl ? nameEl.value.trim() : "";
  const roomId = els.roomInput.value.trim().toUpperCase();
  if (!name)   { setJoinMessage("Enter your name."); return; }
  if (!roomId) { setJoinMessage("Enter a room code."); return; }
  const preferredTeamId = getAvailableTeamId(state.chosenTeamId);
  if (!preferredTeamId) {
    setJoinMessage("No teams are available right now.");
    return;
  }
  setJoinMessage("Joining…", false);
  socket.emit("join_room", { roomId, participantName: name, preferredTeamId });
});

on(els.startAuctionBtn, "click", () => {
  socket.emit("set_timer_duration", { duration: els.timerSelect.value });
  socket.emit("start_auction", { timerDuration: Number(els.timerSelect.value) });
});

/* Auction Deck buttons */
on(els.deckStartBtn, "click", () => {
  socket.emit("set_timer_duration", { duration: els.deckTimerSelect.value });
  socket.emit("start_auction", { timerDuration: Number(els.deckTimerSelect.value) });
});

on(els.deckPauseBtn, "click", () => {
  socket.emit("toggle_pause");
});

on(els.deckSkipBtn, "click", () => {
  socket.emit("skip_player");
});

on(els.deckEndBtn, "click", () => {
  if (confirm("Are you sure you want to end the auction? All teams will proceed to Playing XI submission.")) {
    socket.emit("end_auction");
  }
});

on(els.deckEvaluateBtn, "click", () => {
  socket.emit("evaluate_rankings");
});

on(els.deckTimerSelect, "change", () => {
  socket.emit("set_timer_duration", { duration: els.deckTimerSelect.value });
});


on(els.impactPlayerSelect, "change", () => {
  const team = myTeam();
  if (!team) return;

  const selectedId = els.impactPlayerSelect.value || null;
  if (!selectedId) {
    state.selectedImpact = null;
    setXIMessage("", false);
    renderPlaying11Selection();
    return;
  }

  if (state.selectedXI.has(selectedId)) {
    setXIMessage("Impact Player must be from the bench (not in XI).");
    els.impactPlayerSelect.value = "";
    return;
  }

  const impact = team.squad.find(p => p.id === selectedId);
  if (!impact) {
    setXIMessage("Selected Impact Player is invalid.");
    return;
  }

  const overseasInXI = [...state.selectedXI]
    .map(id => team.squad.find(p => p.id === id))
    .filter(Boolean)
    .filter(p => p.overseas).length;

  if (impact.overseas && overseasInXI >= 4) {
    setXIMessage("Cannot pick overseas Impact Player when XI already has 4 overseas.");
    els.impactPlayerSelect.value = state.selectedImpact || "";
    return;
  }

  state.selectedImpact = selectedId;
  setXIMessage("", false);
  renderPlaying11Selection();
});

on(els.clearImpactBtn, "click", () => {
  state.selectedImpact = null;
  setXIMessage("", false);
  renderPlaying11Selection();
});

/* ── Submit Playing XI ── */
on(els.submitXIBtn, "click", () => {
  if (state.selectedXI.size !== 11) {
    setXIMessage("Select exactly 11 players.");
    return;
  }
  socket.emit("submit_playing11", {
    playerIds: [...state.selectedXI],
    impactPlayerId: state.selectedImpact || null,
  });
});

/* ── Preset Bid Buttons ── */
on(els.presetBid1, "click", () => {
  const amount = els.presetBid1.dataset.amount;
  if (amount) {
    socket.emit("place_bid", { amount: parseFloat(amount) });
  }
});

on(els.presetBid2, "click", () => {
  const amount = els.presetBid2.dataset.amount;
  if (amount) {
    socket.emit("place_bid", { amount: parseFloat(amount) });
  }
});

on(els.presetBid3, "click", () => {
  const amount = els.presetBid3.dataset.amount;
  if (amount) {
    socket.emit("place_bid", { amount: parseFloat(amount) });
  }
});

/* ── Chat Functionality ── */
on(els.chatSendBtn, "click", () => {
  const message = els.chatInput.value.trim();
  if (!message) return;
  socket.emit("send_message", { message });
  els.chatInput.value = "";
});

on(els.chatInput, "keypress", (e) => {
  if (e.key === "Enter") {
    els.chatSendBtn.click();
  }
});

/* ── Export CSV ── */
on(els.exportCsvBtn, "click", () => {
  exportAuctionToCSV();
});

function exportAuctionToCSV() {
  if (!state.room) return;
  
  const teams = state.room.teams;
  const sold = state.room.soldPlayers || [];
  
  // Create CSV content
  let csv = "IPL Auction Results Export\n";
  csv += `Room ID: ${state.room.roomId}\n\n`;
  
  // Teams summary
  csv += "TEAMS SUMMARY\n";
  csv += "Team,Owner,Purse Left,Players Bought,Spent\n";
  teams.forEach(team => {
    const cfg = teamConfig(team.id);
    const spent = 120 - team.purse;
    csv += `${cfg.name},${team.ownerName || "Vacant"},${team.purse} Cr,${team.squad.length},${spent} Cr\n`;
  });
  
  csv += "\n\nSOLD PLAYERS\n";
  csv += "Player,Team,Price,Role,Overseas\n";
  sold.forEach(p => {
    const team = teams.find(t => t.id === p.soldTo);
    const teamName = team ? team.name : "Unknown";
    csv += `${p.name},${teamName},${p.soldPrice} Cr,${p.role},${p.overseas ? "Yes" : "No"}\n`;
  });
  
  // Team squads
  csv += "\n\nTEAM SQUADS\n";
  teams.forEach(team => {
    csv += `\n${team.name}\n`;
    csv += "Player,Role,Price,Overseas,Rating\n";
    team.squad.forEach(player => {
      csv += `${player.name},${player.role},${player.soldPrice} Cr,${player.overseas ? "Yes" : "No"},${player.rating}\n`;
    });
  });
  
  // Download CSV
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `auction_${state.room.roomId}_${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/* ══════════════════════════════════════════════════
   SOCKET STATE SYNC
══════════════════════════════════════════════════ */
socket.on("room_joined", ({ roomId, role, teamId, shareLink }) => {
  state.roomId    = roomId;
  state.role      = role;
  state.teamId    = teamId;
  state.shareLink = shareLink;
  state.selectedXI = new Set();
  state.selectedImpact = null;

  // Capture name from input (may be empty on auto-rejoin, fall back to existing state.name)
  const inputName = els.nameInput?.value?.trim();
  if (inputName) state.name = inputName;

  // Persist session so page refresh can auto-rejoin
  localStorage.setItem("auction_session", JSON.stringify({
    roomId, role, teamId, name: state.name || ""
  }));

  els.roomInput.value = roomId;
  if (els.shareLinkInput) els.shareLinkInput.value = shareLink;
  loadShareUrls(roomId, shareLink);

  const url = new URL(window.location.href);
  url.searchParams.set("room", roomId);
  window.history.replaceState({}, "", url.toString());

  if (role === "team-owner") {
    const teamCfg = TEAM_DATA.find(t => t.id === teamId);
    setJoinMessage(`✓ Joined as owner of ${teamCfg ? teamCfg.short : "a team"}! Redirecting...`, false);
    // Redirect team owners to new war room interface
    setTimeout(() => {
      window.location.href = `/war-room?room=${roomId}`;
    }, 1000);
  } else if (role === "host") {
    setJoinMessage(`✓ Room created! Share the code above.`, false);
  } else {
    setJoinMessage("✓ Joined as Spectator (all teams are filled).", false);
  }
});

socket.on("join_error", msg => {
  setJoinMessage(msg || "Failed to join room. Check the code.");
  // Clear stale session
  localStorage.removeItem("auction_session");
  // Clear stale room code from URL so user isn't stuck
  const url = new URL(window.location.href);
  if (url.searchParams.has("room")) {
    url.searchParams.delete("room");
    window.history.replaceState({}, "", url.toString());
  }
  // Switch back to New Game tab
  const tabNew = document.getElementById("tabNew");
  if (tabNew) tabNew.click();
});

socket.on("bid_error", msg => {
  state.isOptimisticLoading = false; 
  setBidMessage(msg); 
  render(); // restore from server state
});

socket.on("playing11_ok", msg => {
  setXIMessage(msg, false);
});

socket.on("playing11_error", msg => {
  setXIMessage(msg);
});

socket.on("chat_message", ({ sender, senderRole, message }) => {
  if (!els.chatBox) return;
  const msgEl = document.createElement("div");
  msgEl.className = `wr-chat-message ${sender === state.name ? "own" : senderRole === "host" ? "host" : ""}`;
  msgEl.innerHTML = `<span class="wr-chat-sender">${sender}:</span> ${escapeHtml(message)}`;
  els.chatBox.appendChild(msgEl);
  els.chatBox.scrollTop = els.chatBox.scrollHeight;
});

socket.on("room_state", roomState => {
  state.isOptimisticLoading = false; // Server has synced back
  const prevLotId = state.room?.currentLot?.id;
  const previousStatus = state.room?.status || state.prevRoomStatus;
  state.room = roomState;

  // Reset skip button label when lot changes
  if (els.skipPlayerBtn && roomState.currentLot?.id !== prevLotId) {
    els.skipPlayerBtn.innerHTML = `<span class="material-symbols-outlined" style="font-size:1rem;">skip_next</span> SKIP`;
  }

  if (previousStatus !== state.room.status) {
    if (state.room.status === "live") {
      state.hasAutoScrolledToPlaying11 = false;
      state.hasAutoScrolledToRankings = false;
    }
    state.prevRoomStatus = state.room.status;
  }

  if (els.timerSelect && Number.isFinite(Number(roomState.timerDuration))) {
    els.timerSelect.value = String(roomState.timerDuration);
  }
  render();
});

socket.on("connect_error", () => {
  const target = socketServerUrl || window.location.origin;
  setJoinMessage(`Connection failed. Ensure server is running at ${target}, then refresh.`);
});

socket.on("skip_vote_update", ({ votes, needed }) => {
  if (els.skipPlayerBtn) {
    els.skipPlayerBtn.innerHTML = `<span class="material-symbols-outlined" style="font-size:1rem;">skip_next</span> SKIP (${votes}/${needed})`;
  }
});

socket.on("connect", () => {
  // Auto-rejoin if we have a saved session (e.g. after page refresh)
  const raw = localStorage.getItem("auction_session");
  if (!raw) return;
  try {
    const session = JSON.parse(raw);
    if (!session?.roomId || !session?.name) return;
    // Pre-load name into state so room_joined can persist it correctly
    state.name = session.name;
    setJoinMessage("Reconnecting to room…", false);
    socket.emit("rejoin_room", {
      roomId: session.roomId,
      participantName: session.name,
      teamId: session.teamId || null,
      role: session.role || "spectator"
    });
  } catch (e) {
    localStorage.removeItem("auction_session");
  }
});

/* ══════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════ */
buildTeamSelector();

// Tab switching for New Game / Join Room
const tabNew = document.getElementById("tabNew");
const tabJoin = document.getElementById("tabJoin");
const tabContentNew = document.getElementById("tabContentNew");
const tabContentJoin = document.getElementById("tabContentJoin");

if (tabNew && tabJoin) {
  tabNew.addEventListener("click", () => {
    tabNew.classList.add("active");
    tabJoin.classList.remove("active");
    tabContentNew.classList.add("active");
    tabContentJoin.classList.remove("active");
  });
  tabJoin.addEventListener("click", () => {
    tabJoin.classList.add("active");
    tabNew.classList.remove("active");
    tabContentJoin.classList.add("active");
    tabContentNew.classList.remove("active");
  });
}

// Pre-fill room code from URL & auto-switch to Join tab
const urlRoom = new URLSearchParams(window.location.search).get("room");
if (urlRoom) {
  els.roomInput.value = urlRoom;
  // Auto-switch to Join tab
  if (tabJoin) tabJoin.click();
}
