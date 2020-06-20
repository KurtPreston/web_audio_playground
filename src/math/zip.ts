import cbor from 'cbor';

export function zip(data: any): string {
  const buffer = cbor.encode(data);
  return buffer.toString('base64');
}

export function unzip(zipped: string): any {
  const buffer = Buffer.from(zipped, 'base64');
  return cbor.decodeFirstSync(buffer);
}
