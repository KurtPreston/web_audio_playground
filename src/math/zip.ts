import cbor from 'cbor';

export function zip(data: any): string {
  const buffer = cbor.encode(data);
  return buffer.toString('base64');
}

export function unzip(zipped: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const buffer = Buffer.from(zipped, 'base64');
    cbor.decodeFirst(buffer, (err, value) => {
      if (err) {
        reject(err);
      } else {
        resolve(value);
      }
    });
  });
}
