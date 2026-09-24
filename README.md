# DSH Project Tools

Installable Docker services and model tools, plus Knowledge file-read and Treadmill APIs for the Persike DeepSeek Harness profile. This package targets **0.1.6-alpha.2** and requires `@persike/dsh-treadmill` **0.1.0**. It contains no Git/repository integration, Monaco editor or sidebar positioning code.

## Composition

The bundle inserts `njord-docker`, `njord-docker-local`, `njord-tool-docker` and `njord-project-controller`. The aggregate Njord profile disables the original `docker`, `docker-local`, `tool-docker` and `project-controller` entries before enabling these replacements. Mount each service once.

The Host supplies Cordis, the Session controller, filesystem, sandbox policy, workspace registry, subprocess service, tools, system prompt and Typert registry. Docker uses the local CLI provider; engine inspection is enabled and model-facing Compose tools are disabled by default. Existing provider and tool configuration fields remain available on the corresponding plugin rows.

A Client bundle imports `@persike/dsh-project-tools/remote`, mounts it with `ctx.remote.$mount(contribution)`, and registers its returned disposer. The generated contribution exposes `docker`, `editor` and `treadmill` namespaces. The `editor` namespace contains file listing, file reading and language-server inventory; it has no write method. Treadmill APIs retain stage toggles and installation editing.

## Exports

| Import | Responsibility |
|---|---|
| `@persike/dsh-project-tools` | Host Remote-controller assembly |
| `@persike/dsh-project-tools/types` | Client-safe request and result types |
| `@persike/dsh-project-tools/typert` | Generated Host reflection and validators |
| `@persike/dsh-project-tools/remote` | Generated Client Remote contribution |
| `@persike/dsh-project-tools/docker` | Docker service and provider API |
| `@persike/dsh-project-tools/docker/types` | Docker data types |
| `@persike/dsh-project-tools/docker-local` | Local Docker CLI provider |
| `@persike/dsh-project-tools/tool-docker` | Model-facing Docker tools |

All Cordis and Harness imports remain external exact peer dependencies. Treadmill resolves from its pinned public Git commit, without requiring an npm publication. The package includes its own Docker implementation once and does not bundle a second Harness runtime. Browser code imports only `/types` and `/remote`.

## Development and release

```sh
node scripts/prepare-local.mjs /path/to/deepseek-harness
npm run build
npm test
npm pack
```

The preparation script links peers from a matching built checkout without modifying it. Build first type-checks and emits ESM, then regenerates Host validators and the Client contribution from the checked source. Typert generation uses a private temporary workspace containing this package and the published protocol declarations; that workspace is removed after generation.

The tracked `lib/` artifacts allow installation from the public Git repository without an install-time compiler or lifecycle build scripts. Run build and tests before committing a release so these artifacts match the source. Tests cover the generated API inventory and validation, Docker provider lifecycle, actual Treadmill stage updates, Docker CLI subprocess behavior and Docker model tools. They use temporary files and scripted executables; no live Docker daemon is required.

## Compatibility limits

Language-server inventory currently requires the Persike `lsp.describeProviders()` extension. Stock upstream 0.1.6-alpha.2 does not expose that method; an upstream API addition or a separate inventory provider is needed before claiming compatibility with stock Harness. Newer Session/preset releases require independent compatibility work. The package does not alter preset-switching policy or other Harness internals.

MIT; see `LICENSE` and `NOTICE`.
