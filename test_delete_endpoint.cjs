const http = require('http');

const req = http.request({
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/students/2', // Assuming 2 might exist or we just want to see the error, but we need auth
  method: 'DELETE',
  headers: {
    // Need auth to test this properly, or we can mock it
  }
});
