import { Hono } from "hono";

export const newApp = () => {
  const app = new Hono();
  // ....
  return app;
};

export type App = ReturnType<typeof newApp>;
