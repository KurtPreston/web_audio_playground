# Web Audio Playground

Interactive browser experiments that turn your microphone, MIDI keyboard, and device sensors into games and musical visuals. Built with the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API), [Tone.js](https://tonejs.github.io/), and canvas rendering.

**Live site:** [webaudioplayground.kurtpreston.com](https://webaudioplayground.kurtpreston.com)

## Demos

| Demo | Path | Description |
| --- | --- | --- |
| **Wamflap** | `/wamflap` | Fly a bird by singing notes and collect wisps |
| **DopplerSynth** | `/doppler` | Explore doppler-shifted sound in a starfield with an astronaut listener |
| **Tadpoles** | `/tadpole` | Wisps rise to the surface when you call to them |
| **Hadouken** | `/hadouken` | Charge and launch fireballs with your voice, like a super-saiyan |
| **Light Factory** | `/factory` | Toggle visual/audio building blocks — spectrogram, note grid, wisps, and more |
| **Cables** | `/cables` | Patch together MIDI sources and synths in a visual playground |
| **Solo** | `/solo` | Practice chords with sheet music, keyboard, metronome, and sax fingering charts |

Each demo runs in the browser and may request microphone access (and device orientation for Hadouken). HTTPS is required for microphone input.

## Tech stack

- **React 18** + **TypeScript** + **Vite**
- **Tone.js** for synthesis and audio routing
- **Web MIDI** and file-based MIDI playback
- **Pitch detection** via a vendored [pitchfinder](src/pitchfinder/) library (runs in a Web Worker)
- **Canvas** sprites for visuals; **VexFlow** for sheet music
- **Vitest** for tests; **ESLint** + **Prettier** for linting

## Getting started

Requires [Node.js](https://nodejs.org/) 20+ and [Yarn](https://yarnpkg.com/).

```bash
yarn install
yarn start
```

Open [https://localhost:5173](https://localhost:5173). The dev server uses HTTPS (via `@vitejs/plugin-basic-ssl`) because browsers require a secure context for microphone access.

### Scripts

| Command | Description |
| --- | --- |
| `yarn start` | Generate JSON Schema types and start the Vite dev server |
| `yarn build` | Production build to `dist/` |
| `yarn test` | Run tests with Vitest |
| `yarn validate` | Typecheck, lint, and test |
| `yarn generate_certs` | Generate local self-signed certs for HTTPS dev (optional; Vite plugin handles this by default) |

## Project layout

```
src/
  games/          # Demo apps (Wamflap, DopplerSynth, Cables, …)
  sprites/        # Canvas-rendered visual/audio objects
  audio/          # Notes, scales, sequencers, harmony helpers
  midi/           # MIDI sources, subscribers, and routing
  pitchfinder/    # Vendored pitch detection algorithms
  workers/        # Web Workers (pitch detection)
public/
  midi/           # Bundled MIDI files
  samples/        # Drum and synth sample WAVs
```

Future ideas and design notes live in [docs/Ideas.md](docs/Ideas.md).

## Deployment

The site deploys to [GitHub Pages](https://pages.github.com/) via GitHub Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)). Pushes to `main` run `yarn build` and publish the `dist/` folder.

Client-side routing uses a `404.html` SPA fallback so direct links like `/wamflap` work on GitHub Pages.

### Custom domain setup

1. In the GitHub repo, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
2. At your domain registrar, add a **CNAME** record pointing to `<username>.github.io`.
3. After the first deploy, set **Custom domain** under **Settings → Pages** and enable **Enforce HTTPS** once the certificate provisions.

The live site uses `webaudioplayground.kurtpreston.com` (see [`public/CNAME`](public/CNAME)).

## License

[MIT](LICENSE) — see [LICENSE](LICENSE) for details.

Third-party code: the YIN pitch detector in `src/pitchfinder/src/detectors/yin.ts` is derived from [aubio](https://aubio.org/) and licensed under the [GNU GPL v3](https://www.gnu.org/licenses/gpl-3.0.html).
