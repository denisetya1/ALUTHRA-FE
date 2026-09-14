# ALUTHRA Admin

Item images are stored locally in `uploads/items` and served through `/api/uploads`.
Use a persistent volume for this directory when deploying. Uploads support PNG, JPG,
and WebP up to 5 MB. An uploaded image can remain unused if item creation is cancelled or fails.

Next.js App Router + TypeScript admin frontend.

Run `npm install` then `npm run dev`. Open http://localhost:3001.
The NestJS backend must run on port 3000. To change its URL, copy `.env.example`
to `.env.local` and set `API_BASE_URL` (server-only).

Login at `/login` using an admin created with the backend's `npm run admin:create`.
The frontend exchanges credentials server-side and stores the access token in an
HttpOnly, SameSite cookie (Secure in production). Tokens are never stored in localStorage.
The `/admin` page is a placeholder gated by cookie presence, not an authorization
boundary. Future data endpoints must validate the JWT and admin status in NestJS.
The backend's current IP rate limiter sees this frontend server as the client;
configure trusted proxy handling or shared per-user limits before scaling.

`npm run build` checks the production build; `npm run lint` checks lint rules.
