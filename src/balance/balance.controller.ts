import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  PaymentDto,
  RewardDto,
} from '../common/repository/payment/payment.dto';
import { BalanceService } from './balance.service';

@Controller('balance')
@ApiTags('Balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @ApiOperation({
    summary: 'Get the balance of a user with the passed userId',
  })
  @ApiOkResponse({
    description:
      'Return a number, representing the current balance for the user corresponding to the passed userId',
  })
  @ApiNotFoundResponse({
    description: 'No user with this ID was found',
  })
  @ApiBadRequestResponse({
    description: 'The passed ID is not a valid UUID',
  })
  @Get(':userId')
  @ApiParam({
    name: 'userId',
    type: 'string',
    description: 'The ID of the user',
  })
  public async currentBalance(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.balanceService.userBalance(userId);
  }

  @ApiOperation({
    summary: 'Get the detailed ledger for a user with the passed userId',
  })
  @ApiOkResponse({
    description:
      'Return a number, representing the current balance for the user',
  })
  @ApiNotFoundResponse({
    description: 'No user with this ID was found, or the ledger is empty',
  })
  @ApiBadRequestResponse({
    description: 'The passed ID is not a valid UUID',
  })
  @Get(':userId/detailed')
  @ApiParam({
    name: 'userId',
    type: 'string',
    description: 'The ID of the user',
  })
  public async getDetailedBalance(
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.balanceService.userLedger(userId);
  }

  @ApiOperation({
    summary: 'Reduce the amount of points that the user has.',
    description: `This will reduce the number of available points in a user\'s ledger. The oldest records in the ledger
    are used first`,
  })
  @ApiNoContentResponse({
    description: 'Returns an OK, signifying that reduction was successful',
  })
  @ApiNotFoundResponse({
    description: 'No user with this ID was found',
  })
  @ApiBadRequestResponse({
    description:
      'The user with the corresponding id does not have enough points to complete the payment, or the UUID passed failed to validate',
  })
  @Put(':userId/pay')
  @ApiParam({
    name: 'userId',
    type: 'string',
    description: 'The ID of the user',
  })
  public async pay(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() { amount }: PaymentDto,
  ) {
    return this.balanceService.reduceBalance(userId, amount);
  }

  @ApiOperation({
    summary: 'Increase the amount of points that the user has.',
    description: `This will increase the number of available points in a user\'s ledger. The payer added will be the last payer to be used in a payment (barring any other rewards)`,
  })
  @ApiNoContentResponse({
    description: 'Returns an OK, signifying that increase was successful',
  })
  @ApiNotFoundResponse({
    description: 'No user with this ID was found',
  })
  @ApiBadRequestResponse({
    description: 'The passed ID is not a valid UUID',
  })
  @Put(':userId/reward')
  @ApiParam({
    name: 'userId',
    type: 'string',
    description: 'The ID of the user',
  })
  public async reward(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() body: RewardDto,
  ) {
    return this.balanceService.increaseBalance(userId, body);
  }
}
