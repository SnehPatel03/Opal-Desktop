# Opal Desktop

The Electron recorder is a separate application from the Opal website and
Express backend. Its release installers are linked from the website dashboard's
**Upload** action.

## Local development

Copy `.env.example` to `.env`, use the development Clerk publishable key, and
set `VITE_SOCKET_URL` to the local Express URL (normally
`http://localhost:5001`) and `VITE_API_BASE_URL` to the local web API (normally
`http://localhost:3000/api`). Then run `npm ci` and `npm run dev`.

## Production releases

1. Deploy the independent `Opal-expres-app` service on Render and confirm its
   `/health` endpoint responds successfully.
2. In the `Opal-Desktop` GitHub repository, add Actions variables:
   - `VITE_SOCKET_URL`: the Render HTTPS service URL, without an API path.
   - `VITE_API_BASE_URL`: the production website API URL ending in `/api`,
     for example `https://opal-beige.vercel.app/api`.
   - `VITE_CLERK_PUBLISHABLE_KEY`: the production Clerk publishable key.
3. Set the package version in `package.json` for the release.
4. Push a matching version tag, for example `v1.0.0`. The desktop release
   workflow builds Windows, macOS, and Linux installers and attaches them to a
   GitHub Release.
5. The website's **Upload** link opens the latest release so users can choose
   and install the right desktop installer.

The macOS installer is not notarized by default; distributing it without
Apple Developer signing/notarization can trigger macOS security warnings.
