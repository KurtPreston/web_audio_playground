import {unlinkSync, writeFileSync} from 'fs';
import glob from 'glob';
import gulp from 'gulp'; // or import * as gulp from 'gulp'
import {compileFromFile} from 'json-schema-to-typescript';
import {basename, dirname} from 'path';

gulp.task('jsonschema', async () => {
  const jsonSchemaFiles: string[] = glob.sync('src/**/*.schema.json');
  await Promise.all(
    jsonSchemaFiles.map(async (file: string) => {
      const tsDefinition = await compileFromFile(file, {
        enableConstEnums: false
      });
      const tsFilePath = `${dirname(file)}/${basename(file, '.schema.json')}.generated.ts`;
      writeFileSync(tsFilePath, tsDefinition);
    })
  );
});

gulp.task('clean', () => {
  const generatedFiles = glob.sync('src/**/*.generated.ts');
  generatedFiles.forEach(unlinkSync);
});
