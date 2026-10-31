# FairDose

This repository contains two independent React/Vite applications:

- The FairDose user-facing app is at the repository root.
- The FairDose Admin dashboard is in `admin/`.

Each app has its own `package.json`, lockfile, Vite configuration, and build output. Run commands from the corresponding app directory:

```sh
# User app
npm install
npm run dev
npm run build

# Admin app
cd admin
npm install
npm run dev
npm run build
```

## Deployment

Keep the two apps as separate hosting projects, using the same Git repository:

| App | Hosting project root directory | Build command | Output directory |
| --- | --- | --- | --- |
| FairDose user app | `.` | `npm run build` | `dist` |
| FairDose Admin | `admin` | `npm run build` | `dist` |

Update the root directory for each existing hosting project in its provider dashboard. This preserves the apps' separate deployments and URLs; no hosting configuration is managed by this repository.

## OCR key and Firebase security

The user app sends prescription images to the same-origin `/api/vision` Vercel Function. Set `GOOGLE_VISION_API_KEY` and `FAIRDOSE_ALLOWED_ORIGINS` in the **user app's Vercel project** environment variables for Production and any other deployment environments you use. The allowed-origins value is a comma-separated list of exact origins, for example `https://fairdose.vercel.app`. Never use a `VITE_` prefix for the Vision key. For local development with OCR, run the app using `vercel dev` and configure these variables locally in an ignored `.env.local` file; the regular Vite dev server does not provide the API function.

The Vision key previously committed to this repository must be rotated or revoked in Google Cloud; removing it from the current source does not remove it from Git history. Restrict the replacement key to the Vision API and configure usage quotas. The API function also checks request origin, image type, and image size, but origin checks are not authentication; use Vercel Firewall rate limits and provider quotas to reduce abuse.

Firebase web-app configuration is public client configuration, not a private key, and will remain visible in browser code. Protect Firestore data with Firebase Security Rules: the user app needs only its intended read access, and medicine writes should be limited to admins. The admin app's sign-in screen is not a substitute for server-enforced Firestore rules. Review Firebase rules, Authentication settings, and API-key restrictions in the Firebase/Google Cloud consoles.
