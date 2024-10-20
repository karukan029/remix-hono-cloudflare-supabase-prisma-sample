import { newApp } from "../customHono";

const app = newApp().get("/", async (c) => {
  return c.json({ hello: "world", var: "my variable" });
});

export default app;
