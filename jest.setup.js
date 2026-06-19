// Set the API URL for tests (process.env doesn't carry .env.local under jest)
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:4010';

// jsdom doesn't include fetch; define a stub so jest.spyOn can replace it
if (typeof global.fetch === 'undefined') {
  global.fetch = () => Promise.reject(new Error('fetch not mocked'));
}
