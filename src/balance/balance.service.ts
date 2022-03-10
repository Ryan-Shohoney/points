import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {LedgerRepository} from '../common/repository/ledger/ledger-repository.provider';
import { PaymentRepository } from '../common/repository/payment/payment-repository.provider';
import { RewardDto } from '../common/repository/payment/payment.dto';
import { UserRepository } from '../common/repository/user/user-repository.provider';

@Injectable()
export class BalanceService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly userRepository: UserRepository,
    private readonly ledgerRepository: LedgerRepository,
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
    const { paymentId } = await this.ledgerRepository.findById(userId);
    const payment = await this.paymentRepository.findById(paymentId);
    if (payment.length === 0) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return payment;
  }

  async reduceBalance(id: string, amount: number) {
    const { userId, paymentId } = await this.ledgerRepository.findById(id);
    if (!userId) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    const user = await this.userRepository.findById(userId);
    if (user.points < amount) {
      throw new HttpException(
        `${userId} lacks sufficient points`,
        HttpStatus.BAD_REQUEST,
      );
    }
    let currentAmountDeducted = 0;
    while (currentAmountDeducted < amount) {
      const remainingPayment = amount - currentAmountDeducted;
      const currentPayer = await this.paymentRepository.getCurrentPayer(paymentId);
      const deduction =
        currentPayer.amount <= remainingPayment
          ? currentPayer.amount
          : remainingPayment;
      currentAmountDeducted += deduction;
      const updatedPayer = {
        ...currentPayer,
        amount: currentPayer.amount - deduction,
      };
      await this.paymentRepository.updateCurrentPayer(paymentId, updatedPayer);
    }
    await this.userRepository.update(userId, {
      ...user,
      points: user.points - currentAmountDeducted,
    });
  }

  async increaseBalance(id: string, payment: RewardDto) {
    const { userId, paymentId } = await this.ledgerRepository.findById(id);
    const user = await this.userRepository.findById(userId);
    await Promise.all([
      this.paymentRepository.update(paymentId, payment),
      this.userRepository.update(userId, {
        ...user,
        points: user.points + payment.amount,
      }),
    ]);
  }
}
