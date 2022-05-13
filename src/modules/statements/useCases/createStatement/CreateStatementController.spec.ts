import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database"

describe("Create statement", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a deposit statement", async () => {
    await request(app).post("/api/v1/users").send({
      name: "test",
      email: "test@test.com",
      password: "12345",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "12345",
    });

    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer ${response.body.token}`,
      })
      .send({ amount: 100, description: "test" });

    expect(deposit.status).toBe(201);
    expect(deposit.body.type).toBe("deposit");
    expect(deposit.body).toHaveProperty("id");
  });

  it("should be able to create a withdraw statement", async () => {
    await request(app).post("/api/v1/users").send({
      name: "test",
      email: "test@test.com",
      password: "12345",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "12345",
    });

    await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer ${response.body.token}`,
      })
      .send({ amount: 100, description: "test" });

    const withdraw = await request(app)
      .post("/api/v1/statements/withdraw")
      .set({
        Authorization: `Bearer ${response.body.token}`,
      })
      .send({ amount: 100, description: "test" });

    expect(withdraw.status).toBe(201);
    expect(withdraw.body.type).toBe("withdraw");
    expect(withdraw.body).toHaveProperty("id");
  });

  it("should not be able to create a statement with invalid token", async () => {
    const token = "errorTest"

    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({ amount: 100, description: "test" });

    expect(deposit.status).toBe(401);
    expect(deposit.body.message).toBe("JWT invalid token!");
  });

  it("should not be able to create a statement without token", async () => {
    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 100, description: "test" });

    expect(deposit.status).toBe(401);
    expect(deposit.body.message).toBe("JWT token is missing!");
  });
});

