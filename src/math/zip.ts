import {encode, decode} from 'cbor-x';

export function zip(data: any): string {
  const buffer = encode(data);
  return buffer.toString('base64');
}

export function unzip(zipped: string): any {
  const buffer = Buffer.from(zipped, 'base64');
  return decode(buffer);
}
