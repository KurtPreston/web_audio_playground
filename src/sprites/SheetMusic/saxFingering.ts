import {getNoteName} from '../../audio/Note';
import {circle} from '../renderHelpers/circle';
import {ellipse} from '../renderHelpers/ellipse';
import {NoteAnnotator, NoteAnnotatorParams} from './SheetMusic';

interface SaxKeys {
  // Left hand
  left1?: boolean; // B
  left2?: boolean; // A/C
  left3?: boolean; // G
  leftF?: boolean;
  Bb?: boolean;
  leftPalmEb?: boolean; // D
  leftPalmD?: boolean; // Eb
  leftPalmF?: boolean; // F
  leftPinky1?: boolean; // G#
  leftPinky2?: boolean; // Low C#
  leftPinky3?: boolean; // Low B
  leftPinky4?: boolean; // Low Bb
  leftPinky5?: boolean; // Low A

  // Right hand
  right1?: boolean; // F
  right2?: boolean; // E
  right3?: boolean; // D
  octave?: boolean;
  lowA?: boolean;
  rightFsharp?: boolean;
  rightHighFsharp?: boolean;
  rightPinky1?: boolean;
  rightPinky2?: boolean;
  rightSide1?: boolean;
  rightSide2?: boolean;
  rightSide3?: boolean;
}

type SaxKey = keyof SaxKeys;

const allLeft: SaxKeys = {
  left1: true,
  left2: true,
  left3: true
};
const allRight: SaxKeys = {
  right1: true,
  right2: true,
  right3: true
};
const allKeys: SaxKeys = {
  ...allLeft,
  ...allRight
};

const fingering: {[note: number]: SaxKeys[]} = {
  36: [
    {
      // C
      // A
      ...allKeys,
      rightPinky2: true,
      lowA: true
    },
    {
      // A alt
      ...allKeys,
      rightPinky2: true,
      leftPinky5: true
    },
    {
      // A alt
      ...allKeys,
      rightPinky2: true,
      leftPinky4: true
    }
  ],
  37: [
    {
      // C#/Db
      // A# Bb
      ...allKeys,
      rightPinky2: true,
      leftPinky4: true
    }
  ],
  38: [
    {
      // D
      // B
      ...allKeys,
      rightPinky2: true,
      leftPinky3: true
    }
  ],
  39: [
    {
      // D#/Eb
      // C
      ...allKeys,
      rightPinky2: true
    }
  ],
  40: [
    {
      // E
      // C# Db
      ...allKeys,
      leftPinky2: true,
      rightPinky2: true
    }
  ],
  41: [
    {
      // D
      ...allKeys
    }
  ],
  42: [
    {
      // D# Eb
      ...allKeys,
      rightPinky1: true
    }
  ],
  43: [
    {
      // E
      ...allLeft,
      right1: true,
      right2: true
    }
  ],
  44: [
    {
      // F
      ...allLeft,
      right1: true
    }
  ],
  45: [
    {
      // F#
      ...allLeft,
      right2: true
    },
    {
      // F# alt
      ...allLeft,
      right1: true,
      rightFsharp: true
    }
  ],
  46: [
    {
      // G
      ...allLeft
    }
  ],
  47: [
    {
      // G# Ab
      ...allLeft,
      leftPinky1: true
    }
  ],
  48: [
    {
      // A
      left1: true,
      left2: true
    },
    {
      // A alt
      left1: true,
      left2: true,
      leftPinky1: true
    }
  ],
  49: [
    {
      // A# Bb
      left1: true,
      right1: true
    },
    {
      // A alt 1
      left1: true,
      Bb: true
    },
    {
      // A alt 2
      left1: true,
      left2: true,
      rightSide3: true
    }
  ],
  50: [
    {
      // B
      left1: true
    },
    {
      // B alt
      left1: true,
      rightSide3: true
    }
  ],
  51: [
    {
      // C
      left2: true
    },
    {
      left1: true,
      rightSide2: true
    }
  ],
  52: [
    {
      // C# Db
    },
    {
      // C# Db alt
      octave: true,
      left3: true
    }
  ],
  53: [
    {
      // D
      ...allKeys,
      octave: true
    },
    {
      // D alt
      ...allKeys,
      leftPinky2: true,
      octave: true
    }
  ],
  54: [
    {
      // D# Eb
      ...allKeys,
      octave: true,
      rightPinky1: true
    }
  ],
  55: [
    {
      // E
      ...allLeft,
      right1: true,
      right2: true,
      octave: true
    }
  ],
  56: [
    {
      // F
      ...allLeft,
      octave: true,
      right1: true
    }
  ],
  57: [
    {
      // F# Gb
      ...allLeft,
      octave: true,
      right2: true
    },
    {
      ...allLeft,
      right1: true,
      rightFsharp: true
    }
  ],
  58: [
    {
      // G
      ...allLeft,
      octave: true
    }
  ],
  59: [
    {
      // G# Ab
      ...allLeft,
      octave: true,
      leftPinky1: true
    }
  ],
  60: [
    {
      // A
      left1: true,
      left2: true,
      octave: true
    }
  ],
  61: [
    {
      // A# Bb
      left1: true,
      right1: true,
      octave: true
    },
    {
      left1: true,
      Bb: true,
      octave: true
    },
    {
      left1: true,
      left2: true,
      rightSide3: true
    }
  ],
  62: [
    {
      // B
      left1: true,
      octave: true
    }
  ],
  63: [
    {
      // C
      left2: true,
      octave: true
    },
    {
      left1: true,
      octave: true,
      rightSide2: true
    }
  ],
  64: [
    {
      // C# Db
      octave: true
    },
    {
      octave: true,
      right1: true,
      right2: true
    }
  ],
  65: [
    {
      // D
      octave: true,
      leftPalmD: true
    }
  ],
  66: [
    {
      // D# Eb
      leftPalmD: true,
      leftPalmEb: true,
      octave: true
    }
  ],
  67: [
    {
      // E
      leftPalmD: true,
      leftPalmEb: true,
      octave: true,
      rightSide1: true
    },
    {
      octave: true,
      leftF: true,
      left2: true,
      left3: true
    }
  ],
  68: [
    {
      // F
      octave: true,
      leftPalmD: true,
      leftPalmEb: true,
      leftPalmF: true,
      rightSide1: true
    },
    {
      octave: true,
      leftF: true,
      left2: true
    }
  ],
  69: [
    {
      // F# Gb
      octave: true,
      left1: true,
      left3: true,
      right1: true
    },
    {
      octave: true,
      rightSide1: true,
      rightHighFsharp: true,
      leftPalmD: true,
      leftPalmEb: true,
      leftPalmF: true
    }
  ],
  70: [
    {
      // G
      octave: true,
      rightSide3: true,
      left1: true,
      left2: true
    },
    {
      octave: true,
      left1: true,
      rightSide3: true,
      rightHighFsharp: true
    }
  ],
  71: [
    {
      // G# Ab
      octave: true,
      left1: true,
      left3: true,
      rightSide3: true
    },
    {
      octave: true,
      left1: true,
      left2: true,
      left3: true,
      leftPinky3: true,
      right2: true,
      rightSide2: true
    }
  ],
  72: [
    {
      // A
      octave: true,
      left2: true,
      left3: true,
      right1: true,
      right2: true,
      rightSide2: true
    },
    {
      octave: true,
      left2: true,
      left3: true,
      leftPinky1: true
    }
  ],
  73: [
    {
      // A# Bb
      octave: true,
      left2: true,
      left3: true,
      leftPalmEb: true
    },
    {
      octave: true,
      left1: true,
      left2: true,
      left3: true,
      leftPalmEb: true,
      rightSide2: true,
      rightFsharp: true
    }
  ],
  74: [
    {
      // B
      octave: true,
      leftPalmEb: true,
      leftPalmD: true,
      left3: true
    },
    {
      octave: true,
      left3: true,
      right1: true,
      right2: true,
      leftPalmEb: true
    }
  ],
  75: [
    {
      // C
      octave: true,
      left1: true,
      left3: true,
      right2: true,
      right3: true,
      rightSide3: true
    },
    {
      octave: true,
      left1: true,
      left3: true,
      right1: true,
      rightSide3: true,
      rightFsharp: true
    }
  ]
};

