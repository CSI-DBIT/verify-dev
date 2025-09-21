import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { membersController } from "./controllers/member.controller";
import { organizationController } from "./controllers/organization.controller";
import { authController } from "./controllers/auth.controller";

const app = new Elysia()
  .use(staticPlugin())
  .use(swagger())
  .use(cors())
  .get("/", () => "Hello World")
  .group("/api", (app) =>
    app.use(authController).use(organizationController).use(membersController)
  )
  .listen(Bun.env.PORT || 4000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}/swagger`
);
