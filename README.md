# OBS-Chat-Overlay
A customizable OBS chat overlay powered by Streamer.bot, featuring Twitch, Kick, and YouTube chat support, user avatars, emotes, and real-time messages. Includes a friendly step-by-step installation guide, setup instructions, and customizable HTML, CSS, and JavaScript files.
# OBS + Streamer.bot — Custom Multiplatform Chat Overlay
A beginner-friendly guide to setting up a custom on-stream chat box with OBS Studio, Streamer.bot, and a few HTML/CSS/JavaScript files.
Display Twitch, Kick, and YouTube chat in one configurable overlay. Optionally add TikTok, Instagram, and other chat through Social Stream Ninja. This project is based on my own three-file overlay (`index.html`, `overlay.js`, and `style.css`). I am sharing how it works so you can create your own version!
> **Start here:** The published tutorial is in [`docs/index.html`](docs/index.html). If GitHub Pages is enabled, use the site's URL in the repository's **Settings → Pages**.

## What it looks like
Messages appear near the bottom-left of a transparent OBS Browser Source. Each message has a rounded dark background, a colored username, a message, and an avatar or platform icon. Messages disappear automatically after 8 seconds by default.
**Supported routes**

| Chat source | How the overlay receives it | Status in the supplied code |
| --- | --- | --- |
| Twitch | Streamer.bot `Twitch.ChatMessage` | Enabled |
| Kick | Streamer.bot `Kick.ChatMessage` | Enabled; Kick connection requires a supported Streamer.bot version |
| YouTube | Streamer.bot `YouTube.Message` | Enabled; requires live-chat events to be received |
| Custom messages | Streamer.bot `General.Custom` | Enabled; requires your own matching custom events |
| TikTok / Instagram / YouTube via Social Stream Ninja | SSN channel 4 (`wss://io.socialstream.ninja/...`) | Optional and disabled until configured |

Not every platform needs to be connected. Use only the platforms that you stream on. If both Streamer.bot and SSN deliver the same chat, it may show up twice; use only one route for that platform.
---

