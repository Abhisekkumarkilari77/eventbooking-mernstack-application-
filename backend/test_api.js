const http = require('http');

const post = (path, data, token) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ body: JSON.parse(body), status: res.statusCode }));
    });
    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
};

const get = (path, token) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'GET',
      headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ body: JSON.parse(body), status: res.statusCode }));
    });
    req.on('error', reject);
    req.end();
  });
};

const runTest = async () => {
  try {
    const login = await post('/api/auth/login', { email: 'organizer@eventhub.com', password: 'password123' });
    const token = login.body.token;
    
    const venues = await get('/api/venues', token);
    const venueId = venues.body.venues[0]._id;

    const res = await post('/api/events', {
      title: 'API-TEST-' + Date.now(),
      description: 'Test',
      category: 'Concert',
      venueId,
      startDate: new Date(),
      endDate: new Date(Date.now() + 3600000),
      totalSeats: 2,
      sections: [
        { name: 'VIP', price: 1000, rowCount: 1, seatsPerRow: 1 },
        { name: 'General', price: 500, rowCount: 1, seatsPerRow: 1 }
      ]
    }, token);

    console.log('STATUS:', res.status);
    console.log('RESULT:', JSON.stringify(res.body, null, 2));
  } catch (err) {
    console.error('ERROR:', err);
  }
};

runTest();
