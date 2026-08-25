// Server code is pre-bundled into a single ESM file at build time
// (see the "build" script in package.json). This avoids Vercel's function
// file-tracing missing sibling .ts files, and keeps ESM-only dependencies
// (e.g. firebase-admin's "jose") working correctly.
import { createApp } from "./_app-bundle.mjs";

const app = createApp();

export default app;
