import { vValidator } from "@hono/valibot-validator";
import { email, nonEmpty, object, pipe, string } from "valibot";
import { newApp } from "../customHono";
import { dbClient } from "../libs/prisma/dbClient";

const app = newApp()
  .get("/", async (c) => {
    const account = await dbClient(c).account.findMany();
    return c.json({ account });
  })
  .get(
    "/:id",
    vValidator(
      "param",
      object({
        id: string(),
      }),
    ),
    async (c) => {
      const account = await dbClient(c).account.findUnique({
        where: {
          id: c.req.param("id"),
        },
      });
      return c.json({ account });
    },
  )
  .post(
    "/create",
    vValidator(
      "json",
      object({
        id: string(),
        email: pipe(string(), nonEmpty(), email()),
      }),
    ),
    async (c) => {
      const params = c.req.valid("json");

      const account = await dbClient(c).account.create({
        data: {
          id: params.id,
          email: params.email,
        },
      });
      return c.json({ account });
    },
  );

export default app;
