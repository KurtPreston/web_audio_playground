import {Dictionary, map, round} from 'lodash';
import React from 'react';
import {isNumber} from 'util';
import {JsonSchema} from '../types/JsonSchema';
import './JsonSchemaForm.scss';

export interface JsonSchemaFormProps<T> {
  value: T;
  onChange: (value: T) => void;
  schema: JsonSchema;
}

const RANGE_PRECISION = 3;

export function JsonSchemaForm<T>(props: JsonSchemaFormProps<T>): React.ReactElement {
  const {schema} = props;
  if (schema.enum) {
    if (schema.enum.length > 3) {
      return JsonSchemaEnumDropdown(props as any);
    } else {
      return JsonSchemaEnumRadio(props as any);
    }
  } else if (schema.type === 'object') {
    return JsonSchemaObjectForm(props as any);
  } else if (schema.type === 'number') {
    return JsonSchemaNumberForm(props as any);
  } else {
    throw new Error(`Unspported type ${schema.type}`);
  }
}

function JsonSchemaObjectForm(props: JsonSchemaFormProps<Dictionary<any>>): React.ReactElement {
  const {schema, value, onChange} = props;
  function renderSubObject<T>(subSchema: JsonSchema, key: string): React.ReactNode {
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
    if (isNumber(updatedValue)) {
      onChange(round(updatedValue, RANGE_PRECISION));
    }
  };

  const step = formStep(schema);

  return (
    <div className='jsonschema-number-form'>
      <div className='jsonschema-number-form-title'>
        <label>{title}:</label>
        {value}
      </div>
      <div className='jsonschema-number-form-range'>
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

function formStep(schema: JsonSchema): number | undefined {
  const {minimum, maximum, type} = schema;
  if (!isNumber(minimum) || !isNumber(maximum)) {
    return;
  }

  const range = maximum - minimum;
  const magnitudeRange = Math.round(Math.log10(range));
  const step = Math.pow(10, magnitudeRange - RANGE_PRECISION);

  if (type === 'integer') {
    return Math.max(step, 1);
  } else if (type === 'number') {
    return step;
  }
}

function JsonSchemaEnumRadio(props: JsonSchemaFormProps<any>): React.ReactElement {
  const {onChange, schema, value} = props;

  return (
    <div className='jsonschema-enum-radio'>
      <label>{schema.title}</label>
      <div>
        {(props.schema.enum || []).map((enumValue, idx) => {
          const enumTitle = props.schema.enumNames ? props.schema.enumNames[idx] : enumValue;

          const onSelected = () => {
            onChange(enumValue);
          };

          return (
            <label className='jsonschema-enum-radio-choice' key={idx}>
              <input
                type='radio'
                value={enumValue as any}
                checked={enumValue === value}
                onChange={onSelected}
              />
              {enumTitle}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function JsonSchemaEnumDropdown(props: JsonSchemaFormProps<any>): React.ReactElement {
  const {onChange, schema, value} = props;

  const onSelectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className='jsonschema-enum-dropdown'>
      <label>{schema.title}</label>
      <select value={value} onChange={onSelectionChange}>
        {(schema.enum || []).map((choice, idx) => {
          const title = schema.enumNames ? schema.enumNames[idx] : choice;
          return (
            <option key={idx} value={choice as string | number}>
              {title}
            </option>
          );
        })}
      </select>
    </div>
  );
}
