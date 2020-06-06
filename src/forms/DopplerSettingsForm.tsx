import DopplerSettingsSchema from '../schemas/DopplerSettings.json';
import {DopplerSettings} from '../types/DopplerSettings.d';
import {JsonSchema} from '../types/JsonSchema';
import {JsonSchemaForm} from './JsonSchemaForm';

export interface DopplerSettingFormProps {
  value: DopplerSettings;
  onChange: (value: DopplerSettings) => void;
}

export function DopplerSettingsForm(props: DopplerSettingFormProps) {
  return JsonSchemaForm({
    ...props,
    schema: DopplerSettingsSchema as JsonSchema
  });
}
