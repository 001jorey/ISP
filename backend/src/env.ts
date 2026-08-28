// Loads .env before any other module runs.
//
// ES module imports are hoisted: every `import` in server.ts executes BEFORE
// the `dotenv.config()` call that used to sit below the import list. Services
// like smsService read process.env while their module is loaded, so they saw
// undefined values and the Africa's Talking SDK threw on missing credentials.
// Keeping this as the FIRST import in server.ts guarantees .env is read first.
import dotenv from 'dotenv';

dotenv.config();

export {};
