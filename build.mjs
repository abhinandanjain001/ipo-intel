import {access} from 'node:fs/promises';
await Promise.all(['public/index.html','public/app.js','public/style.css'].map(f=>access(f)));
console.log('IPO Intel static assets verified. API is deployed as a Vercel function.');
