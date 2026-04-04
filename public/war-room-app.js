/* ══════════════════════════════════════════════════
   IPL AUCTION ARENA — New War Room UI + Full App.js
══════════════════════════════════════════════════ */

// Socket Connection
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
  : { connected: false, emit: () => {}, on: () => {} };

// Global State
const state = {
  roomId: null,
  role: null,
  teamId: null,
  name: "",
  room: null,
  chosenTeamId: null,
  selectedXI: new Set(),
  selectedImpact: null,
  hasAutoScrolledToPlaying11: false,
  hasAutoScrolledToRankings: false,
  shareLink: null,
  isOptimisticLoading: false,
  prevRoomStatus: null
};

// Team Data
const TEAM_DATA = [
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

// ════════════════════════════════════════
// DOM ELEMENTS
// ════════════════════════════════════════
const els = {
  roomCodeDisplay: document.getElementById("roomCodeDisplay"),
  pageTitle: document.getElementById("pageTitle"),
  teamsLiveCount: document.getElementById("teamsLiveCount"),
  teamsPresentCount: document.getElementById("teamsPresentCount"),
  teamsAccordion: document.getElementById("teamsAccordion"),
  auctionStatusText: document.getElementById("auctionStatusText"),
  startAuctionBtn: document.getElementById("startAuctionBtn"),
  endAuctionBtn: document.getElementById("endAuctionBtn"),
  playersRemainingText: document.getElementById("playersRemainingText"),
  upcomingQueueContainer: document.getElementById("upcomingQueueContainer"),
  playerImage: document.getElementById("playerImage"),
  playerNameDisplay: document.getElementById("playerNameDisplay"),
  playerStatusBadge: document.getElementById("playerStatusBadge"),
  hammerIcon: document.getElementById("hammerIcon"),
  basePriceDisplay: document.getElementById("basePriceDisplay"),
  playerRoleDisplay: document.getElementById("playerRoleDisplay"),
  playerRatingDisplay: document.getElementById("playerRatingDisplay"),
  playerTypeDisplay: document.getElementById("playerTypeDisplay"),
  playerTeamDisplay: document.getElementById("playerTeamDisplay"),
  playerOverseasDisplay: document.getElementById("playerOverseasDisplay"),
  highestBidDisplay: document.getElementById("highestBidDisplay"),
  highestBidTeamDisplay: document.getElementById("highestBidTeamDisplay"),
  presetBid1: document.getElementById("presetBid1"),
  presetBid2: document.getElementById("presetBid2"),
  presetBid3: document.getElementById("presetBid3"),
  nextBidAmountDisplay: document.getElementById("nextBidAmountDisplay"),
  placeBidBtn: document.getElementById("placeBidBtn"),
  bidMessage: document.getElementById("bidMessage"),
  bidHistoryContainer: document.getElementById("bidHistoryContainer"),
  chatInput: document.getElementById("chatInput"),
  chatSendBtn: document.getElementById("chatSendBtn"),
  chatMessagesContainer: document.getElementById("chatMessagesContainer"),
  leaveRoomBtn: document.getElementById("leaveRoomBtn"),
  mobileLeaveBtn: document.getElementById("mobileLeaveBtn"),
};

// ════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════
function cr(val) {
  if (val === undefined || val === null) return "—";
  const n = Number(val);
  return `₹${n % 1 === 0 ? n : n.toFixed(2)} Cr`;
}

function escapeHtml(text) {
  const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
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

function teamConfig(teamId) {
  return TEAM_DATA.find(t => t.id === teamId) || { primary: "#f5a623", secondary: "#002e5d", logo: "", short: "???" };
}

function myTeam() {
  if (!state.room) return null;
  return state.room.teams.find(t => t.id === state.teamId) || null;
}

// ════════════════════════════════════════
// RENDER FUNCTIONS
// ════════════════════════════════════════

function renderTeamsAccordion() {
  if (!state.room || !state.room.teams) {
    console.log("⚠️ No teams data");
    els.teamsAccordion.innerHTML = '<div class="p-6 text-slate-500">No teams yet</div>';
    return;
  }
  
  console.log("🏆 Rendering", state.room.teams.length, "teams");
  els.teamsAccordion.innerHTML = "";
  
  state.room.teams.forEach((team, idx) => {
    const cfg = teamConfig(team.id);
    const spent = (team.soldPrice || 0);
    const isMyTeam = team.id === state.teamId;
    
    const squadHTML = team.squad && team.squad.length > 0 
      ? team.squad.map(p => `
          <div class="flex justify-between items-center text-[10px] text-slate-400 py-1">
            <span>${p.name}</span>
            <span class="text-primary">${cr(p.soldPrice)}</span>
          </div>
        `).join('')
      : '<div class="text-[10px] text-slate-600">No players yet</div>';
    
    const html = `
      <div class="border-b border-outline-variant/10">
        <input class="hidden team-accordion-input" id="team-acc-${idx}" name="team-accordion" type="radio"/>
        <label class="flex items-center justify-between py-4 px-6 cursor-pointer hover:bg-[#191c1f] transition-all" for="team-acc-${idx}">
          <div class="flex items-center gap-4">
            <span class="material-symbols-outlined text-slate-400">${isMyTeam ? 'shield' : 'group'}</span>
            <div class="flex flex-col">
              <span class="text-xs font-headline font-bold tracking-widest uppercase" style="color: ${cfg.primary}">${cfg.short}</span>
              <span class="text-[10px] text-slate-400">₹${team.purse || 0} Cr · ${(team.squad?.length || 0)} players</span>
            </div>
          </div>
          <span class="material-symbols-outlined text-slate-600 text-sm transition-transform expand-icon">expand_more</span>
        </label>
        <div class="team-accordion-content bg-[#15181b]/50">
          <div class="px-6 py-3 space-y-2 overflow-y-auto max-h-40 custom-scrollbar">
            <div class="text-[10px] font-headline font-bold text-slate-500 uppercase tracking-widest mb-1 border-b border-outline-variant/10 pb-1">Squad · Spent ${cr(spent)}</div>
            ${squadHTML}
          </div>
        </div>
      </div>
    `;
    els.teamsAccordion.innerHTML += html;
  });
}

function renderUpcomingQueue() {
  if (!state.room) return;
  const upcoming = state.room.upcomingPlayers || [];
  els.upcomingQueueContainer.innerHTML = "";
  
  if (!upcoming.length) {
    els.upcomingQueueContainer.innerHTML = '<div class="text-slate-500 text-sm">No upcoming players</div>';
    return;
  }
  
  upcoming.slice(0, 8).forEach((p, i) => {
    const roleColors = {
      'batsman': 'bg-blue-500/10 text-blue-300',
      'bowler': 'bg-red-500/10 text-red-300',
      'all-rounder': 'bg-green-500/10 text-green-300',
      'wicket-keeper': 'bg-purple-500/10 text-purple-300'
    };
    const roleKey = (p.role || '').toLowerCase().includes('bowl') ? 'bowler' 
                  : (p.role || '').toLowerCase().includes('all') ? 'all-rounder'
                  : (p.role || '').toLowerCase().includes('keep') ? 'wicket-keeper' : 'batsman';
    const roleColor = roleColors[roleKey] || 'bg-slate-500/10 text-slate-300';
    
    const html = `
      <div class="min-w-[180px] bg-surface-container-low p-4 rounded-lg border border-outline-variant/10 hover:border-primary/20 transition-all" style="opacity: ${Math.max(0.3, 1 - i * 0.15)}">
        <div class="flex justify-between items-start mb-2">
          <span class="text-[10px] font-headline font-bold px-2 py-1 rounded ${roleColor}">${roleKey.toUpperCase()}</span>
          <span class="text-[10px] text-slate-500">${cr(p.basePrice)}</span>
        </div>
        <div class="text-sm font-headline font-bold text-white uppercase">${p.name}</div>
        <div class="text-[10px] text-slate-400 mt-1 uppercase">${p.overseas ? '✈️ Overseas' : '🇮🇳 India'}</div>
      </div>
    `;
    els.upcomingQueueContainer.innerHTML += html;
  });
}

function renderCurrentPlayer() {
  const lot = state.room?.currentLot;
  const bid = state.room?.currentBid;
  
  if (!lot) {
    els.playerNameDisplay.textContent = state.room?.status === "ended" ? "Auction Complete!" : "No Player";
    els.playerStatusBadge.textContent = "WAITING";
    els.hammerIcon.style.fontVariationSettings = "'FILL' 0";
    els.basePriceDisplay.textContent = "—";
    els.playerRoleDisplay.textContent = "—";
    els.playerRatingDisplay.textContent = "—";
    els.playerTypeDisplay.textContent = "—";
    els.playerTeamDisplay.textContent = "—";
    els.playerOverseasDisplay.textContent = "—";
    els.highestBidDisplay.textContent = "—";
    els.highestBidTeamDisplay.textContent = "—";
    return;
  }
  
  els.playerNameDisplay.textContent = lot.name;
  els.playerStatusBadge.textContent = "LIVE UNDER HAMMER";
  els.hammerIcon.style.fontVariationSettings = "'FILL' 1";
  els.basePriceDisplay.textContent = cr(lot.basePrice);
  els.playerRoleDisplay.textContent = (lot.role || '').toUpperCase();
  els.playerRatingDisplay.textContent = lot.rating ? `${lot.rating}/100` : "—";
  els.playerTypeDisplay.textContent = lot.overseas ? "✈️ Overseas" : "🇮🇳 Indian";
  els.playerTeamDisplay.textContent = lot.team || "—";
  els.playerOverseasDisplay.textContent = lot.overseas ? "YES" : "NO";
  
  if (bid) {
    const cfg = teamConfig(bid.teamId);
    els.highestBidDisplay.textContent = cr(bid.amount);
    els.highestBidTeamDisplay.textContent = cfg.short;
    els.highestBidDisplay.parentElement.parentElement.classList.add('glow-active');
  } else {
    els.highestBidDisplay.textContent = "NO BIDS";
    els.highestBidTeamDisplay.textContent = "—";
    els.highestBidDisplay.parentElement.parentElement.classList.remove('glow-active');
  }
  
  updateBidControls();
}

function updateBidControls() {
  const lot = state.room?.currentLot;
  const bid = state.room?.currentBid;
  
  if (!lot) return;
  
  const nextAmount = bid ? getMinimumNextBid(bid.amount, lot.basePrice) : lot.basePrice;
  const preset1 = nextAmount + 0.5;
  const preset2 = nextAmount + 0.75;
  const preset3 = nextAmount + 1.0;
  
  els.nextBidAmountDisplay.textContent = cr(nextAmount);
  els.presetBid1.textContent = cr(preset1);
  els.presetBid2.textContent = cr(preset2);
  els.presetBid3.textContent = cr(preset3);
  els.presetBid1.dataset.amount = preset1;
  els.presetBid2.dataset.amount = preset2;
  els.presetBid3.dataset.amount = preset3;
  
  const team = myTeam();
  const isHighestBidder = Boolean(team && bid && bid.teamId === team.id);
  
  if (isHighestBidder) {
    els.placeBidBtn.disabled = true;
    els.presetBid1.disabled = true;
    els.presetBid2.disabled = true;
    els.presetBid3.disabled = true;
    els.bidMessage.textContent = "You are the highest bidder. Wait for another team.";
    els.bidMessage.className = "text-[10px] text-yellow-400 mt-2 text-center";
    return;
  }
  
  if (team && nextAmount > team.purse) {
    els.placeBidBtn.disabled = true;
    els.presetBid1.disabled = true;
    els.presetBid2.disabled = true;
    els.presetBid3.disabled = true;
    els.bidMessage.textContent = `Insufficient purse (₹${team.purse} Cr)`;
    els.bidMessage.className = "text-[10px] text-red-400 mt-2 text-center";
    return;
  }
  
  if (team) {
    els.placeBidBtn.disabled = false;
    els.presetBid1.disabled = team.purse < preset1;
    els.presetBid2.disabled = team.purse < preset2;
    els.presetBid3.disabled = team.purse < preset3;
    els.bidMessage.textContent = "";
  }
}

function renderBidHistory() {
  if (!state.room?.logs) return;
  els.bidHistoryContainer.innerHTML = "";
  
  const bidLogs = state.room.logs.filter(l => l.type === 'bid' || l.type === 'sold').slice(-10);
  
  bidLogs.forEach(log => {
    const html = `
      <div class="flex justify-between items-center bg-surface-container-high/50 p-3 rounded-lg border-l-4 ${log.type === 'bid' ? 'border-primary' : 'border-emerald-500'}">
        <div class="flex items-center gap-3">
          <div class="w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center bg-slate-700">${log.teamShort || '—'}</div>
          <span class="text-xs font-bold text-slate-300">${log.message}</span>
        </div>
        <span class="text-sm font-headline font-bold text-primary">${log.data?.amount ? cr(log.data.amount) : ''}</span>
      </div>
    `;
    els.bidHistoryContainer.innerHTML += html;
  });
}

function renderChat(sender, message, isOwn = false, isHost = false) {
  const msgEl = document.createElement("div");
  msgEl.className = `flex gap-2 text-[11px] ${isOwn ? 'bg-emerald-500/10 text-emerald-300 p-1.5 rounded' : isHost ? 'text-primary' : 'text-slate-400'}`;
  msgEl.innerHTML = `<span class="font-bold">${escapeHtml(sender)}:</span><span>${escapeHtml(message)}</span>`;
  els.chatMessagesContainer.appendChild(msgEl);
  els.chatMessagesContainer.scrollTop = els.chatMessagesContainer.scrollHeight;
  
  // Keep only last 20 messages
  while (els.chatMessagesContainer.children.length > 20) {
    els.chatMessagesContainer.removeChild(els.chatMessagesContainer.firstChild);
  }
}

function updateAuctionStatus() {
  if (!state.room) return;
  const status = state.room.status;
  const lotIndex = state.room.lotIndex || 0;
  const totalLots = state.room.totalLots || 450;
  const hostControls = state.room.hostControls !== undefined ? state.room.hostControls : true;

  const statusMap = {
    'lobby': '⏳ Lobby',
    'live': '🔴 LIVE',
    'ended': '✅ ENDED',
    'paused': '⏸️ PAUSED'
  };
  
  els.auctionStatusText.textContent = `${statusMap[status] || status} • ${lotIndex}/${totalLots}`;
  els.playersRemainingText.textContent = `${totalLots - lotIndex} PLAYERS`;
  // Show/hide host controls based on room setting
  const pauseBtn = document.getElementById("pauseAuctionBtn");
  if (!hostControls) {
    if (els.startAuctionBtn) els.startAuctionBtn.style.display = 'none';
    if (els.endAuctionBtn) els.endAuctionBtn.style.display = 'none';
    if (pauseBtn) pauseBtn.style.display = 'none';
    return;
  }

  // Otherwise, ensure controls are visible and set enabled state
  if (els.startAuctionBtn) els.startAuctionBtn.style.display = '';
  if (els.endAuctionBtn) els.endAuctionBtn.style.display = '';
  if (pauseBtn) pauseBtn.style.display = '';

  if (status === 'live') {
    els.startAuctionBtn.disabled = true;
    els.endAuctionBtn.disabled = false;
  } else if (status === 'lobby') {
    els.startAuctionBtn.disabled = false;
    els.endAuctionBtn.disabled = true;
  } else {
    els.startAuctionBtn.disabled = true;
    els.endAuctionBtn.disabled = true;
  }
}

function render() {
  if (!state.room) {
    console.log("⚠️ No room data yet", state);
    return;
  }
  
  console.log("🎨 Rendering with room:", state.room.roomId, "Teams:", state.room.teams?.length);
  
  els.roomCodeDisplay.textContent = state.room.roomId;
  els.pageTitle.textContent = `${state.room.roomId} | IPL Auction`;
  els.teamsLiveCount.textContent = `${state.room.teams.filter(t => t.ownerSocketId).length}/10`;
  els.teamsPresentCount.textContent = `${state.room.teams.filter(t => t.ownerSocketId).length}/10 PRESENT`;
  
  renderTeamsAccordion();
  renderUpcomingQueue();
  renderCurrentPlayer();
  renderBidHistory();
  updateAuctionStatus();
}

// ════════════════════════════════════════
// EVENT LISTENERS
// ════════════════════════════════════════

els.startAuctionBtn?.addEventListener("click", () => {
  console.log("▶️ Start auction clicked");
  socket.emit("start_auction", { timerDuration: 10 });
});

// Pause button listener
const pauseAuctionBtn = document.getElementById("pauseAuctionBtn");
if (pauseAuctionBtn) {
  console.log("✅ Pause button found, adding listener");
  pauseAuctionBtn.addEventListener("click", () => {
    console.log("⏸️ Pause button clicked, isPaused:", state.room?.isPaused);
    socket.emit("pause_auction", { paused: !state.room?.isPaused });
  });
} else {
  console.log("❌ Pause button NOT found!");
}

els.endAuctionBtn?.addEventListener("click", () => {
  console.log("⏹️ End auction clicked");
  if (confirm("End the auction?")) {
    socket.emit("end_auction");
  }
});

[els.presetBid1, els.presetBid2, els.presetBid3].forEach(btn => {
  btn?.addEventListener("click", () => {
    const amount = parseFloat(btn.dataset.amount);
    console.log("💰 Preset bid clicked:", amount);
    if (amount) socket.emit("place_bid", { amount });
  });
});

els.placeBidBtn?.addEventListener("click", () => {
  if (state.room?.currentLot?.basePrice) {
    const nextAmount = state.room.currentBid 
      ? getMinimumNextBid(state.room.currentBid.amount, state.room.currentLot.basePrice)
      : state.room.currentLot.basePrice;
    console.log("🎯 Place bid clicked:", nextAmount);
    socket.emit("place_bid", { amount: nextAmount });
  }
});

els.chatSendBtn?.addEventListener("click", () => {
  const message = els.chatInput.value.trim();
  if (message) {
    console.log("💬 Chat message:", message);
    socket.emit("send_message", { message });
    els.chatInput.value = "";
  }
});

els.chatInput?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") els.chatSendBtn.click();
});

