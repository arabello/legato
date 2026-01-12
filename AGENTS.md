# Repository Guidelines

## Project Structure & Module Organization
`app/` contains all TypeScript sources: `app/root.tsx` boots the router, `app/routes/` holds route modules (e.g., `home.tsx`), and `app/core/` stores shared logic like `openKey.ts`. Styles live alongside components in `app/app.css`, while static files (favicons, manifest) belong in `public/`. Configuration for the runtime (`react-router.config.ts`), TypeScript (`tsconfig.json`), and build tooling (`vite.config.ts`, `Dockerfile`) sit at the repo root for easy discovery. The project uses Tailwindcss and shadcn ui compononents. Use `pnpm dlx shadcn@latest add <component>` to add new components.

## Build, Test, and Development Commands
Use `pnpm install` (lockfile: `pnpm-lock.yaml`) before hacking. Key scripts:

```bash
pnpm dev         # Start the React Router dev server with HMR.
pnpm build       # Generate the production client + server bundles in build/.
pnpm start       # Serve the built server bundle via react-router-serve.
pnpm typecheck   # Run route typegen then tsc to ensure type safety.
pnpm format      # Apply Prettier (with Tailwind plugin) to app/.
pnpm check # Verify formatting without writing.
```

## Coding Style & Naming Conventions
Code is TypeScript-first with 2-space indentation. Favor PascalCase for components (`HomeRoute`), camelCase for functions/variables, and kebab-case for files under `app/routes/`. Keep route loaders/actions colocated in the same file as the component per React Router conventions. Run `pnpm format` before committing; do not hand-edit generated TypeScript types. Tailwind classes should stay sorted by Prettier’s Tailwind plugin, and non-trivial utilities belong in `app/core/` to keep routes thin.

## Testing Guidelines
Automated tests are not yet wired up, so lean on `pnpm typecheck` plus manual verification in `pnpm dev`. When introducing logic-heavy utilities, add lightweight unit tests nearby as `*.test.ts` (e.g., `app/core/__tests__/openKey.test.ts`) and document the command you add to `package.json`. Validate route loaders/actions manually with representative navigation flows and include edge-case notes in your PR description until a formal suite lands.

## Commit & Pull Request Guidelines
Commits follow Conventional Commits (`feat: Add core` in history). Keep messages scoped and imperative (`fix: guard openKey fallback`). For pull requests, provide: a high-level summary, screenshots or terminal output for UX/API changes, reproduction steps, and references to linked issues. Confirm you ran `pnpm typecheck` and any new tests. Draft PRs are welcome for early feedback, but promotion to “Ready” should coincide with passing scripts and reviewed TODOs.
