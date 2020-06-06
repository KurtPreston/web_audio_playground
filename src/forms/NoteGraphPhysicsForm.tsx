import NoteGraphPhysicsSchema from '../schemas/NoteGraphPhysics.json';
import {JSONSchema6} from '../types/JsonSchema';
import {NoteGraphPhysics} from '../types/NoteGraphPhysics.d';
import {JsonSchemaForm} from './JsonSchemaForm';

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
