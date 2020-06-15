import {unzip, zip} from './zip';

describe('zip', () => {
  it('serializes and deserializes JSON', async () => {
    const data = {
      key: {
        value: 'string',
        value2: 4
      }
    };

    const zipped = zip(data);
    const unzipped = await unzip(zipped);
    expect(unzipped).toEqual(data);
  });
});
