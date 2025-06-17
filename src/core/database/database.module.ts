import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  imports: [],
  providers: [RedisService, PrismaService],
  exports: [PrismaService, RedisService],
})
export class DatabaseModule {}
