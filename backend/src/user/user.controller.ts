import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from 'src/dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllUsers(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.userService.findAll(page, limit);
  }

  @Patch(':adress')
  @HttpCode(HttpStatus.OK)
  async updateUserProfile(
    @Param('adress') adress: string,
    @Body(ValidationPipe) updateDto: UpdateUserDto,
  ) {
    return this.userService.updateProfile(adress, updateDto);
  }

  @Get(':adress/nfts')
  @HttpCode(HttpStatus.OK)
  async getUserNFTs(
    @Param('adress') adress: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.userService.getUserNFTs(adress, page, limit);
  }

  @Get(':adress/minted')
  @HttpCode(HttpStatus.OK)
  async getUserMintedNFTs(
    @Param('adress') adress: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.userService.getUserMintedNFTs(adress, page, limit);
  }

  @Get(':adress/stats')
  @HttpCode(HttpStatus.OK)
  async getUserStats(@Param('adress') adress: string) {
    return this.userService.getUserStats(adress);
  }

  @Get(':adress')
  @HttpCode(HttpStatus.OK)
  async getUserProfile(@Param('adress') adress: string) {
    return this.userService.getUserProfile(adress);
  }
}
