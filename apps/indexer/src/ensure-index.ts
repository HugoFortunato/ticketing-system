import { ensureEventsIndex } from "./elastic.js";

await ensureEventsIndex();
console.log("Índice events pronto");
