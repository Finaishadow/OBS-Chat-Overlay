// ===== CONFIG =====
const MAX_MESSAGES = 8;
const MESSAGE_LIFETIME = 8000; // milliseconds
const DEMO_MODE = false; // true = show sample messages, without connecting to Streamer.bot

const WEBSOCKET_OPTIONS = {
  host: "127.0.0.1",
  port: 8080,
  endpoint: "/",
  subscribe: {
    Twitch: ["ChatMessage"],
    Kick: ["ChatMessage"],
    YouTube: ["Message"], // YouTube chat, once YouTube is connected in Streamer.bot
    General: ["Custom"], // custom JSON payloads
  },
  logLevel: "info",
};

// ===================
// Social Stream Ninja (YouTube/TikTok/Instagram) via SSN WebSocket Channel 4
const SSN_ENABLED = false; // set true to use Social Stream Ninja in addition to Streamer.bot
const SSN_SESSION_ID = ""; // add your own session ID locally; never publish it
const SSN_ALLOWED = new Set(["youtube", "tiktok", "tiktoklive", "instagram", "instagramlive"]);

// Avatar mode:
// - "profileFirst"  = use profile pics when available, otherwise blank
// - "logoFallback"  = use profile pics when available, otherwise platform logo
// - "logoOnly"      = always show platform logo as the avatar
const AVATAR_MODE = "logoFallback";

// Turn an SVG string into a safe data URI
function svgDataUri(svg) {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.trim());
}

// Basic icons as SVG (not official)
const PLATFORM_ICON = {
  youtube: svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect x="6" y="18" width="52" height="28" rx="8" fill="#FF0000"/>
      <polygon points="28,24 28,40 42,32" fill="#FFFFFF"/>
    </svg>
  `),
  instagram: svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#833AB4"/>
          <stop offset="0.5" stop-color="#FD1D1D"/>
          <stop offset="1" stop-color="#FCAF45"/>
        </linearGradient>
      </defs>
      <rect x="10" y="10" width="44" height="44" rx="12" fill="url(#g)"/>
      <rect x="22" y="22" width="20" height="20" rx="6" fill="none" stroke="#FFFFFF" stroke-width="4"/>
      <circle cx="43" cy="21" r="3" fill="#FFFFFF"/>
    </svg>
  `),
  tiktok: svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect x="10" y="10" width="44" height="44" rx="12" fill="#111"/>
      <path d="M38 18c2.2 3.5 5.3 5.7 8 6.3v6c-3.3-.4-6.4-1.9-8-3.7v11.2c0 7-5 12.2-12 12.2-5.6 0-10.2-3.8-11.4-9.1-.2-.7-.3-1.5-.3-2.3 0-6.9 5.6-12.5 12.5-12.5 1 0 2 .1 2.9.3v6.7c-.8-.4-1.8-.6-2.8-.6-3.4 0-6.1 2.7-6.1 6.1 0 .4 0 .8.1 1.2.5 2.8 2.9 4.9 5.9 4.9 3.6 0 6.3-2.4 6.3-6.8V18h5.9z" fill="#fff"/>
      <path d="M32 26.2c-1-.3-2-.5-2.9-.5-6.9 0-12.5 5.6-12.5 12.5 0 .8.1 1.6.3 2.3 2.2 1.1 4.7 1.8 7.4 1.8 6.9 0 12.5-5.6 12.5-12.5v-5.1c-1.1-.7-2.3-1.3-3.6-1.6v3.1c0 3.4-2.7 6.1-6.1 6.1-1 0-2-.2-2.8-.6V26.2z" fill="#00f2ea" opacity="0.6"/>
      <path d="M31.4 26.1v5.8c-.9-.4-1.8-.6-2.8-.6-3.4 0-6.1 2.7-6.1 6.1 0 .4 0 .8.1 1.2-1.7-.7-3.3-1.6-4.8-2.7 1.1-5.8 6.2-10.2 12.3-10.2.5 0 .9 0 1.3.1z" fill="#ff004f" opacity="0.55"/>
    </svg>
  `),
  twitch: svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path fill="#9146FF" d="M14 10h44v28L46 50H32l-8 6H18v-6H14z"/>
      <path fill="#fff" d="M24 20h6v14h-6zm16 0h6v14h-6z"/>
    </svg>
  `),
  kick: svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect x="10" y="10" width="44" height="44" rx="10" fill="#00E701"/>
      <path d="M24 20h6v10l10-10h8L34 34l14 10h-9l-9-7v7h-6V20z" fill="#0b0b0b"/>
    </svg>
  `),

  instagramlive: null,
  tiktoklive: null,
};

function resolveAvatar(platform, avatarUrl) {
  const p = String(platform || "").toLowerCase();
  const logo = PLATFORM_ICON[p] || PLATFORM_ICON[p.replace("live", "")] || "";

  if (AVATAR_MODE === "logoOnly") return logo || "";
  if (AVATAR_MODE === "logoFallback") return avatarUrl || logo || "";
  return avatarUrl || "";
}

function cssUrlValue(url) {
  const s = String(url || "").trim();
  // Only permit HTTPS/HTTP images or built-in SVG data URIs.
  if (!/^https?:\/\//i.test(s) && !s.startsWith("data:image/svg+xml;charset=utf-8,")) return "";
  return `url("${s.replace(/\\/g, "%5C").replace(/"/g, "%22").replace(/[\r\n]/g, "")}")`;
}

