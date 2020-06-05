import React, {ChangeEvent} from 'react';
import {DopplerMode, DopplerSettings} from '../types/DopplerSettings.d';

export interface DopplerSettingFormProps {
  value: DopplerSettings;
  onChange: (value: DopplerSettings) => void;
}

export function DopplerSettingsForm(props: DopplerSettingFormProps) {
  const {value, onChange} = props;
  const modes: DopplerMode[] = [DopplerMode.Off, DopplerMode.On, DopplerMode.Invert];

  function onModeChange(event: ChangeEvent<HTMLInputElement>) {
    const updatedValue = event.target.value as DopplerMode;

    onChange({
      ...value,
      mode: updatedValue
    });
  }

  function onSpeedOfSoundChanged(event: ChangeEvent<HTMLInputElement>) {
    const updatedValue = parseInt(event.target.value);

    onChange({
      ...value,
      speedOfSound: updatedValue
    });
  }

  const speedOfSoundForm =
    value.mode !== DopplerMode.Off ? (
      <label>
        Speed of Sound
        <div>
          <input
            type='range'
            value={value.speedOfSound}
            onChange={onSpeedOfSoundChanged}
            min={1}
            max={5000}
            style={{display: 'block'}}
          />
          {value.speedOfSound} px/frame
        </div>
      </label>
    ) : null;

  return (
    <fieldset>
      <label>Doppler</label>
      <div>
        <div>
          {modes.map((mode: DopplerMode) => (
            <label key={mode}>
              <input
                type='radio'
                value={mode}
                checked={mode === value.mode}
                onChange={onModeChange}
              />
              {mode}
            </label>
          ))}
        </div>
        {speedOfSoundForm}
      </div>
    </fieldset>
  );
}
