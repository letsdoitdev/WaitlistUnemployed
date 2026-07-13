# Unemployed — pre-launch waitlist

A standalone waitlist landing page for **Unemployed: The Side Quest App**.
One static page, no framework, no build step. The form writes straight to a
Supabase table from the browser.

```
index.html   the page
styles.css   the look
app.js       the form logic + Supabase config
```

## 1. Set up Supabase

Create a project at [supabase.com](https://supabase.com), then open
**SQL Editor** and run this:

```sql
-- waitlist table
create table public.waitlist (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null unique,
  created_at timestamptz default now()
);

-- lock it down
alter table public.waitlist enable row level security;

-- the ONLY policy: anonymous visitors may insert their own row.
-- no select / update / delete policies exist, so the anon key
-- can never read, change, or delete the list.
create policy "anon can join waitlist"
  on public.waitlist
  for insert
  to anon
  with check (true);
```

That's the whole backend. Signups go in; nothing comes back out through the
public API. Read the list from the Supabase dashboard (Table Editor), which
uses your authenticated session, not the anon key.

## 2. Paste your keys

In your Supabase dashboard go to **Project Settings → API** and copy:

- **Project URL** (looks like `https://abcdefgh.supabase.co`)
- **anon public** key

Open `app.js` and replace the two placeholder constants at the very top:

```js
const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co"; // <-- replace
const SUPABASE_ANON_KEY = "YOUR-SUPABASE-ANON-KEY";          // <-- replace
```

The anon key is designed to be public — it ships to every browser. The RLS
policy above is what keeps the list private.

## 3. Deploy to Vercel (drag and drop)

1. Go to [vercel.com/new](https://vercel.com/new) (sign in first).
2. Drag this whole folder onto the page — no Git repo needed.
3. Click **Deploy**. Done. You get a live URL in about a minute.

Any static host works the same way (Netlify drop, Cloudflare Pages, an S3
bucket) — it's just three files.

## Notes

- **Duplicate signups** return HTTP 409 from Supabase; the page treats that
  as "you're already on the list" and shows the success state, not an error.
- **Honeypot**: the form contains a hidden `website` field. Bots that fill it
  get a fake success screen and nothing is sent anywhere.
- The insert request uses `Prefer: return=minimal`, so it works without any
  select policy on the table.
