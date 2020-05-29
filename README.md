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

## Ideas

Dynamically render background --- multiple layers rotating, random walk in blend mode
One instrument controls x
One controls y
Try to hit player

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
