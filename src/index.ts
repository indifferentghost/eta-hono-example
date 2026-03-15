import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { Eta } from 'eta';
import { join } from 'node:path';

const app = new Hono();
const eta = new Eta({
  views: join(import.meta.dirname, './views/'),
});

app.get('/', (c) => {
  return c.html(eta.renderString('<% layout("layouts/base") %><h1>Hello <%= it.name %></h1>', { name: 'Node.JS', title: 'home' }));
})

serve({
  fetch: app.fetch,
  port: 3000,
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});
