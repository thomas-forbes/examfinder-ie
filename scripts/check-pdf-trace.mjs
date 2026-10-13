import { execFileSync } from 'node:child_process'
import {
  copyFileSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readlinkSync,
  rmSync,
  symlinkSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const entry = join(root, 'apps/web/.next/server/pages/api/pdf.js')
const trace = JSON.parse(readFileSync(entry + '.nft.json', 'utf8'))
const isolated = mkdtempSync(join(tmpdir(), 'examfinder-pdf-trace-'))

try {
  // Match a serverless deployment: copy only the route's traced files, without
  // falling back to the complete workspace node_modules used by `next start`.
  for (const source of [
    entry,
    ...trace.files.map((file) => resolve(dirname(entry), file)),
  ]) {
    const path = relative(root, source)
    if (path.startsWith('..'))
      throw new Error(`Trace escapes repository: ${path}`)
    const target = join(isolated, path)
    mkdirSync(dirname(target), { recursive: true })
    const stat = lstatSync(source)
    if (stat.isSymbolicLink()) symlinkSync(readlinkSync(source), target)
    else if (stat.isDirectory()) mkdirSync(target, { recursive: true })
    else copyFileSync(source, target)
  }
  const isolatedEntry = join(isolated, relative(root, entry))
  const check = `(async () => {
    const route = await require(${JSON.stringify(isolatedEntry)});
    if (typeof route.default !== 'function') throw new Error('PDF route did not initialize');
  })().catch(error => { console.error(error); process.exitCode = 1; });`
  execFileSync(process.execPath, ['-e', check], {
    cwd: isolated,
    env: { ...process.env, NODE_PATH: '' },
    stdio: 'inherit',
  })
  console.log(
    `PDF route loaded from ${trace.files.length} isolated deployment files`
  )
} finally {
  rmSync(isolated, { recursive: true, force: true })
}
