import {autobind} from 'core-decorators';
import {maxBy, random, sample, sampleSize, times, without} from 'lodash';
import {getNoteInfo, Note, NoteValue} from '../../audio/Note';
import {nodeGroups} from '../../math/graph/nodeGroups';
import {electricalForce} from '../../math/physics/electricalForce';
import {springForce} from '../../math/physics/springForce';
import {Dimensions, FRAME_RATE, IPosition, IVector, WorldState} from '../../types/State';
import {noteColor} from '../renderHelpers/noteColor';
import {Sprite} from '../Sprite';
import {NoteGraphOptions} from './NoteGraphOptions.generated';

export interface NoteGraphParams {
  dimensions: Dimensions;
  notes?: Set<NoteValue>;
  numNodes?: number;
}

export interface NoteNode {
  note: Note;
  position: IPosition;
  vector: IVector;
  size: number;
  flaggedForDelete?: boolean;
}

interface NoteEdge {
  node1: NoteNode;
  node2: NoteNode;
  springConstant: number;
  lineWidth: number;
  flaggedForDelete: boolean;
}

interface NodeOptions {
  midiNote: Note;
}

export function defaultNoteGraphOptions(dimensions: Dimensions): NoteGraphOptions {
  return {
    edgeLength: 150,
    edgeStrength: 0.1,
    repulsionStrength: 5000,
    repulsionExponent: 1.5,
    momentumDamping: 0.8,
    maxVelocity: 500,
    volumeRampTime: 1000,
    nodeFadeInTime: 1000,
    nodeFadeOutTime: 500,
    nodeSize: 25,
    rotationMode: dimensions.width > dimensions.height ? 'clockhoriz' : 'clockvert'
  };
}

@autobind
export class NoteGraph implements Sprite {
  public nodes = new Set<NoteNode>();
  private edges = new Set<NoteEdge>();

  private dimensions: Dimensions;
  public options: NoteGraphOptions;

  constructor(params: NoteGraphParams) {
    this.dimensions = params.dimensions;
    this.options = defaultNoteGraphOptions(params.dimensions);
  }

  public createNode(options: NodeOptions): NoteNode {
    const note = options.midiNote;
    const {width, height} = this.dimensions;

    // Create the node
    const node: NoteNode = {
      note,
      vector: {
        xMomentum: 0,
        yMomentum: 0
      },
      position: {
        x: random(0, width),
        y: random(0, height)
      },
      size: 0
    };

    // Connect the node to the graph
    const numNodesToConnectTo = random(0, 4);
    const nodesToConnectTo: NoteNode[] = sampleSize(
      Array.from(this.nodes).filter((node) => !node.flaggedForDelete),
      numNodesToConnectTo
    );
    nodesToConnectTo.forEach((node2: NoteNode) => {
      this.addEdge({
        node1: node,
        node2
      });
    });

    // Add node
    this.nodes.add(node);

    return node;
  }

  // Returns a list of all connected node groups
  private nodeGroups(): NoteNode[][] {
    return nodeGroups({
      nodes: Array.from(this.nodes).filter((node) => !node.flaggedForDelete),
      edges: Array.from(this.edges).filter((edge) => !edge.flaggedForDelete)
    });
  }

  // Delete some set of edges to split node1 and node2 from each other
  public splitGraph() {
    const groups: NoteNode[][] = this.nodeGroups();
    const largestGroup = maxBy(groups, (group) => group.length);
    if (!largestGroup) {
      return;
    }

    const nodes: NoteNode[] = Array.from(largestGroup);
    const group1: Set<NoteNode> = new Set(sampleSize(nodes, Math.round(nodes.length / 2)));
    const group2: Set<NoteNode> = new Set(without(nodes, ...Array.from(group1)));

    this.edges.forEach((edge) => {
      const {node1, node2} = edge;
      if ((group1.has(node1) && group2.has(node2)) || (group2.has(node1) && group1.has(node2))) {
        edge.flaggedForDelete = true;
      }
    });
  }

