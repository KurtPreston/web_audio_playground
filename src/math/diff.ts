import {omitBy, mapValues, isUndefined, isEqual, isObject} from 'lodash';

export function diff(a: any, b: any): any {
  if (a === b) {
    return undefined;
  } else if (isObject(a) && isObject(b)) {
    return omitBy(
      mapValues(a, (value: any, key: string) => {
        const bValue = (b as any)[key];
        if (!isEqual(value, bValue)) {
          return diff(value, bValue);
        }
      }),
      isUndefined
    );
  } else {
    return a;
  }
}
