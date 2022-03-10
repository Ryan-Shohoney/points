import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mock, mockClear } from 'jest-mock-extended';
import { PaymentRepository } from '../common/repository/payment/payment-repository.provider';
import { UserRepository } from '../common/repository/user/user-repository.provider';
import { BalanceService } from './balance.service';

describe('BalanceService', () => {
  let service: BalanceService;
  const mockUser = {
    firstName: 'Test',
    lastName: 'User',
    points: 1000,
    id: '12345',
  };
  const mockPayer = {
    userId: 'testId',
    amount: 500,
    payer: 'testPayer',
  };
  const mockPaymentRepository = mock<PaymentRepository>({
    insert: jest.fn(),
    getCurrentPayer: jest.fn().mockResolvedValue(mockPayer),
    updateCurrentPayer: jest.fn(),
  });
  const mockUserRepository = mock<UserRepository>({
    findById: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn(),
  });
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalanceService,
        {
          provide: PaymentRepository,
          useValue: mockPaymentRepository,
        },
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<BalanceService>(BalanceService);
  });
  afterEach(() => {
    mockClear(mockPaymentRepository);
    mockClear(mockUserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('userBalance()', () => {
    it('returns the points', async () => {
      const points = await service.userBalance('mocked');
      expect(points).toEqual(1000);
    });

    it('throws an error if the user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValueOnce(null);
      await expect(service.userBalance('mocked')).rejects.toEqual(
        expect.objectContaining({
          message: 'Not Found',
          status: HttpStatus.NOT_FOUND,
        }),
      );
    });
  });

  describe('increaseBalance()', () => {
    it('updates the users points and adds a new payment', async () => {
      const mockPayment = {
        userId: 'mocked',
        payer: 'TestPayer',
        amount: 1000,
      };
      await service.increaseBalance('mocked', mockPayment);

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        mockPayment.userId,
        { ...mockUser, points: 2000 },
      );
    });
  });

  describe('reduceBalance()', () => {
    it('throws an error when the user is not found', async () => {
      mockUserRepository.findById.mockResolvedValueOnce(null);
      await expect(service.reduceBalance('notFound', 500)).rejects.toEqual(
        expect.objectContaining({
          message: 'Not Found',
          status: HttpStatus.NOT_FOUND,
        }),
      );
    });

    it('reduces the user balance, using a payer with just enough points', async () => {
      await service.reduceBalance('mocked', 500);
      expect(mockPaymentRepository.getCurrentPayer).toHaveBeenCalledWith(
        'mocked',
      );
      expect(mockPaymentRepository.getCurrentPayer).toHaveBeenCalledTimes(1);
      expect(mockPaymentRepository.updateCurrentPayer).toHaveBeenCalledWith(
        'mocked',
        { ...mockPayer, amount: 0 },
      );
      expect(mockUserRepository.update).toHaveBeenCalledWith('mocked', {
        ...mockUser,
        points: 500,
      });
    });

    it('reduces the user balance using a payer with more than enough points', async () => {
      await service.reduceBalance('mocked', 250);
      expect(mockPaymentRepository.getCurrentPayer).toHaveBeenCalledWith(
        'mocked',
      );
      expect(mockPaymentRepository.getCurrentPayer).toHaveBeenCalledTimes(1);
      expect(mockPaymentRepository.updateCurrentPayer).toHaveBeenCalledWith(
        'mocked',
        { ...mockPayer, amount: 250 },
      );
      expect(mockUserRepository.update).toHaveBeenCalledWith('mocked', {
        ...mockUser,
        points: 750,
      });
    });
  });
});
