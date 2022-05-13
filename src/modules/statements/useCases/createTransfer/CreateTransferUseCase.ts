import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { InsufficientFundsError, ReceiverUserError, SenderUserError } from "./CreateTransferError";
import { ICreateTransferDTO } from "./ICreateTransferDTO";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer'
}

@injectable()
export class CreateTransferUseCase {

  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    sender_id,
    receiver_id,
    amount,
    description
  }: ICreateTransferDTO) {
    const sender = await this.usersRepository.findById(sender_id);

    if(!sender) {
      throw new SenderUserError();
    }

    const receiver = await this.usersRepository.findById(receiver_id);

    if(!receiver) {
      throw new ReceiverUserError();
    }

    const senderBalance = await this.statementsRepository.getUserBalance({user_id: sender_id, with_statement: false});

    if(amount > senderBalance.balance) {
      throw new InsufficientFundsError();
    }

    await this.statementsRepository.create({
      user_id: sender.id as string,
      sender_id: sender.id as string,
      amount,
      description,
      type: OperationType.WITHDRAW
    })

    const transfer = await this.statementsRepository.create({
      user_id: receiver.id as string,
      sender_id: sender.id,
      amount,
      description,
      type: OperationType.TRANSFER
    })

    return transfer;
  }

}
