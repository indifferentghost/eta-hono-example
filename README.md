# Hono Eta Example
An step-by-step example of how to implement [ETA](https://eta.js.org/) inside of [Hono](https://hono.dev/). The steps are saved in order via commit.

This project was bootstrapped with [`create-hono`](https://hono.dev/docs/guides/create-hono) 

## Installation
This project by default uses npm as a package manager, and requires NodeJS 20.11.0 or greater to run.
```sh
npm install
```

## Commands
This project was bootsrapped using the [`nodejs` template](https://github.com/honojs/starter/tree/main/templates/nodejs) for Hono. No commands have been added outside of that template.

- `npm run dev` will start development mode with hotreloading using [`tsx`](https://www.npmjs.com/package/tsx).
- `npm run build` will run the [_TypeScript compiler_ CLI (`tsc`)](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
- `npm start` will run the build output from the _tsc_ compiler above.

## Context
This project came from a lengthy thread implementing templating engines like EJS. The origional discussion took place in the [100Devs Discord](http://leonnoel.com/discord). Here's a [link](https://discord.com/channels/735923219315425401/1482531353827217488) to the thread.

Below is copypasta'd directly from discord expecting discord features and markdown.
<details>
  <summary>Hono ETA implementation</summary>

# ETA
The backend of the 100devs curriculum introduces EJS (Embedded JavaScript templates). Today we're looking at a modern, more configurable, subset of EJS called [ETA](https://eta.js.org/). The homepage lists a dozen or so reasons why, but I like it because it's a simple interface that does just enough without frills.

**Disclaimer**: Using EJS is fine!
-# I'm writing a service using a framework ([Hono](https://hono.dev)) which doesn't have natively embedded template languages.
## Hello Hono
Hono provides us a [Hello World](https://hono.dev/docs/getting-started/nodejs#_2-hello-world) example for NodeJS. This should feel similar to Express.

```typescript
import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();
app.get('/', (c) => c.text("Hello Node.js!"));

serve(app);
```
This example is implemented for you in the NodeJS [hono/starter template](https://github.com/honojs/starter/tree/main/templates). You can create a folder containing the template by using `npm create hono@latest my-app -- --template nodejs` this starter also handles implementation details, like running hono in development. Check out the [NodeJS template package.json](https://github.com/honojs/starter/blob/main/templates/nodejs/package.json) for full details.Hono wasn’t created explicitly for NodeJS, thus the `serve` adapter from `@hono/node-server` injects the Hono application into [`http.createServer`](https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener).

## Estimated time to implement ETA?
-# It’s… it’s pretty quick

**Install** the [`eta`](https://www.npmjs.com/package/eta) package.
```sh
npm install eta
```
**Import** `Eta` and setup a new instance:
```typescript
import { Eta } from "eta";
const eta = new Eta();
```
**Render** the template string:
```typescript
eta.renderString("Hello <%= it.name %>!", { name: "Node.js" });
```
Putting that all together.
```typescript
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { Eta } from "eta";

const app = new Hono();
const eta = new Eta();
app.get('/', (c) => c.text(
  eta.renderString("Hello <%= it.name %>!", { name: "Node.js" })
));

serve(app);
```
##  I don't speak Wingdings. What's `<%=`, and `%>`? Where did _`it`_ come from?
For Eta these are [configuration defaults](https://eta.js.org/docs/4.x.x/api/configuration) and can be changed. They're conventions brought over from other libraries; `<%` and `%>` are known as _delimiters_.
**delimiter** _noun_. 
> a character or sequence of characters used to define boundaries between separate data fields or text segments.
These delimiters have been used in templating since [ASP in '96](https://en.wikipedia.org/wiki/Active_Server_Pages). EJS advertises them as simple ||I personally find mustaches delimiters easier `{{` and `}}`||.
### Okay, but there's an equals sign...
The equals sign (`=`) is used for outputting data. In the example above we're directly outputting the value stored in the data object (`it`) key of `name`.
By default it will automatically XML-escape the outputted data, if you want to output raw html use a tilde (`~`) instead of an equals.
If we need to evaluate JavaScript and not output the result, use only the delimiter. More cohesive examples of evaluating and executing JavaScript in Eta can be found on the [syntax cheatsheet](https://eta.js.org/docs/4.x.x/intro/syntax-cheatsheet).
### `it` came from beyond the codebase
The data object name is defaulted to `it` (the data object name, like the delimiters can be changed in the configuration). I unfortunately don't have the history for why `it` is the default name, EJS used `locals`. `it` is a convention as I've seen it used other places.
### Suggestion: don't modify the defaults for variables in the config
Documentation helps, the more you deviate from the default documentation it increases the cognitive load of groking the system. I like Eta for its simplicity, don't make it more complicated than it has to be.
## Scaling Up
What we've done so far seems like overcomplicated template literals; templating languages aren't usually for processing one-off strings of text in a single handler. Let's setup with expectations to scale.
### Basic HTML Template Layout
I've written `<html><head></head><body></body></html>` thousands of times, let's make sure I only have to write it once for this project. VSCode preinstalls an html5 template for use with emmet via `html:5` on any page set as an html file.
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  
</body>
</html>
```
We'll make title a variable `it.title` and put our output in the body. The [docs](https://eta.js.org/docs/4.x.x/intro/template-syntax#partials-and-layouts) give us `<%~ it.body %>` to output the child content. Notice the tilde (`~`) this is required as the layout children will probably be html documents and need the _raw_ html. This isn't the case for _title_; however. Modifying the `html:5` template above we now have:
```html
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
</html>
```
### Use the layout
The Eta engine provides a way to [dynamically define templates](https://eta.js.org/docs/4.x.x/api/overview#defining-templates-programmatically) using `eta.loadTemplate`. As we're dynamically loading the layout we can explicitly state it's a component in memory by prefacing with an at sign (`@`). This will let the Eta engine know to look there first. If we set our template string to a variable this allows us to keep it cleaner:
```ts
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
```
Let's use this template to our rendered string. The syntax for using a layout is `<% layout('./layout-location') %>`, which would normally look in the folder configured for views, as our layout starts with an at sign `@` it'll first look in memory. Let's first add the layout and wrap the text in a heading tag (since we're in an html document)
```typescript
'<% layout("@base") %><h1>Hello <%= it.name %></h1>'
```
We defined a `title` variable expected in our layout for the data object, we'll want to include title in our variables object: `{ name: 'Node.JS', title: 'home' }`
Wrapping this all together let's add an html context handler (`c.html`) so hono responds with correct media types
```typescript
c.html(
  eta.renderString(
    '<% layout("@base") %><h1>Hello <%= it.name %></h1>',
    { name: 'Node.JS', title: 'home' }
  )
);
```
Putting all of that together you get:
```typescript
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
  return c.html(
    eta.renderString(
      '<% layout("@base") %><h1>Hello <%= it.name %></h1>',
      { name: 'Node.JS', title: 'home' }
    )
  );
})
```
### `.eta` Files and Configuration
Inline templates aren't clean and don't make a scalable solution. Like EJS, Eta has a custom file extension for distinguishing between anything and this specific template language. These files by default have a `.eta` extension.
Eta syntax is a subset of EJS so any syntax highlighter that works for EJS should work for Eta. The Eta resources section mentions [eta-vscode](https://github.com/shadowtime2000/eta-vscode) which works right out of the box.
-# **Disclaimer**: Please do your own research on extensions, these have been verified for security or operation by myself or the creator of Eta. This is code running on _your_ computer.
If we move our `baseLayout` to `src/views/layouts/base.eta` and update the import to `layout('layouts/base')` invoking the template will throw:
```sh
EtaFileResolutionError [EtaFileResolution Error]: Views directory is not defined
```
Eta will attempt to look for Partials and Layouts in the where ever the config defines `views`, it is by convention a `views` folder.  Let's create that folder inside the source (`/src`) directory called `views`. We can set this in the config by getting the current directory name and path.joining it with the `views` directory. [`import.meta.dirname`](https://nodejs.org/api/esm.html#importmetadirname) has been available in node since v20.11.0
```typescript
import { join } from 'node:path';
//...
const eta = new Eta({
  views: join(import.meta.dirname, './views/'),
});
```
Putting it all together your folder structure should include the new layout file: `/src/views/base.eta` and your index should now be:
```typescript
import { join } from 'node:path';

const app = new Hono();
const eta = new Eta({
  views: join(import.meta.dirname, './views/'),
});

app.get('/', (c) => {
  return c.html(
    eta.renderString(
      '<% layout("layouts/base") %><h1>Hello <%= it.name %></h1>',
      { name: 'Node.JS', title: 'home' }
    )
  );
});
```
### Moving the Template.
Let's move `<% layout("layouts/base") %><h1>Hello <%= it.name %></h1>` to it's own view. I'll create a new file named `home.eta` inside the `/views` folder. Layer the template nicely by putting a newline after the import:
```eta
<!-- home.eta -->
<% layout("layouts/base") %>
<h1>Hello <%= it.name %></h1>
```
and use `render` instead of `renderString` with the name of the file:
```typescript
eta.render('home', { name: 'Node.JS', title: 'home' });
```
Finishing off with a new file `views/home.eta` and the following change to our index:
```typescript
app.get('/', (c) => {
  return c.html(eta.render('home', { name: 'Node.JS', title: 'home' }));
})
```
## Caveats
### Don't `useWith`
`it` isn't beautiful, but directly inserting the variable names has a higher change of namespace collision and is slower, see: https://eta.js.org/docs/4.x.x/api/overview#getting-rid-of-it

### Suggestion: don't modify the defaults for variables in the config
Documentation helps, the more you deviate from the default documentation it increases the cognitive load of groking the system. I like Eta for its simplicity, don't make it more complicated than it has to be. The delimiters `<%`, `%>`, extension `.eta`, and data object `it` are all configurable, but their defaults heavily mentioned in the documentation.

### Security
Read through the [security section](https://eta.js.org/docs/4.x.x/intro/security) for Eta. The TL;DR is that running templates is running JavaScript code, if you're allowing users to create templates they can run JavaScript on your machines/servers/etc. Always use xml-escaped data through the data object for user input. By default eta properly escapes when using output `<%=`.
</details>