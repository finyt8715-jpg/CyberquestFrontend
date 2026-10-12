# CyberQuest web (frontend only, for Vercel)

The CyberQuest cyber awareness game as a static website: five levels (phishing inbox, firewall shooter, desk inspector, voice trap,
data sorter), quizzes, scores, daily board and rewards. No server and no database. Progress is saved in each player's browser.

```
src/cyberquest.html   the single game source (edit this)
scripts/build.js      builds public/ (page, script, voice manifest). Vercel runs it on every deploy
public/               what gets served: index.html, app.js, config.js, favicon, 404, audio/voice/
vercel.json           security headers, caching and build settings
docs/voice-script.md  every caller line and the file name to record it under
```

## Deploy on Vercel

1. Put this folder in a Git repository (GitHub, GitLab or Bitbucket).
2. In Vercel choose **Add New → Project**, import the repository and click **Deploy**. Nothing else to set: `vercel.json` already tells Vercel
   to run `node scripts/build.js` and serve `public/`. No environment variables are needed.
   (CLI alternative: `npm i -g vercel`, then `vercel --prod` in this folder.)
3. **Custom domain:** Project → Settings → Domains → add `cyberquest.innovatiview.com`, then create the DNS record Vercel shows
   (usually a CNAME to `cname.vercel-dns.com`). HTTPS is automatic.
4. **Who can open it:** a new Vercel deployment is public to anyone with the link. If it should be company only, turn on
   *Settings → Deployment Protection* (Vercel Authentication limits it to your Vercel team; password protection needs a paid plan), or put
   your company SSO in front (for example Cloudflare Access). The site already asks search engines not to index it.

Preview locally: `npm run dev` then open http://localhost:3000.

## Change the game

Edit `src/cyberquest.html` (levels, quiz questions, emails, rewards and scores are all in it), then `npm run build` and commit.
Vercel rebuilds on every push. Check the result in a preview deployment first (every branch gets its own URL).

## Add your own voices (Level 4)

1. Open `docs/voice-script.md`. It lists the 11 caller lines and the file name for each (`c1-a.mp3`, `c1-b.mp3` ...).
2. Record each line with any tool (phone, Audacity, a studio) and save it under that name as mp3, m4a, webm, ogg or wav.
3. Copy the files into `public/audio/voice/`, commit and push. The build detects them and updates `manifest.json`.

Lines without a file keep the built-in synthetic voice, so you can record only some of them. If you change the call scripts, run
`node scripts/voice-script.js` to refresh the list.

To record inside the game: set `window.CQ_DEMO = true` in `public/config.js` **on your own computer only**, run `npm run dev`, open
`http://localhost:3000/?admin=1`, go to Admin → Voice recordings, record and press Download for each line. **Set `CQ_DEMO` back to `false`
before you commit.** With `true`, the Admin tools can unlock every level and award points.

## What this version does and does not do

It works well for running the awareness programme, a pilot or a demo. Because there is no server:

* Progress, scores and reward codes live in the browser on one device. Clearing the browser data resets the player.
* The daily board shows sample players next to the current player. There is no shared leaderboard.
* Reward codes are not verified by any system, and a technically skilled player could edit their saved score or read the quiz answers in the
  page code. Have HR confirm real rewards, or use the server version (`cyberquest-server.zip`), which grades quizzes, validates scores, shares
  one leaderboard and verifies reward claims.
* Admin tools are switched off in production (`CQ_DEMO=false`), so players cannot unlock levels or award themselves points through the app.

Moving to the server later: deploy the server package, then in `vercel.json` add rewrites that send `/api/*` and `/audio/voice/*` to it,
and set `window.CQ_SERVER = true` in `public/config.js`. Ask if you want this prepared as a ready-made variant.

## Security notes

* `vercel.json` sets a strict Content-Security-Policy (`script-src 'self'`, no inline scripts, only Google Fonts as an external source),
  no framing, `nosniff`, no referrer, HSTS and a permissions policy.
* There are no third-party scripts, cookies or analytics. The only data stored is the player's name and progress in `localStorage`.
* To avoid Google Fonts entirely, host the three font files yourself and remove the Google Fonts `<link>` and the two Google hosts from the CSP.
