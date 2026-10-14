# utilities

Node.js monorepo of small, dependency-free utility packages published under
the `@utility` scope. Managed with npm workspaces and TypeScript project
references.

## Purpose

This project keeps the runtime APIs wrapped. Consumers import the `@utility/*`
packages instead of calling runtime APIs (Node.js file system, child
processes, etc.) directly. When we want to flip the runtime, we only need to
update this project rather than the whole platform.

| Package | Description |
| --- | --- |
| [`@utility/date`](packages/date) | Date helpers (`isISODate`) |
| [`@utility/file`](packages/file) | Promise-based file system helpers, JSON loading, zip extraction |
| [`@utility/git`](packages/git) | Run Git commands, detect uncommitted changes, clone |
| [`@utility/number`](packages/number) | Number helpers (`random`) |
| [`@utility/string`](packages/string) | Case conversion and boolean parsing |
| [`@utility/types`](packages/types) | Shared JSON / UUID TypeScript types |

## Development

Requires Node.js 26 or newer.

```shell
npm install
npm run build      # tsc -b, emits packages/*/dist
npm run typecheck  # build + typecheck the tests
npm test           # build + run all package tests (node:test)
```

Each package lives in `packages/<name>` with `mod.ts` (entry point),
`src/` and `test/`. Tests run directly on TypeScript via Node's built-in type
stripping, so no extra test runner is needed.
