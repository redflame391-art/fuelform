# FuelForm PWA

FuelForm is a responsive, installable Progressive Web App MVP for personal nutrition tracking.

## Included now
- Responsive desktop and mobile UI
- Daily calorie and macro dashboard (default 3000 kcal, 190 g protein, 375 g carbs, 82 g fat)
- Manual food logging with quantity scaling and edit-by-delete/re-add workflow
- Five eating occasions and automatic daily totals
- Hydration quick-add
- Weight records
- History summaries and CSV export
- Editable calorie, macro, weight and hydration targets
- PWA manifest and service worker for install/offline shell
- Dark purple visual system (#0B0B0F / #8B5CF6)

## Important limitations
- Current version stores data in browser localStorage. It does **not** sync between devices.
- The included `supabase-schema.sql` is a secure database starting point, not an active integration. Cloud sync requires creating a Supabase project, enabling authentication, configuring keys, and implementing sync logic.
- Food entries are manual. Barcode lookup, nutrition API, photo analysis and label OCR are not implemented.
- The food checker, recipe manager, training log and detailed micronutrient analytics are not implemented in this initial runnable MVP.
- Back up/export your logs. Clearing browser storage may erase local records.

## Publish on the web at no cost (typical free-tier path)
1. Create a GitHub account if needed.
2. Create a new repository named `fuelform`.
3. Upload all files in this folder to the repository root.
4. Open **Settings → Pages** in the repository.
5. Under build and deployment, select **Deploy from a branch**, choose `main` and `/ (root)`, then save.
6. Wait for GitHub Pages to publish and open the provided URL. The app requires HTTPS for service-worker installation.
7. On iPhone, open the URL in Safari → Share → Add to Home Screen. On Android, open in Chrome → menu → Install app / Add to Home screen.
8. Open the same URL on desktop and phone. **The website will load on both, but local data remains separate per browser until cloud sync is implemented.**

## Enable true cross-device sync (next development step)
1. Create a Supabase project and configure email authentication.
2. Run `supabase-schema.sql` in the Supabase SQL editor.
3. Add a login flow and the Supabase client to this app.
4. Implement authenticated CRUD and initial sync for food logs, weight records, profile, targets and hydration.
5. Test RLS policies and sync conflict handling before entering sensitive personal records.

The Supabase anon/publishable key may be used in browser apps when Row Level Security is correctly configured. Never put a service-role key in frontend code.

## Run locally
For a quick preview, open `index.html` in a browser. PWA/offline installation requires a local web server or HTTPS hosting. For a simple local server, run `python -m http.server 8000` in this folder and visit `http://localhost:8000`.
