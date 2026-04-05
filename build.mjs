import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const dist = join(root, 'dist')

if (existsSync(dist)) {
  rmSync(dist, { recursive: true, force: true })
}

mkdirSync(dist, { recursive: true })

for (const file of ['index.html', 'styles.css', 'app.js', 'README.md']) {
  cpSync(join(root, file), join(dist, file))
}

console.log('Built Content OS MVP to dist/')
