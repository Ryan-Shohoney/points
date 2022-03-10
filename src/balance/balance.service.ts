import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PaymentRepository } from '../common/repository/payment/payment-repository.provider';
import { RewardDto } from '../common/repository/payment/payment.dto';
import { UserRepository } from '../common/repository/user/user-repository.provider';
import { v4 as uuid } from 'uuid';

@Injectable()
export class BalanceService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async userBalance(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    const { points } = user;

    return points;
  }

  async userLedger(userId: string) {
    const ledger = await this.paymentRepository.findById(userId);
    if (ledger.length === 0) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return ledger;
  }

  async reduceBalance(userId: uuid, amount: number) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    if (user.points < amount) {
      throw new HttpException(
        `${userId} lacks sufficient points`,
        HttpStatus.BAD_REQUEST,
      );
    }
    let currentAmountDeducted = 0;
    while (currentAmountDeducted < amount) {
      const remainingPayment = amount - currentAmountDeducted;
      const currentPayer = await this.paymentRepository.getCurrentPayer(userId);
      const deduction =
        currentPayer.amount <= remainingPayment
          ? currentPayer.amount
          : remainingPayment;
      currentAmountDeducted += deduction;
      const updatedPayer = {
        ...currentPayer,
        amount: currentPayer.amount - deduction,
      };
      await this.paymentRepository.updateCurrentPayer(userId, updatedPayer);
    }
    await this.userRepository.update(userId, {
      ...user,
      points: user.points - currentAmountDeducted,
    });
  }

  async increaseBalance(userId: uuid, payment: RewardDto) {
    const user = await this.userRepository.findById(userId);
    await Promise.all([
      this.paymentRepository.insert([{ userId, ...payment }]),
      this.userRepository.update(userId, {
        ...user,
        points: user.points + payment.amount,
      }),
    ]);
  }
}
