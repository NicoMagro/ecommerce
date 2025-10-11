/**
 * API Testing Script for US-1.1
 * Tests the POST /api/admin/products endpoint
 */

/* eslint-disable */
const http = require('http');

const CATEGORY_ID = 'cmgmc670h0005rq1p0wnatgn7'; // Shoes category

// Test cases
const tests = {
  validProduct: {
    name: 'Nike Air Max 90',
    description:
      'The Nike Air Max 90 stays true to its OG running roots with the iconic Waffle sole, stitched overlays and classic TPU accents.',
    shortDescription: 'Iconic Nike sneakers with Max Air cushioning',
    price: 129.99,
    compareAtPrice: 159.99,
    sku: 'NIKE-AM90-001',
    categoryId: CATEGORY_ID,
    status: 'ACTIVE',
    featured: true,
    seoTitle: 'Nike Air Max 90 - Classic Sneakers',
    seoDescription: 'Shop the iconic Nike Air Max 90 with Max Air cushioning',
  },
  duplicateSKU: {
    name: 'Another Product',
    price: 99.99,
    sku: 'NIKE-AM90-001', // Same SKU as above
  },
  negativePrice: {
    name: 'Test Product',
    price: -10,
    sku: 'TEST-NEG-001',
  },
  invalidCategory: {
    name: 'Test Product',
    price: 99.99,
    sku: 'TEST-CAT-001',
    categoryId: 'invalid_id_123',
  },
};

async function makeRequest(path, method, data, cookie = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (cookie) {
      options.headers['Cookie'] = cookie;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null,
          });
        } catch {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body,
          });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing US-1.1: POST /api/admin/products\n');
  console.log('═══════════════════════════════════════════\n');

  // Test 1: Without authentication (should fail)
  console.log('Test 1: Without authentication');
  console.log('Expected: 401 Unauthorized');
  const test1 = await makeRequest('/api/admin/products', 'POST', tests.validProduct);
  console.log(`✓ Status: ${test1.status}`);
  console.log(`✓ Response:`, JSON.stringify(test1.body, null, 2));
  console.log('');

  // Note: For authenticated tests, we would need to implement login flow
  // Since NextAuth uses cookies and CSRF tokens, we'll document that manual testing
  // with a browser or Postman is required for authenticated endpoints

  console.log('📋 Authenticated Tests:');
  console.log('For tests requiring authentication, use:');
  console.log('1. Open http://localhost:3000 in browser');
  console.log('2. Login as admin@ecommerce.com / Admin123!');
  console.log('3. Use browser DevTools or Postman with cookies');
  console.log('');
  console.log('Or continue testing with cURL:');
  console.log('');
  console.log('# First, login and save cookies:');
  console.log('curl -X POST http://localhost:3000/api/auth/signin \\');
  console.log('  -c cookies.txt \\');
  console.log('  -d "email=admin@ecommerce.com&password=Admin123!"');
  console.log('');
  console.log('# Then use cookies for authenticated requests:');
  console.log('curl -X POST http://localhost:3000/api/admin/products \\');
  console.log('  -b cookies.txt \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log(`  -d '${JSON.stringify(tests.validProduct, null, 2)}'`);
}

runTests().catch(console.error);