  public addEdge(params?: {node1: NoteNode; node2: NoteNode}) {
    const {node1, node2} = params || {
      node1: sample(Array.from(this.nodes)),
      node2: sample(Array.from(this.nodes))
    };
    if (!node1 || !node2) {
      return;
    }
    for (const edge of Array.from(this.edges)) {
      if (
        (edge.node1 === node1 && edge.node2 === node2) ||
        (edge.node1 === node2 && edge.node2 === node1)
      ) {
        // Edge already exists
        return;
      }
    }
    this.edges.add({
      node1,
      node2,
      springConstant: 0,
      lineWidth: 0,
      flaggedForDelete: false
    });
  }

  public mergeGraphs() {
    const groups: NoteNode[][] = this.nodeGroups();
    if (groups.length <= 1) {
      return;
    }
    for (let i = 0; i < groups.length - 1; i++) {
      const group1 = groups[i];
      const group2 = groups[i + 1];
      times(random(1, 5), () => {
        const node1 = sample(group1);
        const node2 = sample(group2);
        if (node1 && node2) {
          this.addEdge({
            node1,
            node2
          });
        }
      });
    }
  }

  public deleteNode(node: NoteNode) {
    node.flaggedForDelete = true;
    this.edges.forEach((edge: NoteEdge) => {
      if (edge.node1 === node || edge.node2 === node) {
        edge.flaggedForDelete = true;
      }
    });
    setTimeout(() => {
      if (node) {
        this.nodes.delete(node);
        this.edges.forEach((edge: NoteEdge) => {
          if (edge.node1 === node || edge.node2 === node) {
            this.edges.delete(edge);
          }
        });
      }
    }, this.options.nodeFadeOutTime);
  }

  public deleteEdge(edge?: NoteEdge) {
    edge = edge || sample(Array.from(this.edges.values()));
    if (edge) {
      edge.flaggedForDelete = true;
      setTimeout(() => {
        this.edges.delete(edge as NoteEdge);
      }, 1000);
    }
  }

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    // Draw edges
    canvas.strokeStyle = 'white';
    this.edges.forEach((edge: NoteEdge) => {
      const {node1, node2, lineWidth} = edge;
      canvas.lineWidth = lineWidth;
      canvas.beginPath();
      canvas.moveTo(node1.position.x, node1.position.y);
      canvas.lineTo(node2.position.x, node2.position.y);
      canvas.stroke();
      canvas.closePath();
    });

