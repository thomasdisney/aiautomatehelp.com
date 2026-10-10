# Third-party notices

## Fonts

The site self-hosts one typeface from `public/fonts/`. It is served from this
site only; no font, script or stylesheet is loaded from any other host.

| File | Typeface | License | Copyright |
|---|---|---|---|
| `public/fonts/atkinson-hyperlegible-next.woff2` | Atkinson Hyperlegible Next (variable, subset: Latin; weights 400-800, upright) | SIL Open Font License 1.1, full text in `public/fonts/OFL-AtkinsonHyperlegibleNext.txt` | Copyright 2020-2024 The Atkinson Hyperlegible Next Project Authors (https://github.com/googlefonts/atkinson-hyperlegible-next) |

The font declares no Reserved Font Name. The file was subset and converted to
WOFF2 with fontTools from the upstream release in the google/fonts repository.

## Production packages

Listed below are the production (non-dev) npm dependencies recorded in `package-lock.json`
with the version and license it gives for each. Only the top-level packages
(`node_modules/*` in the lockfile) are listed; nested copies are not. Optional peer
dependencies that are not installed are omitted. Versions and license names are copied
from the lockfile unmodified.

### Next.js

| Package | Version | License |
|---|---|---|
| `@next/env` | 16.3.0 | MIT |
| `@next/swc-darwin-arm64` | 16.3.0 | MIT |
| `@next/swc-darwin-x64` | 16.3.0 | MIT |
| `@next/swc-linux-arm64-gnu` | 16.3.0 | MIT |
| `@next/swc-linux-arm64-musl` | 16.3.0 | MIT |
| `@next/swc-linux-x64-gnu` | 16.3.0 | MIT |
| `@next/swc-linux-x64-musl` | 16.3.0 | MIT |
| `@next/swc-win32-arm64-msvc` | 16.3.0 | MIT |
| `@next/swc-win32-x64-msvc` | 16.3.0 | MIT |
| `next` | 16.3.0 | MIT |

### React

| Package | Version | License |
|---|---|---|
| `react` | 19.2.8 | MIT |
| `react-dom` | 19.2.8 | MIT |
| `scheduler` | 0.27.0 | MIT |

### Others

| Package | Version | License |
|---|---|---|
| `@emnapi/runtime` | 1.11.3 | MIT |
| `@img/colour` | 1.1.0 | MIT |
| `@img/sharp-darwin-arm64` | 0.35.3 | Apache-2.0 |
| `@img/sharp-darwin-x64` | 0.35.3 | Apache-2.0 |
| `@img/sharp-freebsd-wasm32` | 0.35.3 | Apache-2.0 |
| `@img/sharp-libvips-darwin-arm64` | 1.3.2 | LGPL-3.0-or-later |
| `@img/sharp-libvips-darwin-x64` | 1.3.2 | LGPL-3.0-or-later |
| `@img/sharp-libvips-linux-arm` | 1.3.2 | LGPL-3.0-or-later |
| `@img/sharp-libvips-linux-arm64` | 1.3.2 | LGPL-3.0-or-later |
| `@img/sharp-libvips-linux-ppc64` | 1.3.2 | LGPL-3.0-or-later |
| `@img/sharp-libvips-linux-riscv64` | 1.3.2 | LGPL-3.0-or-later |
| `@img/sharp-libvips-linux-s390x` | 1.3.2 | LGPL-3.0-or-later |
| `@img/sharp-libvips-linux-x64` | 1.3.2 | LGPL-3.0-or-later |
| `@img/sharp-libvips-linuxmusl-arm64` | 1.3.2 | LGPL-3.0-or-later |
| `@img/sharp-libvips-linuxmusl-x64` | 1.3.2 | LGPL-3.0-or-later |
| `@img/sharp-linux-arm` | 0.35.3 | Apache-2.0 |
| `@img/sharp-linux-arm64` | 0.35.3 | Apache-2.0 |
| `@img/sharp-linux-ppc64` | 0.35.3 | Apache-2.0 |
| `@img/sharp-linux-riscv64` | 0.35.3 | Apache-2.0 |
| `@img/sharp-linux-s390x` | 0.35.3 | Apache-2.0 |
| `@img/sharp-linux-x64` | 0.35.3 | Apache-2.0 |
| `@img/sharp-linuxmusl-arm64` | 0.35.3 | Apache-2.0 |
| `@img/sharp-linuxmusl-x64` | 0.35.3 | Apache-2.0 |
| `@img/sharp-wasm32` | 0.35.3 | Apache-2.0 AND LGPL-3.0-or-later AND MIT |
| `@img/sharp-webcontainers-wasm32` | 0.35.3 | Apache-2.0 |
| `@img/sharp-win32-arm64` | 0.35.3 | Apache-2.0 AND LGPL-3.0-or-later |
| `@img/sharp-win32-ia32` | 0.35.3 | Apache-2.0 AND LGPL-3.0-or-later |
| `@img/sharp-win32-x64` | 0.35.3 | Apache-2.0 AND LGPL-3.0-or-later |
| `@swc/helpers` | 0.5.15 | Apache-2.0 |
| `baseline-browser-mapping` | 2.11.13 | Apache-2.0 |
| `caniuse-lite` | 1.0.30001757 | CC-BY-4.0 |
| `client-only` | 0.0.1 | MIT |
| `detect-libc` | 2.1.2 | Apache-2.0 |
| `nanoid` | 3.3.18 | MIT |
| `picocolors` | 1.1.1 | ISC |
| `postcss` | 8.5.23 | MIT |
| `sharp` | 0.35.3 | Apache-2.0 |
| `source-map-js` | 1.2.1 | BSD-3-Clause |
| `styled-jsx` | 5.1.6 | MIT |
| `tslib` | 2.8.1 | 0BSD |

Total: 53 packages. This count and the list above cover only top-level entries in the
lockfile (`node_modules/*`); nested copies are not counted. The single nested non-dev
entry is semver 7.8.5 (ISC, optional), installed under `sharp`. Platform-specific
optional binaries (`@next/swc-*`, `sharp`, `@img/*`) install only for the deployment
platform; all variants recorded in the lockfile are listed.
