import {JsonSchemaForm} from '../../forms/JsonSchemaForm';
import {JsonSchema} from '../../types/JsonSchema';
import {NoteGraphPhysicsSchema} from '../../types/schemas.generated';
import {NoteGraphPhysics} from './NoteGraphPhysics.generated';

interface NoteGraphPhysicsFormProps {
  value: NoteGraphPhysics;
  onChange: (value: NoteGraphPhysics) => void;
}

export function NoteGraphPhysicsForm(props: NoteGraphPhysicsFormProps): React.ReactElement {
  const {value, onChange} = props;
  const schema: JsonSchema = {
    ...NoteGraphPhysicsSchema,
    title: 'Physics'
  };
  return JsonSchemaForm({
    value,
    onChange,
    schema
  });
}
