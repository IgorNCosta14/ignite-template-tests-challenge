import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let statementsRepository: InMemoryStatementsRepository;
let userRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get balance", () => {

  beforeAll(() => {
    statementsRepository = new InMemoryStatementsRepository();
    userRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(userRepository);
    getBalanceUseCase = new GetBalanceUseCase(statementsRepository, userRepository);
  })

  it("should be able to get a user balance", async () => {
    const user = await createUserUseCase.execute({name: "test", email: "test@test.com", password: "1234"});

    const user_id = user.id as string;

    const response = await getBalanceUseCase.execute({user_id});

    expect(response.balance).toEqual(0);
    expect(response.statement.length).toEqual(0);
  })

  it("should no be able to get the balance of a invalid user", async () => {
    await expect(getBalanceUseCase.execute({user_id: "errorTest" as string})).rejects.toBeInstanceOf(GetBalanceError);
  })

})