    this.nodes.forEach((node: NoteNode) => {
      const {position, note, size} = node;
      const {x, y} = position;
      const {letter, accidental} = getNoteInfo(note);

      // Draw nodes
      const nodeSize = Math.max(size, 0.001);
      const fontSize = 0.8 * size;
      canvas.beginPath();
      canvas.arc(x, y, nodeSize, 0, 2 * Math.PI);
      canvas.fillStyle = noteColor(note, 0.5);
      canvas.fill();
      canvas.closePath();

      // Draw letters
      if (!node.flaggedForDelete) {
        canvas.font = `${fontSize}px sans-serif`;
        canvas.fillStyle = 'white';
        canvas.textAlign = 'center';
        canvas.textBaseline = 'middle';
        canvas.fillText(`${letter}${accidental ? '♯' : ''}`, x, y);
      }
    });
  }

  public tick(world: WorldState) {
    const {dimensions} = world;

    // Cache dimensions so new nodes can be added
    this.dimensions = dimensions;

    // Grow new nodes to target size
    const fadeInFrames = (this.options.nodeFadeInTime / 1000) * FRAME_RATE;
    const fadeOutFrames = (this.options.nodeFadeOutTime / 1000) * FRAME_RATE;
    const nodeGrowthRate = this.options.nodeSize / fadeInFrames;
    const nodeDecayRate = this.options.nodeSize / fadeOutFrames;
    this.nodes.forEach((node) => {
      if (node.flaggedForDelete) {
        if (node.size > 0) {
          node.size -= nodeDecayRate;
        }
      } else {
        if (node.size < this.options.nodeSize) {
          node.size += nodeGrowthRate;
        }
      }
    });

    // Grow edges to target strength
    const edgeWidth = 3;

    const springGrowthRate = this.options.edgeStrength / fadeInFrames;
    const springDecayRate = (this.options.edgeStrength / fadeOutFrames) * 3;
    const lineGrowthRate = edgeWidth / fadeInFrames;
    const lineDecayRate = edgeWidth / fadeOutFrames;

    this.edges.forEach((edge) => {
      if (edge.flaggedForDelete) {
        if (edge.springConstant > 0) {
          edge.springConstant -= springDecayRate;
        }

        if (edge.lineWidth > 0) {
          edge.lineWidth -= lineDecayRate;
        }

        if (edge.lineWidth <= 0 || edge.springConstant <= 0) {
          this.edges.delete(edge);
        }
      } else {
        if (edge.springConstant < this.options.edgeStrength) {
          edge.springConstant += springGrowthRate;
        }

        if (edge.lineWidth < 3) {
          edge.lineWidth += lineGrowthRate;
        }
      }
    });

    // Adjust momentum by applying spring force between connected nodes
    this.edges.forEach(({node1, node2}) => {
      const {xForce, yForce} = springForce({
        point1: node1.position,
        point2: node2.position,
        springConstant: this.options.edgeStrength,
        targetDistance: this.options.edgeLength
      });

      node1.vector.xMomentum += xForce;
      node1.vector.yMomentum += yForce;
      node2.vector.xMomentum -= xForce;
      node2.vector.yMomentum -= yForce;
    });

    // Apply electrical repulsion between all nodes
    this.nodes.forEach((node1) => {
      this.nodes.forEach((node2) => {
        if (node1 === node2) {
          return;
        }

        const {xForce, yForce} = electricalForce({
          point1: node1.position,
          point2: node2.position,
          coefficient: -this.options.repulsionStrength, // repel,
          exponent: this.options.repulsionExponent
        });

        switch (this.options.rotationMode) {
          case 'stable':
            node1.vector.xMomentum += xForce;
            node1.vector.yMomentum += yForce;
            node2.vector.xMomentum -= xForce;
            node2.vector.yMomentum -= yForce;
            return;
          case 'clockvert':
            node1.vector.xMomentum += xForce;
            node1.vector.yMomentum += yForce;
            node2.vector.yMomentum -= xForce + yForce;
            return;
          case 'countervert':
            node1.vector.xMomentum += xForce;
            node1.vector.yMomentum += yForce;
            node2.vector.yMomentum -= yForce - xForce;
            return;
          case 'counterhoriz':
            node1.vector.xMomentum += xForce;
            node1.vector.yMomentum += yForce;
            node2.vector.xMomentum -= xForce + yForce;
            return;
          case 'clockhoriz':
            node1.vector.xMomentum += xForce;
            node1.vector.yMomentum += yForce;
            node2.vector.xMomentum -= xForce - yForce;
            return;
        }
      });
    });

    // Gravitate towards center
    const center = {
      x: dimensions.width / 2,
      y: dimensions.height / 2
    };
    this.nodes.forEach((node1) => {
      const {xForce, yForce} = electricalForce({
        point1: node1.position,
        point2: center,
        coefficient: 1,
        exponent: -0.3
      });

      node1.vector.xMomentum += xForce;
      node1.vector.yMomentum += yForce;
    });

    // Apply damping
    const dampingCoefficient = this.options.momentumDamping;
    this.nodes.forEach(({vector}) => {
      // Apply damping
      vector.xMomentum *= dampingCoefficient;
      vector.yMomentum *= dampingCoefficient;
    });

    // Limit to max velocity
    // const maxVelocity = 20;
    this.nodes.forEach(({vector}) => {
      // Apply max velocity
      const velocity = Math.sqrt(Math.pow(vector.xMomentum, 2) + Math.pow(vector.yMomentum, 2));
      const ratio = this.options.maxVelocity / velocity;
      if (ratio < 1) {
        vector.xMomentum *= ratio;
        vector.yMomentum *= ratio;
      }
    });

    // Adjust positions
    this.nodes.forEach(({position, vector}: NoteNode) => {
      position.x += vector.xMomentum;
      position.y += vector.yMomentum;
    });

    // Enforce boundaries
    // this.nodes.forEach(({position, vector}: NoteNode) => {
    //   if (position.x < 0) {
    //     position.x = 0;
    //   }
    //   if (position.x > world.dimensions.width) {
    //     position.x = world.dimensions.width;
    //   }
    //   if (position.y < 0) {
    //     position.y = 0;
    //   }
    //   if (position.y > world.dimensions.height) {
    //     position.y = world.dimensions.height;
    //   }
    // });
  }

  public destroy() {
    this.nodes.clear();
    this.edges.clear();
  }
}
