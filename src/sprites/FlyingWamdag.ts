import {autobind} from 'core-decorators';
import flyingWamdagSvg1 from '../images/flyingWamdag1.svg';
import flyingWamdagSvg2 from '../images/flyingWamdag2.svg';
import flyingWamdagSvg3 from '../images/flyingWamdag3.svg';
import flyingWamdagSvg4 from '../images/flyingWamdag4.svg';
import {Dimensions, IPosition, IVector, WorldState} from '../types';
import {scale} from '../util/scale';
import {NoteWheel} from './NoteWheel';
import {isSafari} from './renderHelpers/detectBrowser';
import {Sprite} from './Sprite';

export interface FlyingWamdagParams {
  dimensions: Dimensions;
}

const flyingWamdagSvgs = [flyingWamdagSvg1, flyingWamdagSvg2, flyingWamdagSvg3, flyingWamdagSvg4];
const flyingWamdagImages: HTMLImageElement[] = flyingWamdagSvgs.map((href) => {
  const image = new Image();
  image.src = href;
  return image;
});

@autobind
export class FlyingWamdag extends Sprite {
  // Constants
  private readonly force: number = 0.7;
  private readonly maxVelocity = 10;
  private readonly animationFrameRate = 4; // change every 4 frames
  private readonly numPowerUpFrames = 15;
  private readonly flyingWamdagSize: number;
  private readonly powerUpSize: number;

  // State
  public position: IPosition;
  private target: IPosition;
  private vector: IVector;
  private animationFrame: number = 0;
  private framesSincePowerUp: number = Number.POSITIVE_INFINITY;

  // Referenced sprites
  private noteWheel: NoteWheel;

  constructor(params: FlyingWamdagParams) {
    super();
    const {width, height} = params.dimensions;
    const xMid = width / 2;
    const yMid = height / 2;
    this.position = {
      x: xMid,
      y: yMid - 10
    };
    this.vector = {
      xMomentum: 0,
      yMomentum: 0
    };
    this.target = {
      x: xMid,
      y: yMid
    };
    this.flyingWamdagSize = Math.round(Math.sqrt(width * height) / 8);
    this.powerUpSize = this.flyingWamdagSize * 1.5;
    this.noteWheel = new NoteWheel();
  }

  public powerUp() {
    this.framesSincePowerUp = 0;
  }

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    this.renderPowerUp(canvas);
    this.renderNoteWheel(canvas, world);
    this.renderFlyingWamdag(canvas);
  }

  private renderFlyingWamdag(canvas: CanvasRenderingContext2D) {
    const {x, y} = this.position;
    const width = this.flyingWamdagSize;
    const height = this.flyingWamdagSize;

    const xMin = x - width / 2;
    const yMin = y - height / 2;

    const image: HTMLImageElement = flyingWamdagImages[this.animationFrame];

    canvas.globalCompositeOperation = 'source-over';
    canvas.save();
    if (!isSafari) {
      // Safari renders shadows incorrectly
      canvas.shadowOffsetX = 35;
      canvas.shadowOffsetY = 35;
      canvas.shadowBlur = 20;
      canvas.shadowColor = 'black';
    }
    if (this.vector.xMomentum < 0) {
      // Facing left
      canvas.scale(-1, 1);
      canvas.drawImage(image, xMin * -1 - width, yMin, width, height);
      canvas.setTransform(1, 0, 0, 1, 0, 0);
    } else {
      // Facing right
      canvas.drawImage(image, xMin, yMin, width, height);
    }
    canvas.restore();
  }

  private renderNoteWheel(canvas: CanvasRenderingContext2D, world: WorldState) {
    this.noteWheel.render(canvas, world);
  }

  private renderPowerUp(canvas: CanvasRenderingContext2D) {
    if (this.framesSincePowerUp < this.numPowerUpFrames) {
      const size = scale({
        input: this.framesSincePowerUp,
        inputMin: 0,
        inputMax: this.numPowerUpFrames - 1,
        outputMin: 0,
        outputMax: this.powerUpSize
      });

      canvas.restore();
      canvas.fillStyle = 'white';
      canvas.globalCompositeOperation = 'hard-light';
      canvas.beginPath();
      canvas.arc(this.position.x, this.position.y, size, 0, 2 * Math.PI);
      canvas.fillStyle = 'white';
      canvas.fill();
    }
  }

  public tick(world: WorldState) {
    const {width, height} = world.dimensions;
    const {noteWheel, position, target, vector} = this;
    // Animate
    if (world.frameNum % this.animationFrameRate === 0) {
      this.animationFrame = (this.animationFrame + 1) % flyingWamdagSvgs.length;
    }
    this.framesSincePowerUp++;

    // Adjust target
    noteWheel.tick(world);
    this.target = noteWheel.target || this.target;

    // Adjust momentum towards target
    const xDiff = target.x - position.x;
    const yDiff = target.y - position.y;
    let angle = Math.atan(yDiff / xDiff);

    if (isFinite(angle)) {
      if (xDiff < 0) {
        angle += Math.PI;
      }

      const xMomentumDelta = this.force * Math.cos(angle);
      const yMomentumDelta = this.force * Math.sin(angle);

      vector.xMomentum += xMomentumDelta;
      vector.yMomentum += yMomentumDelta;
    }

    // Bounce off edges
    if (position.x > width && vector.xMomentum > 0) {
      vector.xMomentum *= -1;
    }

    if (position.x < 0 && vector.xMomentum < 0) {
      vector.xMomentum *= -1;
    }

    if (position.y > height && vector.yMomentum > 0) {
      vector.yMomentum *= -1;
    }

    if (position.y < 0 && vector.yMomentum < 0) {
      vector.yMomentum *= -1;
    }

    // Apply max velocity
    const velocity = Math.sqrt(Math.pow(vector.xMomentum, 2) + Math.pow(vector.yMomentum, 2));
    if (velocity > this.maxVelocity) {
      const ratio = this.maxVelocity / velocity;
      vector.xMomentum *= ratio;
      vector.yMomentum *= ratio;
    }

    // Update position
    position.x += vector.xMomentum;
    position.y += vector.yMomentum;

    // Update notwheel position
    noteWheel.setPosition(position);
  }
}
