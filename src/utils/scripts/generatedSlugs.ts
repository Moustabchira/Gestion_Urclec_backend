import permissions from '../seed/PermissionSeeder.ts';
import { slugify } from '../slugify.ts';
import fs from 'fs';
import path from 'path';

const outputPath = path.resolve('src/utils/scripts/permissionSlugs.ts');

fs.mkdirSync(path.dirname(outputPath), { recursive: true });

const content = `export const PERMISSIONS = {\n${permissions
  .map(p => `  ${slugify(p.name)}: '${slugify(p.name)}'`)
  .join(",\n")}\n};\n`;

console.log("Chemin où le fichier sera créé :", outputPath);

fs.writeFileSync(outputPath, content);

console.log('Fichier permissionSlugs.ts généré avec succès');
