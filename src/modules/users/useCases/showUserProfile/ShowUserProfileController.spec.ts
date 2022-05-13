import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database"

describe("Authenticate user", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate an user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "test",
      email: "test@test.com",
      password: "12345",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "12345",
    });

    const { user, token } = response.body;

    const profile = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

      const { id, email } = profile.body;

    expect(id).toBe(user.id);
    expect(email).toBe(email);
  });

  it("should not be able to show user profile without token", async () => {
    const token = "errorTest"

    const response = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("JWT invalid token!");
  });

  it("should not be able to show user profile without token", async () => {
    const response = await request(app).get("/api/v1/profile");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("JWT token is missing!");
  });
});



