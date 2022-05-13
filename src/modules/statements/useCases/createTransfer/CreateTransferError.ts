import { AppError } from "../../../../shared/errors/AppError";

export class SenderUserError extends AppError {
  constructor() {
    super('Sender user not found', 404);
  }
}

export class  ReceiverUserError extends AppError {
  constructor() {
    super('Receiver user not found', 404);
  }
}

export class  InsufficientFundsError extends AppError {
  constructor() {
    super('Insufficient funds', 404);
  }
}
