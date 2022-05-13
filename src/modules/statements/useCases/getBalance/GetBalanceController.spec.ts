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

  it("should be able to get an user balance", async () => {
    await request(app).post("/api/v1/users").send({
      name: "test",
      email: "test@test.com",
      password: "1234",
    });

    const userToken = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "1234",
    });

    await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer ${userToken.body.token}`,
      })
      .send({ amount: 55, description: "test" });

    await request(app)
      .post("/api/v1/statements/withdraw")
      .set({
        Authorization: `Bearer ${userToken.body.token}`,
      })
      .send({ amount: 7, description: "withdraw test" });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${userToken.body.token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.balance).toBe(48);
  });

  it("should not be able to get an user balance with invalid token", async () => {
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

  it("should not be able to get an user balance without token", async () => {
    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 100, description: "test" });

    expect(deposit.status).toBe(401);
    expect(deposit.body.message).toBe("JWT token is missing!");
  });
});