## Requirements
- A **Windows PC** running [OBS Studio](https://obsproject.com/download/) and [Streamer.bot](https://streamer.bot/). This walkthrough uses their Windows layouts; Streamer.bot support on macOS and Linux is experimental.
- A Twitch, Kick, and/or YouTube account, depending on where you stream.
- Internet access for the CDN-hosted official Streamer.bot WebSocket client and optional external avatar/emote images.
- This repository's `overlay` folder. You do **not** need to install Node.js, Visual Studio, or a web server.

## Part 1 — Install the streaming software
### Step 1: Download and install OBS Studio
1. Open **https://obsproject.com/download/** and download OBS for your operating system.
2. Run the installer, launch OBS, and follow its initial auto-configuration if prompted.
3. In **Scenes**, create a scene for your broadcast if you do not already have one.
4. Keep OBS installed; you'll add the chat Browser Source after configuring Streamer.bot.

### Step 2: Download and open Streamer.bot
1. Open **https://streamer.bot/** and download the latest **stable** release for Windows.
2. Extract the ZIP into a permanent folder such as `C:\Streamer.bot\` (do not run it directly from the ZIP).
3. Open `Streamer.bot.exe` from the extracted folder.
4. Avoid a cloud-synced application folder and do not run as administrator unless you have a specific reason.

Streamer.bot is a **portable application**, so it does not need a traditional installer.

## Part 2 — Connect chat and WebSocket events
### Step 3: Connect the chat platform(s) you use
Inside **Streamer.bot**, connect your own broadcaster account under the appropriate platform settings:
- **Twitch:** `Platforms → Twitch → Accounts` → sign in with your broadcaster account and approve permissions.
- **YouTube:** `Platforms → YouTube → Accounts` → **Sign in with Google** under **Broadcaster Account**. Configure an active live broadcast so Streamer.bot can receive live chat; enable **Auto Connect**.
- **Kick:** `Platforms → Kick` → follow the current [Kick setup guide](https://docs.streamer.bot/guide/platforms/kick). The Kick integration requires Streamer.bot v1.0.0 or later and its website integration.

You only need to connect accounts for the platforms you want displayed. An OBS-to-Streamer.bot control connection is **not required** just to display this chat overlay.

### Step 4: Turn on Streamer.bot's WebSocket server
1. In Streamer.bot, go to **Servers/Clients → WebSocket Server**.
2. Set **Address/Host** to `127.0.0.1`.
3. Set **Port** to `8080`.
4. Set **Endpoint** to `/`.
5. Check **Auto Start** and click **Start Server** if the server is not running.
6. Keep **Authentication/Enforce** off for this simplest *loopback-only* example, unless you plan to configure a password locally. Do **not** open this port to the public internet.

These values must match those at the top of `overlay/overlay.js`:
```js
const WEBSOCKET_OPTIONS = {
  host: "127.0.0.1",
  port: 8080,
  endpoint: "/",
  subscribe: {
    Twitch: ["ChatMessage"],
    Kick: ["ChatMessage"],
    YouTube: ["Message"],
    General: ["Custom"],
  },
  logLevel: "info",
};
```

**IMPORTANT:** OBS has its *own* WebSocket server in **Tools → WebSocket Server Settings**, often on port `4455`. That separate server is only for software that controls OBS. The chat overlay here talks directly to **Streamer.bot's** WebSocket server on port `8080`.

## Part 3 — Download and prepare the overlay
### Step 5: Download the project
1. On this repository's main GitHub page, click **Code → Download ZIP**.
2. Extract the archive and find the `overlay` folder.
3. Copy that entire folder into a permanent directory, for example:

```text
C:\OBS-Chat-Overlay\
├── index.html
├── overlay.js
└── style.css
```

Keep the three files together. You should use the **`overlay`** folder for OBS — **not** `docs/index.html` (which is the guide website).

### Step 6: Edit settings (optional)
Open `overlay.js` with Notepad or an editor such as VS Code. At the top:

```js
const MAX_MESSAGES = 8;       // How many chat bubbles stay at once
const MESSAGE_LIFETIME = 8000; // Each bubble disappears after 8 seconds
const DEMO_MODE = false;     // Set to true to test without streaming
```

The default settings work for a single PC with Streamer.bot using its default local WebSocket server. Change the host or port only if you also changed them in Streamer.bot.

**Do not publish** your Streamer.bot password, tokens, or personal Social Stream Ninja session ID in a public commit. Use the shared defaults in the public copy; put personalized settings only in your local copy.
## Part 4 — Put the overlay on OBS
### Step 7: Add a Browser Source
1. Open **OBS Studio** and select the scene where chat should appear.
2. In the **Sources** dock, click **+ → Browser**.
3. Choose **Create New** and name it `Custom Chat Overlay`.
4. Check **Local file**.
5. Click **Browse**, then select **`C:\OBS-Chat-Overlay\index.html`** (or wherever you placed your overlay).
6. Use **Width: `800`** and **Height: `600`** as a starting point; adjust both to fit your stream layout. The chat is aligned to the *bottom-left of this Browser Source*, not necessarily the entire OBS scene.
7. Leave **Custom CSS** blank; the supplied `style.css` should also already control the design. otherwise:
```js
:root {
  --chat-max-width: 500px;
  --chat-font-family: "Comfortaa";
}

html,
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-family: var(--chat-font-family);
}

.chat {
  position: absolute;
  left: 20px;
  bottom: 20px;
  max-width: var(--chat-max-width);
  display: flex;
  flex-direction: column;
}

.chat__item {
  background-color: rgba(0, 0, 0, 0.70);
  margin-top: 15px;
  padding: 4px 100px;
  border-radius: 10px;
  -webkit-text-stroke: 1px rgba(0, 0, 255, 0.1);

  /* make avatar + animation relative to this block */
  position: relative;

  /* ✨ bounce in + slide out left */
  animation: chatInOut 7s ease-in-out forwards;
  transform-origin: left center;
}

.chat__message {
  display: block;
  color: #ffffff;
  font-size: 24px;
  line-height: 1.3;
}

.chat__item .chat__metadata::before {
  content: "";
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--avatar-url) center/cover no-repeat;
  left: 18px;
  top: 32px;
}

/* Optional alt positioning:
   top: 50%;
   transform: translateY(-50%);
*/

