import fastify from "fastify";
import { usersRoutes } from "./routes/users";
import fastifyCookie from "@fastify/cookie";
import { dietsRoutes } from "./routes/diets";

const app = fastify();

app.register(fastifyCookie);

app.register(dietsRoutes, {
  prefix: "/diets",
});

app.register(usersRoutes, {
  prefix: "/users",
});

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("HTTP server listening");
  });
