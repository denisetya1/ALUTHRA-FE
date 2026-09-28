<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, load the antislop skill for the task:
- Core filter, always on: `antislop`
- UI / visual: `antislop-ui`
- Code comments: `antislop-code`
- Mobile / responsive: `antislop-layoutmobile`
- Copy & text: `antislop-copywriting`
Before starting, ask the user when antislop applies: during the work, or after it is done.
<!-- antislop:end -->

## ALUTHRA-FE architecture

- Use Tailwind CSS utilities for all feature and layout styling. Do not add route-level `.css` files, CSS modules, inline style objects, or new global component classes. Global CSS is limited to Tailwind setup, design tokens, resets, third-party library imports, and genuinely global browser behavior.
- Use the existing shadcn components in `src/components/ui` before creating a new primitive.
- Keep `page.tsx` files as thin route wrappers. Put route-specific UI in that route's `components/` directory.
- Put reusable TanStack Query queries and mutations in `src/hooks`, grouped by domain. Components must not call the backend directly.
- Put shared Zod schemas in `src/schemas`.
- Admin authentication belongs in `src/app/admin/layout.tsx`, not in individual pages.
- Mutations must invalidate every affected query key.
- Run `npm run lint` and `npm run build` before handing work over.
