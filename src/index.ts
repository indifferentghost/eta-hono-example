import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { Eta } from 'eta';

const app = new Hono();
const eta = new Eta();

const baseLayout = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= it.title %></title>
</head>
<body>
  <%~ it.body %>
</body>
</html>`;

eta.loadTemplate('@base', baseLayout);

app.get('/', (c) => {
  return c.html(eta.renderString('<% layout("@base") %><h1>Hello <%= it.name %></h1>', { name: 'Node.JS', title: 'home' }));
})

serve({
  fetch: app.fetch,
  port: 3000,
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});
