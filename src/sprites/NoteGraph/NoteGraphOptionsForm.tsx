import {JsonSchemaForm} from '../../forms/JsonSchemaForm';
import {JsonSchema} from '../../types/JsonSchema';
import {NoteGraphOptionsSchema} from '../../types/schemas.generated';
import {NoteGraphOptions} from './NoteGraphOptions.generated';

interface NoteGraphOptionsFormProps {
  value: NoteGraphOptions;
  onChange: (value: NoteGraphOptions) => void;
}

export function NoteGraphOptionsForm(props: NoteGraphOptionsFormProps): React.ReactElement {
  const {value, onChange} = props;
  const schema: JsonSchema = {
    ...NoteGraphOptionsSchema,
    title: 'Options'
  };
  return JsonSchemaForm({
    value,
    onChange,
    schema
  });
}
