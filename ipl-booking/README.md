# IPL Ticket Booking

## Supabase setup

1. Create a Supabase project.
2. In the project's SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql). It creates the `matches` and `bookings` tables, seeds sample matches, enables match reads and Realtime, and adds an atomic booking function that checks and reduces seat availability.
3. Copy `.env.example` to `.env.local`. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the project's Connect/API Keys dashboard. The publishable key is intended for browser use; never use a service-role key here.
4. From this directory, run `npm install` and `npm run dev`.
5. Select a match, enter booking details, and submit. Confirm the new row in the Supabase Table Editor under `bookings`; the corresponding `matches.available_seats` count will decrease and update live in the app.

The sample match dates and prices are demo data. Replace them with current match information in the SQL Editor.
