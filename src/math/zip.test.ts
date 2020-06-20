import {unzip, zip} from './zip';

describe('zip', () => {
  it('serializes and deserializes JSON', () => {
    const data = {
      key: {
        value: 'string',
        value2: 4
      }
    };

    const zipped = zip(data);
    const unzipped = unzip(zipped);
    expect(unzipped).toEqual(data);
  });
});
