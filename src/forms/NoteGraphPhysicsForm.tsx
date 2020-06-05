import React, {ChangeEvent} from 'react';
import {NoteGraphPhysics} from '../sprites/NoteGraph';

interface NoteGraphPhysicsFormProps {
  value: NoteGraphPhysics;
  onChange: (value: NoteGraphPhysics) => void;
}

export function NoteGraphPhysicsForm(props: NoteGraphPhysicsFormProps) {
  const {value, onChange} = props;

  function numberForm(params: {
    key: keyof NoteGraphPhysics;
    title: string;
    min: number;
    max: number;
    step?: number;
  }): React.ReactNode {
    const {title, key, min, max, step} = params;
    const propValue = value[key];
    const onPropChange = (event: ChangeEvent<HTMLInputElement>) => {
      const updatedValue = parseFloat(event.target.value);

      onChange({
        ...value,
        [key]: updatedValue
      });
    };
    return (
      <div>
        <label key={key}>{title}</label>
        <div>
          {propValue}
          <input
            type='range'
            value={propValue}
            onChange={onPropChange}
            min={min}
            max={max}
            step={step || 1}
            style={{display: 'block'}}
          />
        </div>
      </div>
    );
  }

  return (
    <fieldset>
      <label>Physics</label>
      {numberForm({
        key: 'edgeLength',
        title: 'Edge Length',
        min: 1,
        max: 1000
      })}
      {numberForm({
        key: 'edgeStrength',
        title: 'Edge Rigidity',
        min: 0.001,
        max: 0.3,
        step: 0.001
      })}
      {numberForm({
        key: 'repulsionExponent',
        title: 'Repulsion Scaling',
        min: 1,
        max: 3,
        step: 0.1
      })}
      {numberForm({
        key: 'repulsionStrength',
        title: 'Repulsion Strength',
        min: 0,
        max: 20_000,
        step: 1000
      })}
      {numberForm({
        key: 'momentumDamping',
        title: 'Inertia',
        min: 0,
        max: 1,
        step: 0.1
      })}
      {numberForm({
        key: 'maxVelocity',
        title: 'maxVelocity',
        min: 1,
        max: 1000,
        step: 1
      })}
    </fieldset>
  );
}
