import { Connection } from "typeorm"
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "./CreateUserUseCase"


let inMemoryUsersRepository : InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

beforeEach(() => {
  inMemoryUsersRepository = new InMemoryUsersRepository();
  createUserUseCase= new CreateUserUseCase(inMemoryUsersRepository);
})


describe("Create user", () => {
  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@test.com",
      password: "1234"
    })
    expect(user).toHaveProperty("id")
  })

  it("should be able to create a new user with a email already registered", async () => {
    await createUserUseCase.execute({
      name: "test",
      email: "test@test.com",
      password: "1234"
    })

    await expect (
      createUserUseCase.execute({
        name: "test2",
        email: "test@test.com",
        password: "1234"
      })
    ).rejects.toEqual(new AppError("User already exists"))
  })
})
