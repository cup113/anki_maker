# Changelog

## [2.3.0] - 2026-11-07

### Changed

- Saved documents are identified by an id instead of their title. Existing browser storage is
  migrated on the first load of this version: every saved document is carried over and the old
  title-keyed entries are deleted. **The migration is one-way** — rolling back to 2.2.1
  afterwards shows an empty document list, so export a JSON backup first if you may need to
  go back
- Titles are no longer unique. Renaming a document to a name that already exists leaves two
  documents instead of overwriting the other one's cards
- Importing a JSON file always creates a new document; it no longer overwrites a saved
  document that shares the imported title
- Generated files live in `OUTPUT_DIR` (`/app/output` in the image, `./temp` in development).
  `APP_ENV` is gone; the image and the compose file set `OUTPUT_DIR` instead
- Cards with both sides empty survive a JSON import. Only an AI reply has its blank cards
  dropped, which is where they come from

### Fixed

- The confirm dialog opened in the top-left corner of the screen instead of the middle.
  Tailwind's preflight resets every element's margin, which removed the `margin: auto` a native
  `<dialog>` relies on for centring
- Deleting the document being edited no longer brings it back: it used to return on the next
  reload and reappear in the list at the next save
- The footer's GitHub link points at the real repository

### Added

- `CONTEXT.md` (domain language) and `docs/adr/0001-document-identity.md` (why a document is
  identified by an id) for whoever touches storage next

## [2.2.1] - 2026-11-04

### Fixed

- The `anki_maker-web` image shipped `build/` without its runtime dependencies, so every page
  answered 500 (`ERR_MODULE_NOT_FOUND: Cannot find package 'dayjs'`) and the compose
  healthcheck never passed. The image now carries a production-only `node_modules`, and CI
  starts the built image and requests `/` before pushing, so an image that cannot serve a page
  fails the build instead of the deploy

## [2.2.0] - 2026-11-04

### Added

- AI page with two routes: MCP setup for Claude Code / Cursor / Claude Desktop / any SSE
  client, and a copy-prompt flow that turns a chat reply into a whole document
  (title, deck type, footer and cards) and loads it in one step
- `pnpm lint`, `pnpm format` and `pnpm format:check`: ESLint 9 (typescript-eslint +
  eslint-plugin-svelte) and Prettier with the Svelte plugin

### Changed

- Client is now a SvelteKit app (Svelte 5 runes, file-system routing). The Node server
  renders each page and forwards `/api` and `/mcp` to FastAPI, so the public port and every
  browser-side URL stay the same
- The repo is a pnpm workspace: `pnpm install`, `pnpm dev`, `pnpm build` and `pnpm check`
  run from the root and target the `client` package
- Deployment is two containers: `anki_maker-web` (port 4134) and `anki_maker` (internal
  only); the release workflow builds and pushes both images
- The tab icon and the header mark are the same vector bookmark now, replacing the
  placeholder bar and the PNG icons
- `LICENSE` carries the full Apache 2.0 text under a 2025-2026 copyright, and the README
  links to it

### Removed

- FastAPI no longer serves the built front-end: its static routes and `client/dist` are gone,
  and Tiptap's Vue binding along with the Vue toolchain (Vue, Pinia, Vue Router, Reka UI)

### Fixed

- Export cache compares the document content (title, deck type, footer, cards and
  additions) instead of the title alone, so editing a card and exporting again no longer
  downloads the previous file
- Reloading the page reopens the document being edited instead of starting a fresh one,
  and opening a document from the list survives a refresh
- The document list's ⋯ menu closes after 打开/删除
- Native `alert`/`confirm`/`prompt` replaced with an in-page dialog: Esc cancels, Enter
  confirms, and the prompt pre-fills the title on import
- MCP tool now percent-encodes the dynamic part of its links, so a card set with a
  Chinese title no longer yields URLs containing raw CJK characters

## [2.1.0] - 2026-11-02

### Added

- MCP (Model Context Protocol) server support for AI integration
- Draft editing system with auto-save
- Server health check endpoint
- Shortcut sheet behind the `?` button in the header
- Container image published to `ghcr.io/cup113/anki_maker` on every push to `main`
  and every `v*` tag

### Changed

- Client: rebuilt the editor UI as a printed page — no shadows, no rounded panels,
  a two-column ledger with a shared spine, and additions aligned to the same columns
- Export is now a popover on the download button: one click per format, and the second
  server-generated format reuses the first `/api/generate` response
- Keyboard flow: Enter breaks a line, `Ctrl / ⌘ + Enter` appends an entry, `Alt + Enter`
  appends an addition
- `docker-compose.yml` pulls the published image instead of building on the host

### Fixed

- `generated_files` volume was never declared, so `docker compose config` rejected the file
- MCP DNS rebinding protection disabled for reverse proxy compatibility
- pnpm upgraded to 11.22.0; the build-script allow-list moved to `pnpm-workspace.yaml`
  (`allowBuilds`), which pnpm 10+ no longer reads from `package.json`

## [2.0.0] - 2026-05-08

### Added

- AI assistant integration
- AI-powered card generation

### Changed

- Client: completed AI functionality

## [1.1.0] - 2026-05-06

### Changed

- Improved UI/UX across the application
- Updated version display

### Added

- SEO metadata and robots.txt
- CORS support

## [1.0.1] - 2026-05-04

### Added

- Auto-cleanup for old generated files (TTL: 24h), triggered on each generate request

### Changed

- Unified project version to 1.0.1

## [1.0.0] - 2026-05-01

### Added

- Basic Anki card generation (.apkg)
- Word document generation (.docx)
- Web UI for card editing
- Multiple deck types (one-side, two-sides, type)
