# Changelog

## [Unreleased]

### Fixed

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
