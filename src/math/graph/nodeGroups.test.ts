import {describe, it, expect} from 'vitest';
import {nodeGroups} from './nodeGroups';

describe('nodeGroups', () => {
  it('returns the list of unique groups of nodes', () => {
    const groups = nodeGroups({
      nodes: ['a', 'b', 'c', 'd', 'e', 'f'],
      edges: [
        {
          node1: 'a',
          node2: 'b'
        },
        {
          node1: 'b',
          node2: 'c'
        },
        {
          node1: 'd',
          node2: 'e'
        }
      ]
    });

    expect(groups.length).toEqual(3);
  });
});
