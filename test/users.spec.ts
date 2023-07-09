import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app";
import { execSync } from "node:child_process";
import request from "supertest";

describe("Users routes", () => {
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

  it("should list all users", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      name: "John Doe",
    });

    const cookies = createUserResponse.get("Set-Cookie");

    const listUsersReponse = await request(app.server)
      .get("/users")
      .set("Cookie", cookies)
      .expect(200);

    expect(listUsersReponse.body[0]).toEqual(
      expect.objectContaining({
        name: "John Doe",
      })
    );
  });
});
