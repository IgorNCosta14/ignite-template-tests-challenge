import auth from "../../../../config/auth";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase
let createUserUseCase: CreateUserUseCase

describe("authenticate user", () => {

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository)
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
  })

  it("should be able to authenticate a user", async () => {

    const user = {
      name: "test",
      email: "test@test.com",
      password: "1234"
    }

    await createUserUseCase.execute(user)

    auth.jwt.secret = user.password;

    const userToken = await authenticateUserUseCase.execute({ email: user.email, password: user.password })

    expect(userToken).toHaveProperty("token");
  })

  it("should not be able to authenticate a user with wrong password", async () => {

      const user = {
        name: "test",
        email: "test@test.com",
        password: "1234"
      }


        await createUserUseCase.execute(user)



        const login = {
          name: "test",
          email: "test@test.com",
          password: "123"
        }

        auth.jwt.secret = login.password;

      await expect( authenticateUserUseCase.execute({ email: login.email, password: login.password })).rejects.toEqual(new IncorrectEmailOrPasswordError());
  })

  it("should not be able to authenticate a user with wrong email", async () => {

    const user = {
      name: "test",
      email: "test@test.com",
      password: "1234"
    }


      await createUserUseCase.execute(user)



      const login = {
        name: "test",
        email: "test2@test.com",
        password: "1234"
      }

      auth.jwt.secret = login.password;

    await expect( authenticateUserUseCase.execute({ email: login.email, password: login.password })).rejects.toEqual(new IncorrectEmailOrPasswordError());
})
})