export const drawSaxFingeringChart: NoteAnnotator = (params: NoteAnnotatorParams) => {
  const {canvas, note, x, y, width, height} = params;

  const saxKeys: SaxKeys = fingering[note - 12]?.[0];
  if (!saxKeys) {
    throw new Error(`No fingering found for ${note} (${getNoteName(note)})`);
  }

  // Derived constants
  const unit = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)) / 20;
  const mainKeySize = unit * 2;
  const fill = 'white';
  const stroke = 'white';

  const {left1, left2, left3, right1, right2, right3} = saxKeys;

  // Left 1
  circle({
    x,
    y,
    r: mainKeySize,
    fill: left1 ? fill : undefined,
    stroke: left1 ? undefined : stroke,
    canvas
  });

  // Left 2
  circle({
    x,
    y: y + 4 * unit,
    r: mainKeySize,
    fill: left2 ? fill : undefined,
    stroke: left2 ? undefined : stroke,
    canvas
  });

  // Left 3
  circle({
    x,
    y: y + 8 * unit,
    r: mainKeySize,
    fill: left3 ? fill : undefined,
    stroke: left3 ? undefined : stroke,
    canvas
  });

  // Right 1
  circle({
    x,
    y: y + 14 * unit,
    r: mainKeySize,
    fill: right1 ? fill : undefined,
    stroke: right1 ? undefined : stroke,
    canvas
  });

  // Right 2
  circle({
    x,
    y: y + 18 * unit,
    r: mainKeySize,
    fill: right2 ? fill : undefined,
    stroke: right2 ? undefined : stroke,
    canvas
  });

  // Right 3
  circle({
    x,
    y: y + 22 * unit,
    r: mainKeySize,
    fill: right3 ? fill : undefined,
    stroke: right3 ? undefined : stroke,
    canvas
  });

  const {leftPinky1} = saxKeys;
  if (leftPinky1) {
    // Left Pinky
    ellipse({
      cx: x + 3 * unit,
      cy: y + 10 * unit,
      rx: 2 * unit,
      ry: unit,
      rotation: -Math.PI / 8,
      fill: leftPinky1 ? fill : undefined,
      stroke: leftPinky1 ? undefined : stroke,
      canvas
    });
  }

  const {rightPinky1, rightPinky2} = saxKeys;
  if (rightPinky1 || rightPinky2) {
    // Right Pinky 1
    ellipse({
      cx: x + 3 * unit,
      cy: y + 24 * unit,
      rx: 2 * unit,
      ry: 1.5 * unit,
      rotation: -Math.PI / 8,
      fill: rightPinky1 ? fill : undefined,
      stroke: rightPinky1 ? undefined : stroke,
      canvas,
      startAngle: Math.PI,
      stopAngle: 2 * Math.PI
    });

    // Right Pinky 2
    ellipse({
      cx: x + 3 * unit,
      cy: y + 24 * unit,
      rx: 2 * unit,
      ry: 1.5 * unit,
      rotation: -Math.PI / 8,
      fill: rightPinky2 ? fill : undefined,
      stroke: rightPinky2 ? undefined : stroke,
      canvas,
      startAngle: 0,
      stopAngle: Math.PI
    });
  }
};
