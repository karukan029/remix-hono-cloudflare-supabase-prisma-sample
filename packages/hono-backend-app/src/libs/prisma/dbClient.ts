import { PrismaPg } from "@prisma/adapter-pg-worker";
import { PrismaClient } from "@prisma/client";
import { Pool } from "@prisma/pg-worker";
import type { Context } from "hono";
import { env } from "hono/adapter";
import type { BlankEnv, BlankInput } from "hono/types";
import type { Env } from "../../env";

export const dbClient = (context: Context<BlankEnv, "/", BlankInput>) => {
  const databaseUrl = env<Env>(context).DATABASE_URL;

  /**
   * Supabaseではpgbouncerを廃止する予定だが、Prismaでの接続時はパラメータを指定する必要がある
   * @link https://supabase.com/partners/integrations/prisma
   */
  const pool = new Pool({
    connectionString: `${databaseUrl}?pgbouncer=true&connection_limit=1`,
  });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
};
