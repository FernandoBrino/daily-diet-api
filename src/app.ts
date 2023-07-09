import fastify from "fastify";
import { usersRoutes } from "./routes/users";
import fastifyCookie from "@fastify/cookie";
import { dietsRoutes } from "./routes/diets";

export const app = fastify();

app.register(fastifyCookie);

app.register(dietsRoutes, {
  prefix: "/diets",
});

app.register(usersRoutes, {
  prefix: "/users",
});
