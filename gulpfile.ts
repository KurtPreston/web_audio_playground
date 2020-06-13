import {readFileSync, unlinkSync, writeFileSync} from 'fs';
import glob from 'glob';
import gulp from 'gulp'; // or import * as gulp from 'gulp'
import {compileFromFile} from 'json-schema-to-typescript';
import {map} from 'lodash';
import {basename, dirname} from 'path';
import prettier from 'prettier';
import prettierOptions from './.prettierrc.json';
import {JsonSchema} from './src/types/JsonSchema';

gulp.task('jsonschema', async () => {
  const jsonSchemaFiles: string[] = glob.sync('src/**/*.schema.json');

  // Create schema index file
  const schemas: {[id: string]: JsonSchema} = {};
  jsonSchemaFiles.forEach((filePath) => {
    const schema: JsonSchema = JSON.parse(readFileSync(filePath).toString());
    const $id: string = fileToId(filePath);
    schemas[$id] = {
      $id,
      ...schema
    };
  });
  const generatedSchemaTypescript = [
    "import {JsonSchema} from './JsonSchema'",
    `export const refSchemaMap: {[$ref: string]: JsonSchema} = ${JSON.stringify(schemas)}`,
    ...map(
      schemas,
      (schema: JsonSchema, $id) =>
        `export const ${$id}Schema: JsonSchema = ${JSON.stringify(schema)}`
    )
  ].join('\n');
  const prettified = prettier.format(
    generatedSchemaTypescript,
    prettierOptions as prettier.Options
  );
  writeFileSync('src/types/schemas.generated.ts', prettified);

  // Create .generated.ts files
  await Promise.all(
    jsonSchemaFiles.map(async (filePath: string) => {
      const tsDefinition = await compileFromFile(filePath, {
        enableConstEnums: false,
        $refOptions: {
          resolve: {
            file: {
              read: (file) => {
                const $id = fileToId(file.url);
                const refdSchema: JsonSchema = schemas[$id];
                return JSON.stringify(refdSchema);
              }
            }
          }
        }
      });
      const tsFilePath = `${dirname(filePath)}/${basename(filePath, '.schema.json')}.generated.ts`;
      writeFileSync(tsFilePath, tsDefinition);
    })
  );
});

gulp.task('clean', async () => {
  const generatedFiles = glob.sync('src/**/*.generated.ts');
  generatedFiles.forEach(unlinkSync);
});

function fileToId(filename: string): string {
  return basename(filename, '.schema.json');
}
