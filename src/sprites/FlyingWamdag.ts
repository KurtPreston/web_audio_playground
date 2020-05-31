import {autobind} from 'core-decorators';
import flyingWamdagSvg1 from '../images/flyingWamdag1.svg';
import flyingWamdagSvg2 from '../images/flyingWamdag2.svg';
import flyingWamdagSvg3 from '../images/flyingWamdag3.svg';
import flyingWamdagSvg4 from '../images/flyingWamdag4.svg';
import {angleBetween} from '../math/trig/angleBetween';
import {Dimensions, IPosition, IVector, WorldState} from '../types';
import {NoteWheel} from './NoteWheel';
import {PowerUp} from './PowerUp';
import {isSafari} from './renderHelpers/detectBrowser';
import {Sprite} from './Sprite';
import {Wisp} from './Wisp';

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
export class FlyingWamdag implements Sprite {
  // Constants
  private readonly force: number = 0.7;
  private readonly maxVelocity = 10;
  private readonly animationFrameRate = 4; // change every 4 frames
  private readonly flyingWamdagSize: number;

  // State
  public position: IPosition;
  private target: IPosition;
  private vector: IVector;
  private animationFrame: number = 0;

  // Referenced sprites
  private readonly noteWheel: NoteWheel;
  private readonly powerUps: Set<PowerUp>;

  constructor(params: FlyingWamdagParams) {
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
    this.noteWheel = new NoteWheel({
      size: this.flyingWamdagSize * 1.5
    });
    this.powerUps = new Set<PowerUp>();
  }

  public powerUp(circle: Wisp) {
    this.powerUps.add(
      new PowerUp({
        position: this.position,
        blendMode: circle.mixBlendMode,
        color: circle.color,
        destroy: this.destroyPowerUp
      })
    );
  }

  private destroyPowerUp(powerUp: PowerUp) {
    return this.powerUps.delete(powerUp);
  }

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    this.renderPowerUps(canvas, world);
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
      canvas.shadowColor = 'rgba(0, 0, 0, 0.5)';
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

  private renderPowerUps(canvas: CanvasRenderingContext2D, world: WorldState) {
    this.powerUps.forEach((powerUp: PowerUp) => {
      powerUp.render(canvas, world);
    });
  }

  public tick(world: WorldState) {
    const {width, height} = world.dimensions;
    const {noteWheel, position, powerUps, target, vector} = this;
    // Animate
    if (world.frameNum % this.animationFrameRate === 0) {
      this.animationFrame = (this.animationFrame + 1) % flyingWamdagSvgs.length;
    }

    // Update referenced sprites
    powerUps.forEach((powerUp: PowerUp) => powerUp.tick(world));
    noteWheel.tick(world);

    // Adjust target
    this.target = noteWheel.target || this.target;

    // Adjust momentum towards target
    const angle = angleBetween(position, target);
    const xMomentumDelta = this.force * Math.cos(angle);
    const yMomentumDelta = this.force * Math.sin(angle);

    vector.xMomentum += xMomentumDelta;
    vector.yMomentum += yMomentumDelta;

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
