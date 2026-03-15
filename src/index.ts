import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { Eta } from 'eta';

const app = new Hono();
const eta = new Eta();

app.get('/', (c) => {
  return c.text(eta.renderString('Hello <%= it.name %>', { name: 'Node.JS' }));
})

serve({
  fetch: app.fetch,
  port: 3000,
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});
