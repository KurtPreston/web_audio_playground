import {Dictionary, map, round} from 'lodash';
import React from 'react';
import {isNumber, isObject} from 'util';
import {JsonSchema} from '../types/JsonSchema';
import {refSchemaMap} from '../types/schemas.generated';
import './JsonSchemaForm.scss';

export interface JsonSchemaFormProps<T> {
  value: T;
  onChange: (value: T) => void;
  schema: JsonSchema;
  required?: boolean;
}

const RANGE_PRECISION = 3;

export function JsonSchemaForm<T>(props: JsonSchemaFormProps<T>): React.ReactElement {
  let {schema} = props;
  if (schema.$ref) {
    const refdSchema = refSchemaMap[schema.$ref];
    if (refdSchema) {
      schema = refdSchema;
      props = {
        ...props,
        schema
      };
    } else {
      throw new Error(`Could not find $ref ${schema.$ref}`);
    }
  }

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

    const subValue: any = isObject(value) ? value[key] : undefined;
    const required = (schema.required || []).includes(key);
    return (
      <React.Fragment key={key}>
        {JsonSchemaForm({
          onChange: onSubValueChanged,
          value: subValue,
          schema: subSchema,
          required
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

interface DropdownOption {
  value: string | number | undefined;
  label: string;
}

function JsonSchemaEnumDropdown(props: JsonSchemaFormProps<any>): React.ReactElement {
  const {required, onChange, schema, value} = props;

  const onSelectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  const options: DropdownOption[] = [
    ...(required ? [] : [{value: undefined, label: ''}]),
    ...(schema.enum || []).map(
      (value, idx) =>
        ({
          value,
          label: (schema.enumNames && schema.enumNames[idx]) || value
        } as DropdownOption)
    )
  ];

  return (
    <div className='jsonschema-enum-dropdown'>
      <label>{schema.title}</label>
      <select value={value} onChange={onSelectionChange}>
        {options.map(({label, value}, idx) => {
          return (
            <option key={idx} value={value}>
              {label}
            </option>
          );
        })}
      </select>
    </div>
  );
}
