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
