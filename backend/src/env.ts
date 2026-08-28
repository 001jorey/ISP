// Loads .env before any other module runs.
//
// ES module imports are hoisted: every `import` in server.ts executes BEFORE
// any top-level statement like `dotenv.config()`. Services that read
// process.env while their module is loaded would otherwise see undefined
// values. Keeping this as the FIRST import in server.ts guarantees .env is
// read before any service module runs.
import dotenv from 'dotenv';

dotenv.config();

export {};
