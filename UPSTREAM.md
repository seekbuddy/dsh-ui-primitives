# Upstream synchronization

- Tag: `dsh-v0.1.2-alpha.3`
- Commit: `dd6322d604e00eec1ba5e0c8541159906a21094a`
- Primitives source: `packages/client/ui-primitives/src`
- Theme source: `packages/client/ui-theme/src/styles`

The TypeScript, CSS Modules, and five theme sheets are synchronized from those paths. `src/invariant.ts` is intentionally excluded because it only registers DeepSeek Harness invariants through Cordis.

Local packaging adaptations:

- Public APIs are split into root, blocks, markdown, icons, theme, and theme/bootstrap entries.
- `.ts`/`.tsx` source specifiers are rewritten in emitted declarations.
- CSS Modules are compiled to idempotent style injection code.
- KaTeX CSS is not imported by Markdown; the package publishes explicit woff2-only CSS and font assets.
- Theme persistence and bootstrap are standalone and do not use DSH settings or Cordis services.
- KaTeX's trusted generated markup uses an SSR-safe React wrapper instead of the upstream browser-only `DOMParser` conversion.
- `HoverCard` fixes the alpha.3 dark-surface foreground omission by explicitly using white text in both themes.
