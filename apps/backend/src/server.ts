import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.BACKEND_PORT, () => {
  console.log(`Synko backend running on port ${env.BACKEND_PORT}`);
});