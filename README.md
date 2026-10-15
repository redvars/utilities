# utilities

Monorepo of small, dependency-free, runtime-agnostic utility packages
published under the `@utility` scope. Every package runs on **Node.js**,
**Deno** and **Bun**. Managed with npm workspaces (plus a matching Deno
workspace) and TypeScript project references.

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

## Runtime support

| Runtime | Version |
| --- | --- |
| Node.js | 26+ |
| Deno | 2.x |
| Bun | 1.x |

Packages only use web-standard APIs (`fetch`, `URL`, ...) and `node:`
built-in modules, which Deno and Bun implement natively. Runtime specifics
stay inside the packages.

On Deno, grant the permissions a package needs:

| Package | Permissions |
| --- | --- |
| `@utility/file` | `--allow-read --allow-write --allow-env`, plus `--allow-run` for `unZip*` and `--allow-net` for remote `unZipFromURL` |
| `@utility/git` | `--allow-run --allow-env` |

`@utility/file`'s `unZip` and `@utility/git` also need the external `unzip`
(PowerShell on Windows) and `git` executables on every runtime.

## Development

Requires Node.js 26 or newer. Deno and Bun are needed only to run the tests
on those runtimes.

```shell
npm install
npm run build      # tsc -b, emits packages/*/dist
npm run typecheck  # build + typecheck the tests
npm test           # build + run all package tests on Node.js (node:test)
npm run test:deno  # run all package tests on Deno
npm run test:bun   # run all package tests on Bun
npm run test:all   # all of the above
```

Each package lives in `packages/<name>` with `mod.ts` (entry point),
`src/`, `test/`, `package.json` (npm) and `deno.json` (Deno workspace member
and JSR config). Tests use `node:test`, which `node --test`, `deno test` and
`bun test` all run directly on the TypeScript sources, so no extra test
runner is needed. CI runs the suite on all three runtimes on Linux and
Windows.
