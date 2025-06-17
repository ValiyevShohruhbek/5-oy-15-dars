import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import bcrypt from 'bcrypt';
import { userInfo } from 'os';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    const checkPhoneNumber = await this.prismaService.user.findUnique({
      where: { phone_number: createUserDto.phone_number },
    });
    if (checkPhoneNumber)
      throw new ConflictException('Phone number already exists');
    const checkUserName = await this.prismaService.user.findUnique({
      where: { username: createUserDto.username },
    });
    if (checkUserName) throw new ConflictException('Username already exists');
    const checkEmail = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (checkEmail) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    const { session_token, ...data } = createUserDto;
    const { password, ...userInfo } = await this.prismaService.user.create({
      data: { ...data, password: hashedPassword },
    });

    return { user: userInfo };
  }

  async findAll() {
    return await this.prismaService.user.findMany();
  }

  async findOne(id: string) {
    return await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {}

  async remove(id: string) {
    return await this.prismaService.user.delete({ where: { id } });
  }

  async findPhoneNumber(phoneNumber: string) {
    return await this.prismaService.user.findFirst({
      where: { phone_number: phoneNumber },
    });
  }
}