.chat__avatar {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(0%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.chat__content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.chat__user {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  font-weight: 600;
  color: var(--line-user-color, #ffffff);
  font-size: 28px;
}

.status {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 8px;
  font-size: 11px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.7);
  color: #ddd;
}

/* 🔸 snap bounce in, stay, then slide + fade out left */
@keyframes chatInOut {
  /* start off-screen, invisible */
  0% {
    opacity: 0;
    transform: translateX(-140%) scale(0.9);
  }

  /* snap in quickly */
  3% {
    opacity: 1;
    transform: translateX(-20px) scale(1.05);
  }

  /* little overshoot bounce */
  8% {
    transform: translateX(6px) scale(1.02);
  }

  /* settle in place */
  12% {
    transform: translateX(0) scale(1);
  }

  /* stay visible */
  75% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }

  /* slide + fade out to the left */
  100% {
    opacity: 0;
    transform: translateX(-140%) scale(0.95);
  }
}
```
8. Press **OK** and position/resize the Browser Source in the OBS canvas. Place it **above the game/video source** in the Sources list so it can be seen.

The page itself is transparent, so only chat bubbles and temporary status labels are visible.

### Step 8: Test without going live
**Option A: Demo mode — recommended for first-time setup**
1. Set `const DEMO_MODE = true;` in your *local* `overlay.js` and save.
2. Right-click the Browser Source in OBS → **Properties** → **Refresh cache of current page** (or use its refresh option).
3. Colored example messages should start appearing every few seconds.
4. When the layout looks good, set `DEMO_MODE = false;` and refresh again.

**Option B: Real chat**
1. Confirm Streamer.bot's WebSocket server is running and the platform account is connected.
2. Keep `DEMO_MODE = false`.
3. Send a test message to your Twitch/Kick chat, or your active YouTube broadcast's live chat.
4. Watch the OBS source. A message should display with the chatter's name and then disappear after the configured lifetime.

You do **not** need to create a Streamer.bot Action just to listen to the built-in chat events; the client subscribes directly to them. Custom events are a more advanced, optional feature.

## Part 5 — Personalize the design
### Step 9: Edit the CSS

Open `style.css` and change the settings in `:root`:

```css
:root {
  --chat-max-width: 650px;
  --chat-font-family: 'Comfortaa', 'Segoe UI', sans-serif;
  --chat-font-size: 24px;
  --chat-username-size: 28px;
  --chat-background: rgba(0, 0, 0, 0.70);
  --chat-spacing: 15px;
  --avatar-size: 60px;
}
```

- Increase/decrease `--chat-max-width` to fit your scene.
- Change `--chat-background` transparency to suit the game/background.
- Adjust the two font sizes for readability.
- The overlay is anchored with `.chat { left: 20px; bottom: 20px; }`.
- The built-in profile/avatar strategy is controlled by `AVATAR_MODE` in `overlay.js`.
- Once you make changes, **refresh the Browser Source in OBS**.

**About avatars:** Kick and YouTube may provide profile image URLs. Twitch messages in this implementation use a Twitch platform icon unless you supply Twitch profile image URLs through a separate `General.Custom` event (`{type:"avatar",platform:"twitch",userId:"...",avatar:"https://..."}`).

### Step 10: Optional — Add TikTok / Instagram via Social Stream Ninja

**Skip this step if Twitch, YouTube, or Kick through Streamer.bot is enough.**

1. Visit [Social Stream Ninja](https://socialstream.ninja/) and follow its setup instructions to capture messages with its extension or supported sources.
2. Find your **session ID** in your own Social Stream Ninja setup.
3. In SSN's settings, enable **remote API control** and **Send chat messages to API server** as described in its [API guide](https://github.com/steveseguin/social_stream/blob/main/api.md).
4. In your *local* `overlay.js`, set:

```js
const SSN_ENABLED = true;
const SSN_SESSION_ID = "YOUR_PERSONAL_SESSION_ID";
```

5. Save and refresh OBS. The optional code listens to SSN's WebSocket **channel 4** for platforms including YouTube, TikTok, and Instagram.
6. To avoid duplicates, don't feed the same platform's messages through both SSN and Streamer.bot simultaneously.

Keep your personal session ID out of the public repository.

## Part 6 — Troubleshooting

| Problem | What to check |
| --- | --- |
| Source is blank, even in demo mode | `index.html`, `overlay.js`, and `style.css` must be together. Refresh the Browser Source. Check that `DEMO_MODE = true`. |
| "Disconnected from Streamer.bot" | Start the server under **Servers/Clients → WebSocket Server**; match host `127.0.0.1`, port `8080`, endpoint `/`. |
| "Streamer.bot client library could not load" | Check internet access; the page loads `@streamerbot/client` from jsDelivr. |
| Connected but no live messages | Connect the account in Streamer.bot, check your channel's chat is active, use `DEMO_MODE = false`, and make sure you chose a platform supported by the enabled route. |
| YouTube messages don't appear | Confirm Streamer.bot's broadcaster account is signed in and an actual livestream/live chat is being monitored. |
| Kick messages delayed | Kick uses webhooks in supported Streamer.bot versions, and delivery can sometimes be delayed. |
| Chat looks cut off | Increase the Browser Source width/height and `--chat-max-width`, or move the OBS source. |
| No TikTok/Instagram messages | SSN is optional and disabled by default; verify its two settings, session ID, and channel 4 delivery. |
| Fonts or emotes missing | Check the online font/CDN/image connections, or use a local fallback font. |
| Messages appear twice | Avoid routing the same platform's messages through both SSN and Streamer.bot. |

For further debugging, open the overlay file in a browser and inspect the browser console, or use the OBS Browser Source's debugging facilities if available in your OBS version.

## Part 7 — Share this project on GitHub Pages

### Step 11: Create a public GitHub repository

1. Sign into [GitHub](https://github.com/).
2. Click **+ → New repository**.
3. Name it `obs-streamerbot-chat-overlay` (or your preferred name).
4. Choose **Public** and create the repository. It's okay to leave the repository empty at this point.

### Step 12: Upload the project files

1. Extract this entire project archive on your computer.
2. On GitHub, open your new repository and select **Add file → Upload files**.
3. Drag in all the extracted project files and folders **without adding another enclosing folder**. Make sure `README.md` is at the root and `docs/index.html` is under `docs/`.
4. Commit the upload. If you prefer Git, you can also commit/push this folder using GitHub Desktop.
5. Check that GitHub shows this structure:

```text
obs-streamerbot-chat-overlay/
├── README.md              ← GitHub repository guide
├── overlay/               ← Files to download and use in OBS
│   ├── index.html
│   ├── overlay.js
│   └── style.css
└── docs/                  ← Public tutorial website
    ├── index.html
    └── .nojekyll
```

### Step 13: Enable the public GitHub Pages website

1. In the repository, open **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select the **`main`** branch and the **`/docs`** folder.
4. Click **Save**.
5. After the Pages deployment finishes, use **Visit site** in GitHub's Pages settings.

Your guide will normally have an address like:

```text
https://YOUR_USERNAME.github.io/obs-streamerbot-chat-overlay/
```

Replace the username and repository name with your own. This **public site explains the setup**; the **local `overlay/index.html` file is what OBS should load** for the Streamer.bot connection.

### Step 14: Make the project your own

- Update the title, introduction, author credit, and example text to match your project.
- Add your own screenshots or GIF of the overlay in OBS, if you have them.
- Choose a license if you want other people to reuse or modify the code; making a repository public alone is not the same as granting a license.
- Share both the GitHub repository link (for downloading files) and GitHub Pages link (for reading the tutorial).

---

## File explanations

| File | Job |
| --- | --- |
| `overlay/index.html` | Creates the invisible chat container and loads the script/client. |
| `overlay/overlay.js` | Connects to Streamer.bot, listens to events, renders messages, handles avatars and optional SSN. |
| `overlay/style.css` | Positions and styles the chat bubbles in OBS. |
| `docs/index.html` | Publishes the human-readable tutorial through GitHub Pages. |

### Changes made when preparing the public version

The working `overlay` folder is adapted from the supplied three files. I kept the same basic design and message processing but corrected the unmatched closing CSS brace, replaced the too-small `100px` chat width with a configurable sensible default, enabled the existing YouTube subscription, normalized official Twitch emote field names, corrected the YouTube avatar property, explicitly wired up optional SSN, and added a non-live demo mode.

## References and official guides

- [OBS Studio Download](https://obsproject.com/download/)
- [OBS Browser Source documentation](https://obsproject.com/kb/browser-source)
- [Streamer.bot Installation](https://docs.streamer.bot/get-started/installation)
- [Streamer.bot Twitch setup](https://docs.streamer.bot/guide/platforms/twitch)
- [Streamer.bot YouTube setup](https://docs.streamer.bot/guide/platforms/youtube)
- [Streamer.bot Kick setup](https://docs.streamer.bot/guide/platforms/kick)
- [Streamer.bot WebSocket server configuration](https://docs.streamer.bot/api/websocket/guide/configuration)
- [Streamer.bot client documentation](https://streamerbot.github.io/client/get-started/installation)
- [Social Stream Ninja API](https://socialstream.ninja/docs/commands.html)
- [GitHub Pages publishing guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

**Enjoy building your own chat overlay!**
