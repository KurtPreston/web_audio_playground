# Ideas

Brainstorm notes for future experiments and games. See the [README](../README.md) for what is implemented today.

## Super-Saiyan

Character at bottom
Evil floating thing at top, that goes back and forth between notes laid out on x-axis
Player yells with Super-Saiyan charge up. The longer + louder, the larger their ball.
When they release, the ball shoots towards the note board.
Player tries to hit the villain by using volume to create more powerful balls

## Wamdag Game

Overhead view
One player controls wamdag
One person plays violin
One person plays guitar (or whatever)

Wamdag runs around, trying to chase the violin, and avoid the guitar
Each instrument will be rendered as a circle whose size is based on amplitude and with a vibrating surface reflecting a FFT
At first, the instrument sprites will move forward at a constant pace, randomly going straight, or rotating their direction (ideally leaving a trail?)
(maybe the drums will be bullets fired from the guitar)
(maybe the velocity of everything will be the song BPM?)

## Doppler synth

Options:

- Toggle doppler
- Toggle notes and number
- Toggle physics

## Chordblob

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

2. Play the exercise

- Eventually, use a mic to listen to the user input,
- give them a score
  (is there a way to make it less competitive? like only compete against your best score?)

## Misc

Dynamically render background --- multiple layers rotating, random walk in blend mode
One instrument controls x
One controls y
Try to hit player
