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

  beforeEach(async () => {
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
        dateHour: "2023-07-10",
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
        dateHour: "2023-07-10",
      })
      .expect(201);

    const listDietsResponse = await request(app.server)
      .get("/diets")
      .set("Cookie", cookies)
      .expect(200);

    expect(listDietsResponse.body.diets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Bulking",
          description: "Comer muito",
          dateHour: "2023-07-10",
        }),
      ])
    );
  });
});
