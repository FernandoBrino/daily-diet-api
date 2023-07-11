import { execSync } from "node:child_process";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app";
import request from "supertest";

describe("Diets routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback -all");
    execSync("npm run knex migrate:latest");
  });

  it("should create a new diet", async () => {
    const createNewUserResponse = await request(app.server)
      .post("/users")
      .send({
        name: "John Doe",
      })
      .expect(201);

    const cookies = createNewUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/diets")
      .set("Cookie", cookies)
      .send({
        name: "Bulking",
        description: "Comer muito",
        date_hour: "2023-07-10",
      })
      .expect(201);
  });

  it("should list all user diets", async () => {
    const createNewUserResponse = await request(app.server)
      .post("/users")
      .send({
        name: "John Doe",
      })
      .expect(201);

    const cookies = createNewUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/diets")
      .set("Cookie", cookies)
      .send({
        name: "Bulking",
        description: "Comer muito",
        date_hour: "2023-07-10",
      })
      .expect(201);

    const listDietsResponse = await request(app.server)
      .get("/diets")
      .set("Cookie", cookies)
      .expect(200);

    expect(listDietsResponse.body.diets).toEqual([
      expect.objectContaining({
        name: "Bulking",
        description: "Comer muito",
        date_hour: "2023-07-10",
      }),
    ]);
  });

  it("should get a single user diet", async () => {
    const createNewUserResponse = await request(app.server)
      .post("/users")
      .send({
        name: "John Doe",
      })
      .expect(201);

    const cookies = createNewUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/diets")
      .set("Cookie", cookies)
      .send({
        name: "Bulking",
        description: "Comer muito",
        date_hour: "2023-07-10",
      })
      .expect(201);

    const listDietsResponse = await request(app.server)
      .get("/diets")
      .set("Cookie", cookies)
      .expect(200);

    const getDietResponse = await request(app.server)
      .get(`/diets/${listDietsResponse.body.diets[0].id}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(getDietResponse.body.diet).toEqual([
      expect.objectContaining({
        name: "Bulking",
        description: "Comer muito",
        date_hour: "2023-07-10",
      }),
    ]);
  });

  it("should get a total of diets registered", async () => {
    const createNewUserResponse = await request(app.server)
      .post("/users")
      .send({
        name: "John Doe",
      })
      .expect(201);

    const cookies = createNewUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/diets")
      .set("Cookie", cookies)
      .send({
        name: "Bulking",
        description: "Comer muito",
        date_hour: "2023-07-10",
      })
      .expect(201);

    await request(app.server)
      .get("/diets/total-registered")
      .set("Cookie", cookies)
      .expect(200, {
        totalMeals: 1,
      });
  });

  it("should get a total of meals on diet", async () => {
    const createNewUserResponse = await request(app.server)
      .post("/users")
      .send({
        name: "John Doe",
      })
      .expect(201);

    const cookies = createNewUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/diets")
      .set("Cookie", cookies)
      .send({
        name: "Bulking",
        description: "Comer muito",
        date_hour: "2023-07-10",
      })
      .expect(201);

    const listDietsResponse = await request(app.server)
      .get("/diets")
      .set("Cookie", cookies)
      .expect(200);

    await request(app.server)
      .put(`/diets/${listDietsResponse.body.diets[0].id}`)
      .set("Cookie", cookies)
      .send({
        name: "Cutting",
        description: "Comer menos",
        date_hour: "2023-07-10",
        is_on_diet: true,
      })
      .expect(200);

    const totalOnDietResponse = await request(app.server)
      .get("/diets/total-on-diet")
      .set("Cookie", cookies)
      .expect(200);

    expect(totalOnDietResponse.body.totalOnDiet).toEqual([
      expect.objectContaining({
        name: "Cutting",
        description: "Comer menos",
        date_hour: "2023-07-10",
        is_on_diet: 1,
      }),
    ]);
  });

  it("should get a total of meals off diet", async () => {
    const createNewUserResponse = await request(app.server)
      .post("/users")
      .send({
        name: "John Doe",
      })
      .expect(201);

    const cookies = createNewUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/diets")
      .set("Cookie", cookies)
      .send({
        name: "Bulking",
        description: "Comer muito",
        date_hour: "2023-07-10",
      })
      .expect(201);

    const listDietsResponse = await request(app.server)
      .get("/diets")
      .set("Cookie", cookies)
      .expect(200);

    await request(app.server)
      .put(`/diets/${listDietsResponse.body.diets[0].id}`)
      .set("Cookie", cookies)
      .send({
        name: "Cutting",
        description: "Comer menos",
        date_hour: "2023-07-10",
        is_on_diet: false,
      })
      .expect(200);

    const totalOnDietResponse = await request(app.server)
      .get("/diets/total-off-diet")
      .set("Cookie", cookies)
      .expect(200);

    expect(totalOnDietResponse.body.totalOnDiet).toEqual([
      expect.objectContaining({
        name: "Cutting",
        description: "Comer menos",
        date_hour: "2023-07-10",
        is_on_diet: 0,
      }),
    ]);
  });

  it("should update a user diet", async () => {
    const createNewUserResponse = await request(app.server)
      .post("/users")
      .send({
        name: "John Doe",
      })
      .expect(201);

    const cookies = createNewUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/diets")
      .set("Cookie", cookies)
      .send({
        name: "Bulking",
        description: "Comer muito",
        date_hour: "2023-07-10",
      })
      .expect(201);

    const listDietsResponse = await request(app.server)
      .get("/diets")
      .set("Cookie", cookies)
      .expect(200);

    const updatedDietResponse = await request(app.server)
      .put(`/diets/${listDietsResponse.body.diets[0].id}`)
      .set("Cookie", cookies)
      .send({
        name: "Cutting",
        description: "Comer menos",
        date_hour: "2023-07-10",
        is_on_diet: true,
      })
      .expect(200);

    expect(updatedDietResponse.body.diet).toEqual(
      expect.objectContaining({
        name: "Cutting",
        description: "Comer menos",
        date_hour: "2023-07-10",
        is_on_diet: 1,
      })
    );
  });

  it("should delete a diet", async () => {
    const createNewUserResponse = await request(app.server)
      .post("/users")
      .send({
        name: "John Doe",
      })
      .expect(201);

    const cookies = createNewUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/diets")
      .set("Cookie", cookies)
      .send({
        name: "Bulking",
        description: "Comer muito",
        date_hour: "2023-07-10",
      })
      .expect(201);

    const listDietsResponse = await request(app.server)
      .get("/diets")
      .set("Cookie", cookies)
      .expect(200);

    await request(app.server)
      .delete(`/diets/${listDietsResponse.body.diets[0].id}`)
      .set("Cookie", cookies)
      .expect(204);
  });
});
