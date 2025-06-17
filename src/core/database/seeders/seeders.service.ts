import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class SeedersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {}
}
