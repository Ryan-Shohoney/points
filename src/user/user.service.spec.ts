import { Test, TestingModule } from '@nestjs/testing';
import { mock, mockClear } from 'jest-mock-extended';
import {LedgerRepository} from '../common/repository/ledger/ledger-repository.provider';
import { PaymentRepository } from '../common/repository/payment/payment-repository.provider';
import { UserRepository } from '../common/repository/user/user-repository.provider';
import { UserDto } from '../common/repository/user/user.dto';
import { UserService } from './user.service';
import { v4 as uuid } from 'uuid';
describe('UserService', () => {
  let service: UserService;
  const mockUser: UserDto = {
    firstName: 'Test',
    lastName: 'User',
    id: uuid,
    points: 0,
  };
  const mockUserRepository = mock<UserRepository>({
    insert: jest.fn().mockResolvedValue('mockId'),
    findById: jest.fn().mockResolvedValue({ id: 'mock' }),
    update: jest.fn(),
  });
  const mockPaymentRepository = mock<PaymentRepository>();
  const mockLedgerRepository = mock<LedgerRepository>();
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: PaymentRepository,
          useValue: mockPaymentRepository,
        },
        {
          provide: LedgerRepository,
          useValue: mockLedgerRepository,
        }
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });
  afterEach(() => {
    mockClear(mockUserRepository);
    mockClear(mockPaymentRepository);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addUser()', () => {
    it('adds a user without any points', async () => {
      await service.addUser(mockUser);

      expect(mockUserRepository.insert).toHaveBeenCalledWith(mockUser);
    });
    it('Adds a user with the default payer', async () => {
      await service.addUser({ ...mockUser, points: 1000 });
      expect(mockUserRepository.insert).toHaveBeenCalledWith(
        expect.objectContaining({ ...mockUser, points: 1000 }),
      );
      expect(mockPaymentRepository.insert).toHaveBeenCalledWith(
        expect.objectContaining(
          {
            amount: 1000,
            payer: 'promotionalPoints',
            timestampMS: 1,
          },
        ),
      );
    });
  });

  describe('getUserById()', () => {
    it('gets the user with the passed id', async () => {
      await service.getUserById('mockId');
      expect(mockUserRepository.findById).toHaveBeenCalledWith('mockId');
    });
  });

  describe('listUsers()', () => {
    it('lists the users', async () => {
      await service.listUsers();
      expect(mockUserRepository.list).toHaveBeenCalled();
    });
  });

  describe('updateUser()', () => {
    it('updates the user with the passed id', async () => {
      await service.updateUser('mockId', { firstName: 'test' });
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        'mockId',
        expect.objectContaining({ firstName: 'test' }),
      );
    });
  });
});
