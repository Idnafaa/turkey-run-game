// PARDON RUN — hand-in program (Node 22, standard library only).
// The playable game sits in game/ beside this file as plain static files.
// This program copies game/ and screenshots/ into the output folder and
// writes dossier.json there using the vendored make.fun library.
// Local check: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const baseDir = fileURLToPath(new URL('.', import.meta.url));
const targetDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Copy one entry folder into the output, creating the destination first so
// a brand-new output folder behaves exactly like a reused one.
function copyEntryFolder(folderName: string): void {
  const from = join(baseDir, folderName);
  const to = join(targetDir, folderName);
  mkdirSync(to, { recursive: true });
  if (existsSync(from)) cpSync(from, to, { recursive: true });
}

mkdirSync(targetDir, { recursive: true });
copyEntryFolder('game');
copyEntryFolder('screenshots');

writeFileSync(
  join(targetDir, 'dossier.json'),
  buildDossier(targetDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