els.leaveRoomBtn?.addEventListener("click", () => {
  if (confirm("Leave the room?")) {
    window.location.href = "/";
  }
});

els.mobileLeaveBtn?.addEventListener("click", () => {
  if (confirm("Leave the room?")) {
    window.location.href = "/";
  }
});

// ════════════════════════════════════════
// SOCKET EVENTS
// ════════════════════════════════════════

socket.on("connect", () => {
  console.log("🔗 Socket connected!");
});

socket.on("room_joined", ({ roomId, role, teamId, shareLink }) => {
  console.log("✅ Joined room:", roomId, "as", role, "team:", teamId);
  state.roomId = roomId;
  state.role = role;
  state.teamId = teamId;
  state.shareLink = shareLink;
  
  localStorage.setItem("auction_session", JSON.stringify({
    roomId, role, teamId, name: state.name || ""
  }));
});

socket.on("room_state", (roomState) => {
  console.log("📊 Room state received:", {
    roomId: roomState?.roomId,
    teams: roomState?.teams?.length,
    currentLot: roomState?.currentLot?.name,
    status: roomState?.status
  });
  state.isOptimisticLoading = false;
  state.room = roomState;
  render();
});

socket.on("chat_message", ({ sender, senderRole, message }) => {
  console.log("💬 Chat:", sender, "-", message);
  renderChat(sender, message, sender === state.name, senderRole === "host");
});

socket.on("bid_placed", () => {
  console.log("💰 Bid placed");
  updateBidControls();
});

socket.on("lot_sold", (data) => {
  console.log("🔨 Lot sold:", data?.playerName);
  renderBidHistory();
  render();
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from server");
});

// ════════════════════════════════════════
// INITIALIZATION
// ════════════════════════════════════════

function init() {
  // Get query params
  const params = new URLSearchParams(window.location.search);
  const roomId = params.get('room');
  
  // Try to get from localStorage
  const sessionData = JSON.parse(localStorage.getItem("auction_session") || "{}");
  
  if (roomId || (sessionData.roomId && sessionData.role && sessionData.teamId)) {
    state.name = sessionData.name || "Guest";
    
    // Emit rejoin with available data
    socket.emit("rejoin_room", {
      roomId: roomId || sessionData.roomId,
      role: sessionData.role || "spectator",
      teamId: sessionData.teamId || null,
      participantName: state.name
    });
  }
}

// Wait for socket connection then init
if (socket.connected) {
  init();
} else {
  socket.once("connect", () => {
    init();
  });
}

// Also init after a small delay
setTimeout(() => {
  if (!state.room) init();
}, 1000);
