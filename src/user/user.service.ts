import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PaymentRepository } from '../common/repository/payment/payment-repository.provider';
import { UserRepository } from '../common/repository/user/user-repository.provider';
import { UpdateUserDto, UserDto } from '../common/repository/user/user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly paymentRepository: PaymentRepository,
  ) {}

  public async addUser(user: UpdateUserDto): Promise<string> {
    const id = await this.userRepository.insert(user);
    if (user.points > 0) {
      await this.paymentRepository.insert([
        {
          userId: id,
          amount: user.points,
          payer: 'Fetch Rewards',
        },
      ]);
    }

    return id;
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
    ]);
    if (usersDel === false) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return usersDel;
  }
}
