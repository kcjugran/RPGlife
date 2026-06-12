# RPG Life — Synced Edition (PWA)

This is the cloud-synced version of RPG Life. Use it on your phone and
your PC at the same time — changes show up on both devices within a
second. Each user has their own private account.

## How it works

- Runs as a Progressive Web App in any browser (Chrome, Edge, Safari)
- Installable to your phone's home screen (looks and behaves like a
  native app)
- Uses Firebase (free tier) for accounts and sync
- Works offline — changes sync up when you reconnect

## What's in here

- `index.html`, `app.js`, `icons.js`, `vendor/` — the app
- `firebase-config.js` — **you edit this** with your Firebase project
  values (see SETUP.md)
- `sync.js` — talks to Firebase
- `manifest.json`, `sw.js`, `icons/` — PWA configuration
- `SETUP.md` — **read this first** — the one-time Firebase setup

## Quick start

1. **Set up Firebase once** — follow `SETUP.md`. Takes about 10
   minutes the first time. You only do this once, not every user.

2. **Deploy** — drag this folder to https://app.netlify.com/drop, or
   push to GitHub Pages. You get an HTTPS URL.

3. **Share the URL** — anyone who opens it can create their own
   account on the sign-in screen. Their data is private to them.

4. **Install to home screen** — on Android Chrome, the three-dot menu
   has "Install app". On iPhone Safari, it's the Share button → "Add
   to Home Screen".

## Updating

When you change files and re-deploy:

1. Bump `CACHE_NAME` in `sw.js` (e.g. `'rpglife-v2'` → `'rpglife-v3'`).
   This tells installed apps to grab the new files.
2. Re-upload. Existing users get the update automatically next time
   they open the app.

## Costs

Free, as long as you stay on Firebase's free tier. For a
personal/family tracker with a handful of users, you won't come close
to the limits. See the bottom of `SETUP.md` for specifics.
