# Changelog

## [Unreleased]

### Added

- MCP (Model Context Protocol) server support for AI integration
- Draft editing system with auto-save
- Server health check endpoint

### Fixed

- MCP DNS rebinding protection disabled for reverse proxy compatibility
- pnpm version locked to 10.28.1 for build consistency
- Migrated from ignoredBuiltDependencies to onlyBuiltDependencies for pnpm v10 compatibility

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
