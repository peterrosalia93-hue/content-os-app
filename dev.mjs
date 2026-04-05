import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'

const root = process.cwd()
const port = Number(process.env.PORT || 4173)
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
}

const server = createServer((req, res) => {
  const urlPath = req.url === '/' ? '/index.html' : req.url
  const filePath = normalize(join(root, urlPath))
  if (!filePath.startsWith(root) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    res.writeHead(404)
    res.end('Not found')
    return
  }
  res.writeHead(200, { 'Content-Type': types[extname(filePath)] || 'application/octet-stream' })
  createReadStream(filePath).pipe(res)
})

server.listen(port, () => {
  console.log(`Content OS MVP running at http://localhost:${port}`)
})
