// Server code is pre-bundled into a single CommonJS file at build time
// (see the "build" script in package.json). This avoids Vercel's function
// file-tracing missing sibling .ts files that aren't inlined explicitly.
import { createApp } from "./_app-bundle.cjs";

const app = createApp();

export default app;
