import {Dictionary, map} from 'lodash';
import React from 'react';
import {isNumber} from 'util';
import {JSONSchema6} from '../types/JsonSchema';

export interface JsonSchemaFormProps<T> {
  value: T;
  onChange: (value: T) => void;
  schema: JSONSchema6;
}

export function JsonSchemaForm<T>(props: JsonSchemaFormProps<T>): React.ReactElement {
  const {schema} = props;
  const {type} = schema;
  switch (type) {
    case 'object':
      return JsonSchemaObjectForm(props as any);
    case 'number':
      return JsonSchemaNumberForm(props as any);
    default:
      throw new Error(`Unspported type ${type}`);
  }
}

function JsonSchemaObjectForm(props: JsonSchemaFormProps<Dictionary<any>>): React.ReactElement {
  const {schema, value, onChange} = props;
  function renderSubObject<T>(subSchema: JSONSchema6, key: string): React.ReactNode {
    const onSubValueChanged = (subValue: T) => {
      onChange({
        ...value,
        [key]: subValue
      });
    };

    const subValue: any = value[key];
    return (
      <React.Fragment key={key}>
        {JsonSchemaForm({
          onChange: onSubValueChanged,
          value: subValue,
          schema: subSchema
        })}
      </React.Fragment>
    );
  }

  return (
    <fieldset>
      <label>{schema.title}</label>
      {map(schema.properties || {}, renderSubObject)}
    </fieldset>
  );
}

function JsonSchemaNumberForm(props: JsonSchemaFormProps<number>): React.ReactElement {
  const {value, onChange, schema} = props;
  const {title, minimum, maximum} = schema;
  const onPropChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedValue = parseFloat(event.target.value);
    debugger;
    if (isNumber(updatedValue)) {
      onChange(updatedValue);
    }
  };

  const step = formStep(schema);

  return (
    <div>
      <label>{title}</label>
      <div>
        {value}
        <input
          type='range'
          value={value}
          onChange={onPropChange}
          min={minimum}
          max={maximum}
          step={step}
          style={{display: 'block'}}
        />
      </div>
    </div>
  );
}

function formStep(schema: JSONSchema6): number | undefined {
  const {minimum, maximum, type} = schema;
  if (!isNumber(minimum) || !isNumber(maximum)) {
    return;
  }

  const range = maximum - minimum;
  const magnitudeRange = Math.round(Math.log10(range));
  const step = Math.pow(10, magnitudeRange - 3);

  if (type === 'integer') {
    return Math.max(step, 1);
  } else if (type === 'number') {
    return step;
  }
}
