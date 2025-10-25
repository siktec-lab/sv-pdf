export async function handle({ event, resolve }) {
  const response = await resolve(event);

  // Example: Allow requests from a specific origin
  // Replace 'https://your-allowed-origin.com' with the actual origin
  response.headers.set('Access-Control-Allow-Origin', 'https://your-allowed-origin.com');

  // Example: Allow requests from any origin (use with caution in production)
  response.headers.set('Access-Control-Allow-Origin', '*');

  // Optional: Add other CORS headers if needed (e.g., methods, headers, credentials)
//   if (event.request.method === 'OPTIONS') {
//     return new Response(null, {
//       headers: {
//         'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
//         'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//         'Access-Control-Allow-Origin': '*' // 'https://your-allowed-origin.com' // Or '*'
//       }
//     });
//   }

  return response;
}