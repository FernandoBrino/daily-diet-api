import { FastifyInstance } from "fastify";
import { z } from "zod";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";
import { knex } from "../database";
import { randomUUID } from "node:crypto";

export async function dietsRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: checkSessionIdExists,
    },
    async (request, reply) => {
      const { sessionId } = request.cookies;

      const user = await knex("users")
        .where({ session_id: sessionId })
        .first()
        .select();

      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      const userDiets = await knex("user_diet")
        .where({ user_id: user.id })
        .pluck("diet_id");

      const diets = await knex("diets").whereIn("id", userDiets).select();

      return reply.status(200).send({ diets });
    }
  );

  app.get(
    "/:id",
    {
      preHandler: checkSessionIdExists,
    },
    async (request, reply) => {
      const { sessionId } = request.cookies;

      const deleteDietParamSchema = z.object({
        id: z.string().uuid(),
      });

      const params = deleteDietParamSchema.safeParse(request.params);

      if (!params.success) {
        return reply.status(400).send(params.error.issues);
      }

      const user = await knex("users")
        .where({ session_id: sessionId })
        .first()
        .select();

      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      const userDiet = await knex("user_diet")
        .where({ user_id: user.id, diet_id: params.data.id })
        .first()
        .select("diet_id");

      if (!userDiet) {
        return reply.status(404).send({ error: "Diet not found" });
      }

      const diet = await knex("diets").where({ id: userDiet.diet_id });

      return reply.status(200).send({ diet });
    }
  );

  app.get("/total-off-diet", async (request, reply) => {
    const { sessionId } = request.cookies;

    const user = await knex("users")
      .where({ session_id: sessionId })
      .first()
      .select();

    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }

    const userDiets = await knex("user_diet")
      .where({ user_id: user.id })
      .pluck("diet_id");

    const diets = await knex("diets")
      .whereIn("id", userDiets)
      .where({ is_on_diet: false })
      .select();

    return reply.status(200).send({ totalOnDiet: diets });
  });

  app.get("/total-on-diet", async (request, reply) => {
    const { sessionId } = request.cookies;

    const user = await knex("users")
      .where({ session_id: sessionId })
      .first()
      .select();

    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }

    const userDiets = await knex("user_diet")
      .where({ user_id: user.id })
      .pluck("diet_id");

    const diets = await knex("diets")
      .whereIn("id", userDiets)
      .where({ is_on_diet: true })
      .select();

    return reply.status(200).send({ totalOnDiet: diets });
  });

  app.get("/total-registered", async (request, reply) => {
    const { sessionId } = request.cookies;

    const user = await knex("users")
      .where({ session_id: sessionId })
      .first()
      .select();

    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }

    const userDiets = await knex("user_diet")
      .where({ user_id: user.id })
      .pluck("diet_id");

    const diets = await knex("diets").whereIn("id", userDiets).select();

    return reply.status(200).send({ totalMeals: diets.length });
  });

  app.post(
    "/",
    {
      preHandler: checkSessionIdExists,
    },
    async (request, reply) => {
      const { sessionId } = request.cookies;

      const createDietBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        dateHour: z.string(),
      });

      const body = createDietBodySchema.safeParse(request.body);

      if (!body.success) {
        return reply.status(400).send(body.error.issues);
      }

      const user = await knex("users")
        .where("session_id", sessionId)
        .first()
        .select();

      if (!user) {
        return reply.status(404).send({ error: "User not found!" });
      }

      const newDiet = {
        id: randomUUID(),
        name: body.data.name,
        description: body.data.description,
        date_hour: body.data.dateHour,
        is_on_diet: false,
      };

      await knex("diets").insert(newDiet);

      const diet = await knex("diets").where("id", newDiet.id).first().select();

      if (!diet) {
        return reply.status(404).send({ error: "Diet not found!" });
      }

      const newUserDiet = {
        id: randomUUID(),
        user_id: user.id,
        diet_id: diet.id,
      };

      await knex("user_diet").insert(newUserDiet);

      return reply.status(201).send();
    }
  );

  app.put(
    "/:id",
    {
      preHandler: checkSessionIdExists,
    },
    async (request, reply) => {
      const { sessionId } = request.cookies;

      const editDietParamSchema = z.object({
        id: z.string().uuid(),
      });

      const editDietBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        date_hour: z.string().optional(),
        is_on_diet: z.boolean().optional(),
      });

      const body = editDietBodySchema.safeParse(request.body);
      const params = editDietParamSchema.safeParse(request.params);

      if (!body.success) {
        return reply.status(400).send(body.error.issues);
      }

      if (!params.success) {
        return reply.status(400).send(params.error.issues);
      }

      const user = await knex("users")
        .where("session_id", sessionId)
        .first()
        .select();

      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      const userDiet = await knex({ ud: "user_diet" })
        .where({ user_id: user.id, diet_id: params.data.id })
        .first()
        .select();

      if (!userDiet) {
        return reply.status(400).send({ error: "Diet not found" });
      }

      const updatedDiet = await knex("diets")
        .where({ id: userDiet.diet_id })
        .update({ ...body.data })
        .returning("*");

      return reply.status(200).send({ diet: updatedDiet[0] });
    }
  );

  app.delete(
    "/:id",
    {
      preHandler: checkSessionIdExists,
    },
    async (request, reply) => {
      const { sessionId } = request.cookies;

      const deleteDietParamSchema = z.object({
        id: z.string().uuid(),
      });

      const params = deleteDietParamSchema.safeParse(request.params);

      if (!params.success) {
        return reply.status(400).send(params.error.issues);
      }

      const user = await knex("users")
        .where({ session_id: sessionId })
        .first()
        .select();

      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      const dietToDelete = await knex("user_diet")
        .where({ user_id: user.id, diet_id: params.data.id })
        .first()
        .select("diet_id");

      if (!dietToDelete) {
        return reply.status(404).send({ error: "Diet not found" });
      }

      await knex("diets").delete(dietToDelete.diet_id);

      return reply.status(204).send();
    }
  );
}
