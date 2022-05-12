import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase
let createUserUseCase: CreateUserUseCase

describe("Show user profile", () => {

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
  })

  it("should be able to show a user profile", async () => {
    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@test.com",
      password: "1234"
    })

    const profile = await showUserProfileUseCase.execute(user.id as string)

    expect(profile).toHaveProperty("id")

  })

  it("should not be able to show a profile from a non-existing user", async () => {
    const id = "errorTest"
   await expect(showUserProfileUseCase.execute(id as string) ).rejects.toBeInstanceOf(ShowUserProfileError);
  })
})
