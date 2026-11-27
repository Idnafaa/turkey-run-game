// serve.ts — tiny static file server for local play (Node 22, stdlib only).
// Run `node serve.ts` and open the printed address. It serves only files
// inside game/, picks a content type from the extension, and answers 404
// for anything missing. Nothing here is needed by the game itself.
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const gameRoot = resolve(fileURLToPath(new URL('./game', import.meta.url)));
const cliArgs = process.argv.slice(2);
const flagAt = cliArgs.indexOf('--port');
const wanted = flagAt === -1 ? 8080 : Number(cliArgs[flagAt + 1]);
const listenPort = Number.isInteger(wanted) && wanted > 0 && wanted < 65536 ? wanted : 8080;

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wasm': 'application/wasm',
};

createServer((req, res) => {
  let route: string;
  try {
    route = decodeURIComponent(new URL(req.url ?? '/', 'http://127.0.0.1').pathname);
  } catch {
    res.writeHead(400).end('bad request');
    return;
  }
  if (route.endsWith('/')) route += 'index.html';
  const filePath = resolve(join(gameRoot, normalize(route)));
  if (filePath !== gameRoot && !filePath.startsWith(gameRoot + sep)) {
    res.writeHead(403).end('forbidden');
    return;
  }
  let length: number;
  try {
    const info = statSync(filePath);
    if (!info.isFile()) throw new Error('not a file');
    length = info.size;
  } catch {
    res.writeHead(404).end('not found');
    return;
  }
  res.writeHead(200, {
    'content-type': TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
    'content-length': length,
    'cache-control': 'no-store',
  });
  createReadStream(filePath).pipe(res);
}).listen(listenPort, '127.0.0.1', () => {
  console.log('PARDON RUN is ready at http://localhost:' + listenPort);
});
