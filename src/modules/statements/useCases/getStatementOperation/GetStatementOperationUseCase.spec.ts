import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let statementsRepository: InMemoryStatementsRepository;
let userRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer'
}

describe("Get statement operation", () => {

  beforeEach(() => {
    statementsRepository = new InMemoryStatementsRepository();
    userRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(userRepository);
    createStatementUseCase = new CreateStatementUseCase(userRepository, statementsRepository);
    getStatementOperationUseCase = new GetStatementOperationUseCase(userRepository, statementsRepository);
  })

  it("should be able to get a statement operation", async () => {
    const user = await createUserUseCase.execute({name: "test", email: "test@test.com", password: "1234"});

    const statement = {
      user_id: user.id as string,
      type:  OperationType.DEPOSIT,
      amount:  100,
      description: "test"
    }

    const statementResponse = await createStatementUseCase.execute(statement)

    const statementOperation = await getStatementOperationUseCase.execute({user_id: user.id as string, statement_id: statementResponse.id as string})

    expect(statementOperation).toHaveProperty("id");
    expect(statementOperation.user_id).toEqual(user.id);
    expect(statementOperation.id).toEqual(statementResponse.id);
    expect(statementOperation.amount).toEqual(statementResponse.amount);
  })

  it("should not be able to get a statement operation with an invalid user", async () => {
    const user = await createUserUseCase.execute({name: "test", email: "test@test.com", password: "1234"});

    const statement = {
      user_id: user.id as string,
      type:  OperationType.DEPOSIT,
      amount:  100,
      description: "test"
    }

    const statementResponse = await createStatementUseCase.execute(statement)

    await expect(getStatementOperationUseCase.execute({user_id: "errorTest" as string, statement_id: statementResponse.id as string})).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })

  it("should not be able to get a nonexistent statement operation", async () => {
    const user = await createUserUseCase.execute({name: "test", email: "test@test.com", password: "1234"});

    await expect(getStatementOperationUseCase.execute({user_id: user.id as string, statement_id: "errorTest" as string})).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })
})
