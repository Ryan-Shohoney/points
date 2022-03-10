import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {LedgerRepository} from '../common/repository/ledger/ledger-repository.provider';
import { PaymentRepository } from '../common/repository/payment/payment-repository.provider';
import { UserRepository } from '../common/repository/user/user-repository.provider';
import { UpdateUserDto, UserDto } from '../common/repository/user/user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly ledgerRepository: LedgerRepository,
  ) {}

  public async addUser(user: UpdateUserDto): Promise<string> {
    const userId = await this.userRepository.insert(user);
    const paymentId = await this.paymentRepository.insert(
      {
        amount: user.points,
        payer: 'promotionalPoints',
        timestampMS: 1, // Set to basically the beginning of the unix epoch.  Spend promo points right away.  Alternatively, set to the max of the epoch to keep the "cost" off of the books
      },
    );
    await this.ledgerRepository.insert({ userId, paymentId });
    return userId;
  }

  public async getUserById(id: string): Promise<UserDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  public async listUsers(): Promise<Array<UserDto>> {
    return this.userRepository.list();
  }

  public async updateUser(id: string, user: UpdateUserDto): Promise<boolean> {
    return this.userRepository.update(id, user);
  }

  public async delete(id: string): Promise<boolean> {
    const [usersDel] = await Promise.all([
      this.userRepository.delete(id),
      this.paymentRepository.delete(id),
      this.ledgerRepository.delete(id),
    ]);
    if (usersDel === false) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return usersDel;
  }
}
