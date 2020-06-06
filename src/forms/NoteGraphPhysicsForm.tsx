import NoteGraphPhysicsSchema from '../schemas/NoteGraphPhysics.json';
import {NoteGraphPhysics} from '../sprites/NoteGraph';
import {JSONSchema6} from '../types/JsonSchema';
import {JsonSchemaForm} from './JsonSchemaForm';

interface NoteGraphPhysicsFormProps {
  value: NoteGraphPhysics;
  onChange: (value: NoteGraphPhysics) => void;
}

export function NoteGraphPhysicsForm(props: NoteGraphPhysicsFormProps): React.ReactElement {
  const {value, onChange} = props;
  return JsonSchemaForm({
    value,
    onChange,
    schema: NoteGraphPhysicsSchema as JSONSchema6
  });
}
