import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from '../common/repository/user/user.dto';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: 'List all users',
  })
  @ApiOkResponse({
    description:
      'Return an array of length 0..n, where n is the number of users',
  })
  @Get()
  public async listUsers() {
    return this.userService.listUsers();
  }

  @ApiOperation({
    summary: 'Get user by Id',
  })
  @ApiOkResponse({
    description: 'User was successfully found',
  })
  @ApiNotFoundResponse({
    description: 'No user with this ID was found',
  })
  @ApiBadRequestResponse({
    description: 'The passed ID is not a valid UUID',
  })
  @Get(':id')
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The ID of the user to get',
  })
  public async getUserById(@Param('id') id) {
    return this.userService.getUserById(id);
  }

  @ApiOperation({
    summary: 'Add new user',
  })
  @ApiCreatedResponse({
    description:
      'The user was successfully created.  As of now, no de-duping is done.',
  })
  @Post()
  public async addUser(@Body() user: UpdateUserDto) {
    return this.userService.addUser(user);
  }

  @ApiOperation({
    summary: 'Update a user with the passed id',
  })
  @ApiOkResponse({
    description: 'The user was successfully updated',
  })
  @ApiNotFoundResponse({
    description: 'No user with the passed id was found',
  })
  @ApiBadRequestResponse({
    description: 'The passed ID is not a valid UUID',
  })
  @Put(':id')
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The ID of the user to update',
  })
  public async updateUserById(@Param('id') id, @Body() user: UpdateUserDto) {
    return this.userService.updateUser(id, user);
  }

  @ApiOperation({
    summary: 'Delete a user with the passed id',
  })
  @ApiOkResponse({
    description: 'The user was successfully deleted',
  })
  @ApiNotFoundResponse({
    description: 'No user with the passed id was found',
  })
  @ApiBadRequestResponse({
    description: 'The passed ID is not a valid UUID',
  })
  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The ID of the user to delete',
  })
  public async deleteUserById(@Param('id') id) {
    return this.userService.delete(id);
  }
}
