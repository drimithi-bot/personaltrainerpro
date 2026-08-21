const http = require('http');

const req = http.request({
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/students/2',
  method: 'DELETE',
  headers: {
    // Missing token, let me generate one or bypass it.
  }
});
req.end();
