import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

export async function usersRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: checkSessionIdExists,
    },
    async (request, reply) => {
      const { sessionId } = request.cookies;
      const users = await knex("users").where("session_id", sessionId).select();

      return reply.status(200).send(users);
    }
  );

  app.post("/", async (request, reply) => {
    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 1, // 1 dia
      });
    }

    const createUserBodySchema = z.object({
      name: z.string(),
    });

    const body = createUserBodySchema.safeParse(request.body);

    if (!body.success) {
      return reply.status(400).send({ error: body.error.issues });
    }

    const { name } = body.data;

    const newUser = {
      id: randomUUID(),
      name,
      session_id: sessionId,
    };

    await knex("users").insert(newUser);

    return reply.status(201).send();
  });
}
