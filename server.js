const http = require('http')
const crypto = require('crypto')
const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'content-type': 'text/plain' })
    res.end('fase3b-ok')
    return
  }
  res.writeHead(404)
  res.end('missing')
})
server.on('upgrade', (req, socket) => {
  if (!req.url || !req.url.startsWith('/ws')) { socket.destroy(); return }
  const key = req.headers['sec-websocket-key']
  if (!key) { socket.destroy(); return }
  const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64')
  socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n')
  // text frame "fase3b-ws-ok"
  const payload = Buffer.from('fase3b-ws-ok')
  const frame = Buffer.alloc(2 + payload.length)
  frame[0] = 0x81
  frame[1] = payload.length
  payload.copy(frame, 2)
  socket.write(frame)
})
server.listen(Number(process.env.PORT || 3000), '0.0.0.0')
