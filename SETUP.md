# RPG Life — Firebase Setup

This version of RPG Life syncs your data across devices using Firebase
(a free service from Google). Each user has their own private account;
data is only visible to the person who created it.

You only need to do this setup once. Anyone you share the app with
afterwards just creates an account on the sign-in screen — they don't
need to do any of this.

---

## Step 1 — Create a Firebase project

1. Go to https://console.firebase.google.com and sign in with a Google
   account.

2. Click **"Add project"** (or **"Create a project"** if it's your
   first one).

3. Enter a project name — e.g. `rpglife`. Continue.

4. **Google Analytics**: turn this OFF (you don't need it for a
   personal tracker, and skipping it makes setup simpler). Click
   **Create project**. Wait ~30 seconds.

5. When ready, click **Continue** to enter your project dashboard.

---

## Step 2 — Enable Email/Password authentication

1. In the left sidebar, click **Build → Authentication**.

2. Click **Get started**.

3. Under "Sign-in providers", click **Email/Password**.

4. Toggle the first switch (**Enable**) to ON. Leave "Email link
   (passwordless)" OFF. Click **Save**.

---

## Step 3 — Create the Firestore database

1. In the left sidebar, click **Build → Firestore Database**.

2. Click **Create database**.

3. Choose a location — pick one closest to where you live (e.g.
   `asia-south1` for India, `us-central` for the US). **This cannot
   be changed later**, so pick once carefully.

4. **Start in production mode** (not test mode). Click **Create**.

5. Wait ~20 seconds for it to provision.

---

## Step 4 — Set up security rules

This is the most important step. Without it, anyone could read or
write anyone else's data. With it, each user can only access their
own document.

1. Inside Firestore Database, click the **Rules** tab at the top.

2. Replace whatever's there with this exactly:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null
                            && request.auth.uid == userId;
       }
     }
   }
   ```

3. Click **Publish**.

This says: "A user can only read or write the document at
`users/{their-own-uid}`. Nothing else."

---

## Step 5 — Register the app and get your config

1. In the Firebase console, click the **gear icon** at the top-left
   (next to "Project Overview") → **Project settings**.

2. Scroll to **"Your apps"** at the bottom.

3. Click the **`</>` Web icon** to add a web app.

4. Enter an app nickname — e.g. `rpglife-web`. **Do NOT check**
   "Also set up Firebase Hosting". Click **Register app**.

5. Firebase will show you a code block that contains a
   `firebaseConfig` object. It looks like:

   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "rpglife-xxxxx.firebaseapp.com",
     projectId: "rpglife-xxxxx",
     storageBucket: "rpglife-xxxxx.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abcdef..."
   };
   ```

6. Copy these six values.

---

## Step 6 — Paste your config into the app

1. Open `firebase-config.js` (in the app folder) in any text editor
   (Notepad is fine).

2. Replace the placeholder values with your real ones. The file should
   end up looking like the example below (your actual values will be
   different):

   ```js
   window.FIREBASE_CONFIG = {
     apiKey: "AIzaSy...your-real-key...",
     authDomain: "rpglife-xxxxx.firebaseapp.com",
     projectId: "rpglife-xxxxx",
     storageBucket: "rpglife-xxxxx.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abcdef..."
   };
   ```

3. Save the file.

---

## Step 7 — Deploy

Same as before — drag the folder to Netlify Drop, or push to GitHub
Pages. The URL you get is the one you and your family/partner share.

When someone opens it, they'll see a sign-in screen. They tap "Create
one" and make their own account with their email and a password (6+
characters). After that, they can sign in from any device with the
same email/password, and their data follows them.

---

## What about the apiKey being in a public file?

This is fine, and it's how Firebase is designed to work for client
apps. The apiKey is a project identifier, not a secret password.
Security comes from the Firestore Rules you set up in Step 4 — those
rules are what actually keep one user's data private from another.

The official Firebase docs confirm this:
https://firebase.google.com/docs/projects/api-keys

---

## Common things that go wrong

**"Firebase couldn't connect"** on first load:
Most likely cause is a typo in `firebase-config.js`. Open Chrome's
DevTools (F12) → Console tab to see the actual error message.

**"Permission denied"** when signing in:
Forgot Step 4 (security rules). Go back and publish the rules above.

**Can't sign up — "auth/operation-not-allowed"**:
Forgot Step 2 — Email/Password auth isn't enabled. Enable it.

**Sync indicator stuck on "Syncing..."**:
Probably a Firestore rules issue. Open DevTools console and look for
red "FirebaseError: Missing or insufficient permissions" messages.

---

## Free tier limits (for reference)

For a personal/family tracker, you'll never get close to these:

- **50K document reads/day** — you'd need to refresh the app 1000
  times a day to hit this.
- **20K writes/day** — every change you make is a write, but our
  app debounces writes to roughly one per second of activity, so
  you'd need to be logging non-stop for hours to dent this.
- **1 GiB storage** — your entire state probably weighs <50 KB.

If you ever hit the limits, Firebase pauses (it doesn't bill you)
unless you've explicitly upgraded to a paid plan.
