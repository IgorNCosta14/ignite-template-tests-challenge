import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase"

let userRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let statementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer'
}

describe("Create statement", () => {

  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(userRepository, statementsRepository);
    createUserUseCase = new CreateUserUseCase(userRepository)
  })

  it("should be able to create a deposit statement", async () => {
    const user = await createUserUseCase.execute({name: "test", email: "test@test.com", password: "1234"})

    const statement = {
      user_id: user.id as string,
      type:  OperationType.DEPOSIT,
      amount:  100,
      description: "test"
    }

    const response = await createStatementUseCase.execute(statement)

    expect(response).toHaveProperty("id");
    expect(response.amount).toEqual(statement.amount);
    expect(response.type).toEqual(statement.type);
  })

  it("should be able to create a withdraw statement", async () => {
    const user = await createUserUseCase.execute({name: "test", email: "test@test.com", password: "1234"})

    const statementDeposit = {
      user_id: user.id as string,
      type:  OperationType.DEPOSIT,
      amount:  100,
      description: "test"
    }

    await createStatementUseCase.execute(statementDeposit)

    const statementWithdraw = {
      user_id: user.id as string,
      type:  OperationType.DEPOSIT,
      amount:  50,
      description: "test"
    }

    const response = await createStatementUseCase.execute(statementWithdraw)

    expect(response).toHaveProperty("id");
    expect(response.amount).toEqual(statementWithdraw.amount);
    expect(response.type).toEqual(statementWithdraw.type);
  })

  it("should not be able to create a withdrawal statement with an amount greater than the balance", async () => {

    const user = await createUserUseCase.execute({name: "test", email: "test@test.com", password: "1234"})

    const statementWithdraw = {
      user_id: user.id as string,
      type:  OperationType.WITHDRAW,
      amount:  100,
      description: "test error"
    }

    await expect(createStatementUseCase.execute(statementWithdraw)).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })

  it("should not be able to create a statement with an invalid user", async () => {

    const user = await createUserUseCase.execute({name: "test", email: "test@test.com", password: "1234"})
    const userError = {
      id: "12345"
    }

    const statementWithdraw = {
      user_id: userError.id as string,
      type:  OperationType.WITHDRAW,
      amount:  100,
      description: "test error"
    }

    await expect(createStatementUseCase.execute(statementWithdraw)).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })
})
