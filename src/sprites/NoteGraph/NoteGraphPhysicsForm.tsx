import {JsonSchemaForm} from '../../forms/JsonSchemaForm';
import {JSONSchema6} from '../../types/JsonSchema';
import {NoteGraphPhysics} from './NoteGraphPhysics.generated';
import NoteGraphPhysicsSchema from './NoteGraphPhysics.schema.json';

interface NoteGraphPhysicsFormProps {
  value: NoteGraphPhysics;
  onChange: (value: NoteGraphPhysics) => void;
}

export function NoteGraphPhysicsForm(props: NoteGraphPhysicsFormProps): React.ReactElement {
  const {value, onChange} = props;
  const schema: JSONSchema6 = {
    ...(NoteGraphPhysicsSchema as JSONSchema6),
    title: 'Physics'
  };
  return JsonSchemaForm({
    value,
    onChange,
    schema
  });
}
