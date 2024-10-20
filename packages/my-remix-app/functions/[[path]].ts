import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";

import * as build from "../build/server";
import { getLoadContext } from "../load-context";

// @ts-ignore
export const onRequest = createPagesFunctionHandler({ build, getLoadContext });
