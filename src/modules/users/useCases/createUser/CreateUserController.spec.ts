import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database"

describe("Create user controller", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "test",
      email: "test@test.com",
      password: "12345",
    });

    expect(response.status).toBe(201);
  });

  it("should not be able to create new user with email already in use", async () => {
    await request(app).post("/api/v1/users").send({
      name: "test",
      email: "test@test.com",
      password: "12345",
    });

    const response = await request(app).post("/api/v1/users").send({
      name: "test",
      email: "test@test.com",
      password: "12345",
    });

    expect(response.status).toBe(400);
  });
});
