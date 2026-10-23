OBS + Streamer.bot — Custom Multiplatform Chat Overlay
A friendly guide to setting up a custom on-stream chat box with OBS Studio, Streamer.bot, and a few HTML/CSS/JavaScript files.
Display Twitch, Kick, and YouTube chat in one configurable overlay. Optionally add TikTok, Instagram, and other chat through Social Stream Ninja. This project is based on my own three-file overlay (`index.html`, `overlay.js`, and `style.css`). I am sharing how it works so you can create your own version!
> **Start here:** The published tutorial is in [`docs/index.html`](docs/index.html). If GitHub Pages is enabled, use the site's URL in the repository's **Settings → Pages**.
What it looks like
Messages appear near the bottom-left of a transparent OBS Browser Source. Each message has a rounded dark background, a colored username, a message, and an avatar or platform icon. Messages disappear automatically after 8 seconds by default.
Supported routes
Chat source	How the overlay receives it	Status in the supplied code
Twitch	Streamer.bot `Twitch.ChatMessage`	Enabled
Kick	Streamer.bot `Kick.ChatMessage`	Enabled; Kick connection requires a supported Streamer.bot version
YouTube	Streamer.bot `YouTube.Message`	Enabled; requires live-chat events to be received
Custom messages	Streamer.bot `General.Custom`	Enabled; requires your own matching custom events
TikTok / Instagram / YouTube via Social Stream Ninja	SSN channel 4 (`wss://io.socialstream.ninja/...`)	Optional and disabled until configured
Not every platform needs to be connected. Use only the platforms that you stream on. If both Streamer.bot and SSN deliver the same chat, it may show up twice; use only one route for that platform.
---
Requirements
A Windows PC running OBS Studio and Streamer.bot. This walkthrough uses their Windows layouts; Streamer.bot support on macOS and Linux is experimental.
A Twitch, Kick, and/or YouTube account, depending on where you stream.
Internet access for the CDN-hosted official Streamer.bot WebSocket client and optional external avatar/emote images.
This repository's `overlay` folder. You do not need to install Node.js, Visual Studio, or a web server.
Part 1 — Install the streaming software
Step 1: Download and install OBS Studio
Open https://obsproject.com/download/ and download OBS for your operating system.
Run the installer, launch OBS, and follow its initial auto-configuration if prompted.
In Scenes, create a scene for your broadcast if you do not already have one.
Keep OBS installed; you'll add the chat Browser Source after configuring Streamer.bot.
Step 2: Download and open Streamer.bot
Open https://streamer.bot/ and download the latest stable release for Windows.
Extract the ZIP into a permanent folder such as `C:\Streamer.bot\` (do not run it directly from the ZIP).
Open `Streamer.bot.exe` from the extracted folder.
Avoid a cloud-synced application folder and do not run as administrator unless you have a specific reason.
Streamer.bot is a portable application, so it does not need a traditional installer.
Part 2 — Connect chat and WebSocket events
Step 3: Connect the chat platform(s) you use
Inside Streamer.bot, connect your own broadcaster account under the appropriate platform settings:
Twitch: `Platforms → Twitch → Accounts` → sign in with your broadcaster account and approve permissions.
YouTube: `Platforms → YouTube → Accounts` → Sign in with Google under Broadcaster Account. Configure an active live broadcast so Streamer.bot can receive live chat; enable Auto Connect.
Kick: `Platforms → Kick` → follow the current Kick setup guide. The Kick integration requires Streamer.bot v1.0.0 or later and its website integration.
You only need to connect accounts for the platforms you want displayed. An OBS-to-Streamer.bot control connection is not required just to display this chat overlay.
Step 4: Turn on Streamer.bot's WebSocket server
In Streamer.bot, go to Servers/Clients → WebSocket Server.
Set Address/Host to `127.0.0.1`.
Set Port to `8080`.
Set Endpoint to `/`.
Check Auto Start and click Start Server if the server is not running.
Keep Authentication/Enforce off for this simplest loopback-only example, unless you plan to configure a password locally. Do not open this port to the public internet.
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
IMPORTANT: OBS has its own WebSocket server in Tools → WebSocket Server Settings, often on port `4455`. That separate server is only for software that controls OBS. The chat overlay here talks directly to Streamer.bot's WebSocket server on port `8080`.
Part 3 — Download and prepare the overlay
Step 5: Download the project
On this repository's main GitHub page, click Code → Download ZIP.
Extract the archive and find the `overlay` folder.
Copy that entire folder into a permanent directory, for example:
```text
C:\OBS-Chat-Overlay\
├── index.html
├── overlay.js
└── style.css
```
Keep the three files together. You should use the `overlay` folder for OBS — not `docs/index.html` (which is the public guide website).
Step 6: Edit settings (optional)
Open `overlay.js` with Notepad or an editor such as VS Code. At the top:
```js
const MAX_MESSAGES = 8;       // How many chat bubbles stay at once
const MESSAGE_LIFETIME = 8000; // Each bubble disappears after 8 seconds
const DEMO_MODE = false;     // Set to true to test without streaming
```
The default settings work for a single PC with Streamer.bot using its default local WebSocket server. Change the host or port only if you also changed them in Streamer.bot.
Do not publish your Streamer.bot password, tokens, or personal Social Stream Ninja session ID in a public commit. Use the shared defaults in the public copy; put personalized settings only in your local copy.
Part 4 — Put the overlay on OBS
Step 7: Add a Browser Source
Open OBS Studio and select the scene where chat should appear.
In the Sources dock, click + → Browser.
Choose Create New and name it `Custom Chat Overlay`.
Check Local file.
Click Browse, then select `C:\OBS-Chat-Overlay\index.html` (or wherever you placed your overlay).
Use Width: `800` and Height: `600` as a starting point; adjust both to fit your stream layout. The chat is aligned to the bottom-left of this Browser Source, not necessarily the entire OBS scene.
Leave the Custom CSS field empty. The overlay automatically loads its single stylesheet, `style.css`, from the same folder as `index.html`. Customize that file whenever you want to change the design.
Press OK and position/resize the Browser Source in the OBS canvas. Place it above the game/video source in the Sources list so it can be seen.
The page itself is transparent, so only chat bubbles and temporary status labels are visible.
Step 8: Test without going live
Option A: Demo mode — recommended for first-time setup
Set `const DEMO_MODE = true;` in your local `overlay.js` and save.
Right-click the Browser Source in OBS → Properties → Refresh cache of current page (or use its refresh option).
Colored example messages should start appearing every few seconds.
When the layout looks good, set `DEMO_MODE = false;` and refresh again.
Option B: Real chat
Confirm Streamer.bot's WebSocket server is running and the platform account is connected.
Keep `DEMO_MODE = false`.
Send a test message to your Twitch/Kick chat, or your active YouTube broadcast's live chat.
Watch the OBS source. A message should display with the chatter's name and then disappear after the configured lifetime.
You do not need to create a Streamer.bot Action just to listen to the built-in chat events; the client subscribes directly to them. Custom events are a more advanced, optional feature.
Part 5 — Personalize the design
Step 9: Edit the CSS
Open `style.css` and change the settings in `:root`:
```css
:root {
  --chat-max-width: 500px;
  --chat-font-family: 'Comfortaa', 'Segoe UI', sans-serif;
  --chat-font-size: 24px;
  --chat-username-size: 28px;
  --chat-background: rgba(0, 0, 0, 0.70);
  --chat-spacing: 15px;
  --avatar-size: 60px;
  --animation-duration: 7s;
}
```
Increase/decrease `--chat-max-width` to fit your scene.
Change `--chat-background` transparency to suit the game/background.
Adjust the two font sizes for readability.
The overlay is anchored with `.chat { left: 20px; bottom: 20px; }`.
The built-in profile/avatar strategy is controlled by `AVATAR_MODE` in `overlay.js`.
Once you make changes, refresh the Browser Source in OBS.
One CSS file, no duplication: `overlay/index.html` already contains `<link rel="stylesheet" href="style.css" />`. You do not need to paste anything into OBS's Custom CSS field. Keep that field empty so it does not override your settings. To update the appearance, edit only `overlay/style.css`, save, and refresh the Browser Source in OBS.
Animation: Each message bounces in, stays visible, then slides left while fading out over 7 seconds. The JavaScript currently removes it from the document at 8 seconds (`MESSAGE_LIFETIME = 8000` in `overlay.js`). Keep the JavaScript lifetime at least as long as the animation to avoid cutting it off.
About avatars: Kick and YouTube may provide profile image URLs. Twitch messages start with a platform icon until the optional Streamer.bot avatar action broadcasts a profile image through `General.Custom` (see Step 9A below).
Optional Step 9A: Display real Twitch profile pictures with Streamer.bot C#
Twitch chat events display immediately using a Twitch icon until a user's profile image has been received. To send profile images to the overlay, this project includes `streamerbot/twitch-avatar.cs`, the original C# script used for this overlay. Streamer.bot runs the script; it is not loaded by OBS or by `overlay.js` as a separate browser script.
In Streamer.bot → Actions, create a new action (for example, OBS Chat — Twitch Avatars).
Add the Twitch → Chat Message trigger to that action. This action will run for each incoming Twitch chat message. You can keep the overlay's built-in `Twitch.ChatMessage` subscription; this action only sends avatar information, not another chat message.
Add the Twitch sub-action Get User Info for Target. Set User Login to `%userName%` (the chatting user's username). This step populates `targetUserId` and `targetUserProfileImageUrl` for the subsequent C# code.
After that, add a Core → C# → Execute C# Code sub-action, then paste the full contents of `streamerbot/twitch-avatar.cs`. Choose Save and Compile (or the equivalent compile button in your version).
Confirm that Servers/Clients → WebSocket Server is running, then save the action and send a Twitch message while OBS shows the overlay. You should see the sender's avatar replace their Twitch icon (if their profile image was fetched).
The order of the two sub-actions is important: the C# script reads variables created by Get User Info for Target. Without that step it logs `Missing targetUserId or targetUserProfileImageUrl` and does not send an avatar. Check Action History → Inspect Variables After Run when debugging missing values.
This code broadcasts a JSON object such as:
```json
{"type":"avatar","platform":"twitch","userId":"123456","avatar":"https://example.com/avatar.png"}
```
The JavaScript receives it through Streamer.bot's `General.Custom` WebSocket event, stores the avatar by Twitch user ID, and updates any currently displayed matching messages. The chat itself comes from the normal `Twitch.ChatMessage` event. Because an avatar lookup can take time, a message may briefly show the platform icon first. For profile pictures, keep `AVATAR_MODE = "logoFallback"` (default) or `"profileFirst"`, not `"logoOnly"`.
Notes: The action can perform a Twitch user info lookup on each chat message; busy channels may want to cache/reuse results rather than repeatedly requesting the same profile. The included script is original as supplied and is intended to be pasted in Streamer.bot. Profile-image fetching has not been verified against a live Streamer.bot instance by this repository's automated checks.
Step 10: Optional — Add TikTok / Instagram via Social Stream Ninja
Skip this step if Twitch, YouTube, or Kick through Streamer.bot is enough.
Visit Social Stream Ninja and follow its setup instructions to capture messages with its extension or supported sources.
Find your session ID in your own Social Stream Ninja setup.
In SSN's settings, enable remote API control and Send chat messages to API server as described in its API guide.
In your local `overlay.js`, set:
```js
const SSN_ENABLED = true;
const SSN_SESSION_ID = "YOUR_PERSONAL_SESSION_ID";
```
Save and refresh OBS. The optional code listens to SSN's WebSocket channel 4 for platforms including YouTube, TikTok, and Instagram.
To avoid duplicates, don't feed the same platform's messages through both SSN and Streamer.bot simultaneously.
Keep your personal session ID out of the public repository.
Part 6 — Troubleshooting
Problem	What to check
Source is blank, even in demo mode	`index.html`, `overlay.js`, and `style.css` must be together. Refresh the Browser Source. Check that `DEMO_MODE = true`.
"Disconnected from Streamer.bot"	Start the server under Servers/Clients → WebSocket Server; match host `127.0.0.1`, port `8080`, endpoint `/`.
"Streamer.bot client library could not load"	Check internet access; the page loads `@streamerbot/client` from jsDelivr.
Connected but no live messages	Connect the account in Streamer.bot, check your channel's chat is active, use `DEMO_MODE = false`, and make sure you chose a platform supported by the enabled route.
YouTube messages don't appear	Confirm Streamer.bot's broadcaster account is signed in and an actual livestream/live chat is being monitored.
Kick messages delayed	Kick uses webhooks in supported Streamer.bot versions, and delivery can sometimes be delayed.
Chat looks cut off	Increase the Browser Source width/height and `--chat-max-width`, or move the OBS source.
No TikTok/Instagram messages	SSN is optional and disabled by default; verify its two settings, session ID, and channel 4 delivery.
Fonts or emotes missing	Check the online font/CDN/image connections, or use a local fallback font.

Messages appear twice	Avoid routing the same platform's messages through both SSN and Streamer.bot.
For further debugging, open the overlay file in a browser and inspect the browser console, or use the OBS Browser Source's debugging facilities if available in your OBS version.
Part 7 — Share this project on GitHub Pages
Step 11: Create a public GitHub repository
Sign into GitHub.
Click + → New repository.
Name it `obs-streamerbot-chat-overlay` (or your preferred name).
Choose Public and create the repository. It's okay to leave the repository empty at this point.
Step 12: Upload the project files
Extract this entire project archive on your computer.
On GitHub, open your new repository and select Add file → Upload files.
Drag in all the extracted project files and folders without adding another enclosing folder. Make sure `README.md` is at the root and `docs/index.html` is under `docs/`.
Commit the upload. If you prefer Git, you can also commit/push this folder using GitHub Desktop.
Check that GitHub shows this structure:
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
Step 13: Enable the public GitHub Pages website
In the repository, open Settings → Pages.
Under Build and deployment, choose Deploy from a branch.
Select the `main` branch and the `/docs` folder.
Click Save.
After the Pages deployment finishes, use Visit site in GitHub's Pages settings.
Your guide will normally have an address like:
```text
https://YOUR_USERNAME.github.io/obs-streamerbot-chat-overlay/
```
Replace the username and repository name with your own. This public site explains the setup; the local `overlay/index.html` file is what OBS should load for the Streamer.bot connection.
Step 14: Make the project your own
Update the title, introduction, author credit, and example text to match your project.
Add your own screenshots or GIF of the overlay in OBS, if you have them.
Choose a license if you want other people to reuse or modify the code; making a repository public alone is not the same as granting a license.
Share both the GitHub repository link (for downloading files) and GitHub Pages link (for reading the tutorial).
---
File explanations
File	Job
`overlay/index.html`	Creates the invisible chat container and loads the script/client.
`overlay/overlay.js`	Connects to Streamer.bot, listens to events, renders messages, handles avatars and optional SSN.
`overlay/style.css`	Positions and styles the chat bubbles in OBS.
`streamerbot/twitch-avatar.cs`	Optional Streamer.bot C# sub-action that broadcasts Twitch avatar images.
`docs/index.html`	Publishes the human-readable tutorial through GitHub Pages.
Changes made when preparing the public version
The working `overlay` folder is adapted from the supplied three files. I kept the same basic design and message processing but corrected the unmatched closing CSS brace, replaced the too-small `100px` chat width with a configurable sensible default, enabled the existing YouTube subscription, normalized official Twitch emote field names, corrected the YouTube avatar property, explicitly wired up optional SSN, and added a non-live demo mode.
References and official guides
OBS Studio Download
OBS Browser Source documentation
Streamer.bot Installation
Streamer.bot Twitch setup
Streamer.bot YouTube setup
Streamer.bot Kick setup
Streamer.bot WebSocket server configuration
Streamer.bot Get User Info for Target
Streamer.bot General.Custom event schema
Streamer.bot client documentation
Social Stream Ninja API
GitHub Pages publishing guide
Enjoy building your own chat overlay!
