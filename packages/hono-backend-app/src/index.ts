import { newApp } from "./customHono";
import acountsApp from "./routes/account";
import profileApp from "./routes/profile";
import samplesApp from "./routes/sample";

const app = newApp();

const routes = app
  .route("/accounts", acountsApp)
  .route("/profiles", profileApp)
  .route("/samples", samplesApp);

export default app;
export type AppType = typeof routes;
