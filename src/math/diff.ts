import {omitBy, mapValues, isUndefined, isEqual} from 'lodash';
import {isObject} from 'util';

export function diff(a: any, b: any): any {
  if (a === b) {
    return undefined;
  } else if (isObject(a) && isObject(b)) {
    return omitBy(
      mapValues(a, (value: any, key: string) => {
        if (!isEqual(value, (b as any)[key])) {
          return diff(value, b[key]);
        }
      }),
      isUndefined
    );
  } else {
    return a;
  }
}
