import { vValidator } from "@hono/valibot-validator";
import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import {
  custom,
  date,
  maxLength,
  nonEmpty,
  nullish,
  number,
  object,
  pipe,
  string,
} from "valibot";
import { newApp } from "../customHono";
import { dbClient } from "../libs/prisma/dbClient";

const app = newApp()
  .get("/me", async (c) => {
    /**
     * Since we are assuming the use of Cloudflare Workers' Service Binding,
     * we have not implemented the authentication process.
     *
     * When using Cloudflare Workers, consider security measures such as restricting access using Cloudflare Access Service Tokens.
     * @see https://developers.cloudflare.com/cloudflare-one/identity/service-tokens/
     */
    const userId = getCookie(c).userId;

    if (!userId) {
      const errorResponse = new Response("Unauthorized", {
        status: 401,
        headers: {
          Authenticate: 'error="invalid_token"',
        },
      });
      throw new HTTPException(401, { res: errorResponse });
    }

    const profile = await dbClient(c).profile.findUnique({
      where: {
        id: userId,
      },
    });

    return c.json({ profile });
  })
  .post(
    "/create",
    vValidator(
      "json",
      object({
        name: pipe(string(), nonEmpty(), maxLength(30)),
        birthday: date(),
        genderId: nullish(
          pipe(
            number(),
            custom(
              (value) => value === 0 || value === 1,
              "Value must be either 0 or 1",
            ),
          ),
        ),
        activityAreaId: number(),
        iconImageUrl: nullish(string()),
        oneWord: pipe(string(), nonEmpty(), maxLength(200)),
      }),
    ),
    async (c) => {
      /**
       * Since we are assuming the use of Cloudflare Workers' Service Binding,
       * we have not implemented the authentication process.
       *
       * When using Cloudflare Workers, consider security measures such as restricting access using Cloudflare Access Service Tokens.
       * @see https://developers.cloudflare.com/cloudflare-one/identity/service-tokens/
       */
      const userId = getCookie(c).userId;

      if (!userId) {
        const errorResponse = new Response("Unauthorized", {
          status: 401,
          headers: {
            Authenticate: 'error="invalid_token"',
          },
        });
        throw new HTTPException(401, { res: errorResponse });
      }
      const params = c.req.valid("json");

      const profile = await dbClient(c).profile.create({
        data: {
          accountId: userId,
          name: params.name,
          birthday: params.birthday,
          genderId: params.genderId,
          activityAreaId: params.activityAreaId,
          iconImageUrl: params.iconImageUrl,
          oneWord: params.oneWord,
        },
      });
      return c.json({ profile });
    },
  );

export default app;
