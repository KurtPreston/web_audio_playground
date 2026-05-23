# Wamdag and the Quest for the Violin

## Notes

### Super-Saiyan

Character at bottom
Evil floating thing at top, that goes back and forth between notes laid out on x-axis
Player yells with Super-Saiyan charge up. The longer + louder, the larger their ball.
When they release, the ball shoots towards the note board.
Player tries to hit the villain by using volume to create more powerful balls

### Wamdag Game

Overhead view
One player controls wamdag
One person plays violin
One person plays guitar (or whatever)

Wamdag runs around, trying to chase the violin, and avoid the guitar
Each instrument will be rendered as a circle whose size is based on amplitude and with a vibrating surface reflecting a FFT
At first, the instrument sprites will move forward at a constant pace, randomly going straight, or rotating their direction (ideally leaving a trail?)
(maybe the drums will be bullets fired from the guitar)
(maybe the velocity of everything will be the song BPM?)

### Doppler synth

Options:

- Toggle doppler
- Toggle notes and number
- Toggle physics

### Chordblob

With credit to the bubble android game + puyo
Blob of notes (graph of notes)
Sing a chord of adjacent notes to pop them

## Solo

1. Pick an Exercise

Sample Exercise 1: major-minor

- Choose numPlayers
- Round 1: all together, then each player plays root C | C | A- | A-
- Round 2: add the fifth
- Round 3: add the third, up down up arpeggion
- Round 4: the pentatonic
- Round 5: the scale

2.  Play the exercise

- Eventually, use a mic to listen to the user input,
- give them a score
  (is there a way to make it less competitive? like only compete against your best score?)

## Ideas

Dynamically render background --- multiple layers rotating, random walk in blend mode
One instrument controls x
One controls y
Try to hit player

## Development

### `yarn start`

Runs the app in development mode. Open [https://localhost:5173](https://localhost:5173) to view it in the browser (HTTPS is required for microphone access).

### `yarn test`

Runs the test suite with Vitest.

### `yarn build`

Builds the app for production to the `dist` folder.

### `yarn validate`

Runs TypeScript, ESLint, and tests.

## Deployment

The site is deployed to [GitHub Pages](https://pages.github.com/) at [webaudioplayground.kurtpreston.com](https://webaudioplayground.kurtpreston.com) via GitHub Actions (`.github/workflows/deploy.yml`). Pushes to `main` build with `yarn build` and publish the `dist/` folder.

Client-side routing uses a `404.html` SPA fallback so direct links like `/wamflap` work on GitHub Pages.

### One-time setup

1. In the GitHub repo, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
2. At your domain registrar, add a **CNAME** record for `webaudioplayground.kurtpreston.com` pointing to `kurtpreston.github.io`.
3. After the first successful deploy, in **Settings → Pages** set **Custom domain** to `webaudioplayground.kurtpreston.com` and enable **Enforce HTTPS** once the certificate provisions.
4. Shut down the Heroku app once GitHub Pages is verified working.