window.addEventListener("DOMContentLoaded", () => {
  console.log("Overlay DOM ready. Starting script…");

  const chatEl = document.getElementById("chat");
  const statusEl = document.getElementById("status");

  function setStatus(text, connected) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.classList.toggle("status--connected", !!connected);
    statusEl.classList.toggle("status--disconnected", !connected);
  }

  if (!chatEl) {
    console.error("#chat element not found in DOM");
    setStatus("Overlay error: #chat missing", false);
    return;
  }

  function escapeHtml(str = "") {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function sanitizeColor(input, fallback = "#ffffff") {
    const c = String(input || "").trim();
    if (/^#[0-9a-fA-F]{3}$/.test(c)) return c;
    if (/^#[0-9a-fA-F]{6}$/.test(c)) return c;
    if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(\s*,\s*(0|1|0?\.\d+))?\s*\)$/.test(c)) return c;
    if (/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%(\s*,\s*(0|1|0?\.\d+))?\s*\)$/.test(c)) return c;
    return fallback;
  }

  function stripHtml(html = "") {
    // Inert template keeps chat-supplied HTML out of the live document.
    const fragment = document.createElement("template");
    fragment.innerHTML = String(html);
    return (fragment.content.textContent || "").trim();
  }

  function renderTwitchMessageHtml(text = "", emotes = []) {
    const source = String(text || "");

    if (!source) return "";

    const safe = (str = "") =>
      String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const normalized = Array.isArray(emotes)
      ? emotes
          .map((e) => ({
            startIndex: e?.startIndex ?? e?.StartIndex,
            endIndex: e?.endIndex ?? e?.EndIndex,
            imageUrl: e?.imageUrl ?? e?.ImageUrl,
            name: e?.name ?? e?.Name,
          }))
          .filter((e) =>
            Number.isInteger(e.startIndex) &&
            Number.isInteger(e.endIndex) &&
            e.startIndex >= 0 &&
            e.endIndex >= e.startIndex &&
            e.endIndex < source.length &&
            /^https?:\/\//i.test(String(e.imageUrl || ""))
          )
          .sort((a, b) => a.startIndex - b.startIndex)
      : [];

    if (normalized.length === 0) {
      return safe(source);
    }

    let html = "";
    let cursor = 0;

    for (const emote of normalized) {
      const start = emote.startIndex;
      const end = emote.endIndex + 1;

      if (start < cursor) continue;
      if (start > source.length) continue;

      html += safe(source.slice(cursor, start));

      const rawToken = source.slice(start, end);
      const alt = safe(emote.name || rawToken);

      html += `<img class="chat__emote" src="${safe(emote.imageUrl)}" alt="${alt}" title="${alt}">`;

      cursor = Math.min(end, source.length);
    }

    html += safe(source.slice(cursor));
    return html;
  }

  function pushChat({ platform, userId, userName, color = "#ffffff", text, html, avatar }) {
    if (!text && !html) return;

    const item = document.createElement("div");
    item.className = "chat__item";

    if (userId) item.dataset.userId = String(userId);
    if (platform) item.dataset.platform = String(platform);

    const finalAvatar = resolveAvatar(platform, avatar);
    if (finalAvatar) item.style.setProperty("--avatar-url", cssUrlValue(finalAvatar));
    else item.style.removeProperty("--avatar-url");

    const safeColor = sanitizeColor(color);

    item.innerHTML = `
      <span class="chat__user" style="color:${safeColor}">${escapeHtml(userName || "Unknown")}</span>
      <span class="chat__message">${html || escapeHtml(text || "")}</span>
      <div class="chat__metadata"></div>
    `;

    chatEl.appendChild(item);

    while (chatEl.children.length > MAX_MESSAGES) chatEl.removeChild(chatEl.firstChild);
    setTimeout(() => item.remove(), MESSAGE_LIFETIME);
  }

  function connectSSN() {
    if (!SSN_SESSION_ID || SSN_SESSION_ID.includes("PUT_YOUR")) {
      console.warn("[SSN] SSN_SESSION_ID not set — skipping SSN connection.");
      return;
    }

    const url = `wss://io.socialstream.ninja/join/${SSN_SESSION_ID}/4`;
    let ws = null;
    let reconnectTimer = null;

    const open = () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);

      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        try { ws.close(); } catch {}
      }

      console.log("[SSN] Connecting:", url);
      ws = new WebSocket(url);

      ws.onopen = () => console.log("[SSN] Connected");
      ws.onclose = () => {
        console.warn("[SSN] Disconnected — reconnecting in 2s");
        reconnectTimer = setTimeout(open, 2000);
      };
      ws.onerror = (e) => console.warn("[SSN] WebSocket error", e);

      ws.onmessage = (evt) => {
        let msg;
        try { msg = JSON.parse(evt.data); } catch { return; }

        const platform = String(msg.type || "").toLowerCase();
        if (!SSN_ALLOWED.has(platform)) return;

        const userName = msg.chatname || "Unknown";
        const avatar = msg.chatimg || "";
        const color = msg.nameColor || "#ffffff";
        const text = stripHtml(msg.chatmessage || "");
        if (!text) return;

        pushChat({
          platform,
          userId: msg.userid ? `ssn:${platform}:${msg.userid}` : null,
          userName,
          color,
          text,
          avatar,
        });
      };
    };

    open();
  }

  if (DEMO_MODE) {
    setStatus("Demo mode: sample messages", true);
    const samples = [
      { platform: "twitch", userName: "PurplePixel", color: "#b28aff", text: "Hello from Twitch! 👋" },
      { platform: "kick", userName: "GreenGlow", color: "#66ef83", text: "The overlay is looking great!" },
      { platform: "youtube", userName: "VideoFan", color: "#ff7b77", text: "Hello from YouTube ✨" },
      { platform: "tiktok", userName: "ShortClip", color: "#ffffff", text: "This is a demo message." },
    ];
    let n = 0;
    const showSample = () => pushChat(samples[n++ % samples.length]);
    showSample();
    setInterval(showSample, 2500);
    return;
  }

  if (SSN_ENABLED) connectSSN();

  if (typeof StreamerbotClient === "undefined") {
    console.error("StreamerbotClient is not defined. The CDN script may not have loaded.");
    setStatus("Streamer.bot client library could not load", false);
    return;
  }

  console.log("Creating Streamer.bot client with options:", WEBSOCKET_OPTIONS);

  const avatarCache = new Map();

  const client = new StreamerbotClient({
    ...WEBSOCKET_OPTIONS,
    onConnect: (info) => {
      console.log("Connected to Streamer.bot:", info);
      setStatus("Connected to Streamer.bot", true);
    },
    onDisconnect: () => {
      console.warn("Disconnected from Streamer.bot");
      setStatus("Disconnected from Streamer.bot", false);
    },
    onError: (err) => {
      console.error("Streamer.bot client error:", err);
      setStatus("WebSocket error (see console)", false);
    },
  });

  const getEventData = (evt) => (evt && typeof evt === "object" && "data" in evt ? evt.data : evt);

  client.on("General.Custom", (evt) => {
    const data = getEventData(evt);
    if (!data) return;

    // Streamer.bot General.Custom often wraps broadcast text as { data: "{...}" }.
    // Also support a directly delivered JSON string or already parsed object.
    let payload = data;
    try {
      if (typeof payload === "object" && payload !== null && !Array.isArray(payload) &&
          !("type" in payload) && "data" in payload) {
        payload = payload.data;
      }
      if (typeof payload === "string") payload = JSON.parse(payload);
    } catch {
      console.error("Bad General.Custom payload:", data);
      return;
    }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return;

    if (payload.type === "avatar" && payload.platform === "twitch") {
      const userId = payload.userId;
      const avatar = payload.avatar;
      if (!userId || !avatar) return;

      avatarCache.set(String(userId), String(avatar));

      const safeId = window.CSS?.escape
        ? CSS.escape(String(userId))
        : String(userId).replace(/"/g, '\\"');

      document.querySelectorAll(`[data-user-id="${safeId}"]`).forEach((el) => {
        el.style.setProperty("--avatar-url", cssUrlValue(avatar));
      });
      return;
    }

    if (payload.type === "chat") {
      pushChat({
        platform: payload.platform || "custom",
        userId: payload.userId || "",
        userName: payload.userName || payload.username || "Unknown",
        color: payload.color || "#ffffff",
        text: payload.message || payload.text || "",
        avatar: payload.avatar || "",
      });
    }
  });

  client.on("Twitch.ChatMessage", (evt) => {
    const data = getEventData(evt);

    const userId =
      data?.user?.id ||
      data?.message?.userId ||
      data?.userId ||
      null;

    const userName =
      data?.user?.displayName ||
      data?.message?.displayName ||
      data?.user?.name ||
      data?.displayName ||
      data?.message?.username ||
      data?.username ||
      "Unknown";

    const color =
      data?.message?.color ||
      data?.user?.color ||
      data?.color ||
      "#ffffff";

    const text =
      data?.text ||
      data?.message?.message ||
      "";

    const emotes =
      data?.emotes ||
      data?.message?.emotes ||
      [];

    const avatar = userId ? avatarCache.get(String(userId)) : "";

    pushChat({
      platform: "twitch",
      userId: userId ? String(userId) : null,
      userName,
      color,
      text,
      html: renderTwitchMessageHtml(text, emotes),
      avatar,
    });
  });

  client.on("Kick.ChatMessage", (evt) => {
    const data = getEventData(evt);

    const userName = data?.user?.name || data?.user?.login || "Kick";
    const avatar = data?.user?.profilePicture || data?.user?.profile_picture || "";

    const text =
      data?.text ??
      (Array.isArray(data?.parts) ? data.parts.map((p) => p?.text || "").join("") : "");

    if (!text) return;

    pushChat({
      platform: "kick",
      userId: data?.user?.id ? `kick:${data.user.id}` : null,
      userName,
      color: data?.user?.color || "#ffffff",
      text,
      avatar,
    });
  });

  client.on("YouTube.Message", (evt) => {
    const data = getEventData(evt);

    const userName =
      data?.user?.name ||
      data?.author?.name ||
      data?.authorName ||
      "YouTube";

    const avatar =
      data?.user?.profileImageUrl ||
      data?.user?.profilePicture ||
      data?.author?.profileImageUrl ||
      data?.authorImageUrl ||
      "";

    const text = data?.message || data?.text || data?.rawInput || "";
    if (!text) return;

    pushChat({
      platform: "youtube",
      userId: data?.user?.id ? `yt:${data.user.id}` : null,
      userName,
      color: "#ffffff",
      text,
      avatar,
    });
  });
});
