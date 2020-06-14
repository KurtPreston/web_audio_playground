export interface JsonSchema {
  $id?: string;
  $ref?: string;
  title?: string;
  type?: 'string' | 'number' | 'integer' | 'object' | 'array';
  format?: string;
  default?: any;
  properties?: {
    [key: string]: JsonSchema;
  };
  items?: JsonSchema;
  enum?: (string | number)[];
  enumNames?: string[];
  tsEnumNames?: string[];
  minimum?: number;
  maximum?: number;
  required?: string[];
  additionalProperties?: boolean;
  oneOf?: JsonSchema[];
}
