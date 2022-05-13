import { decode } from "jsonwebtoken";
import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database"
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

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

    const response = await request(app).post("/api/v1/sessions").send({email: "test@test.com", password: "12345"});

    expect(response.body).toHaveProperty("user");
    expect(response.body).toHaveProperty("token");
  });

  it("should not be able to authenticate an user if email is wrong", async () => {
    await request(app).post("/api/v1/users").send({
      name: "test",
      email: "test@test.com",
      password: "12345",
    });

    const response = await request(app).post("/api/v1/sessions").send({email: "testError@test.com", password: "12345"});

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Incorrect email or password");
  })

  it("should not be able to authenticate an user if password is wrong", async () => {
    await request(app).post("/api/v1/users").send({
      name: "test",
      email: "test@test.com",
      password: "12345",
    });

    const response = await request(app).post("/api/v1/sessions").send({email: "test@test.com", password: "error"});

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Incorrect email or password");
  })
});



