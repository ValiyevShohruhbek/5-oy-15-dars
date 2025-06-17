import { SmsService } from './sms.service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { RedisService } from 'src/core/database/redis.service';
import { generate } from 'otp-generator';

@Injectable()
export class OtpService {
  constructor(
    private redisService: RedisService,
    private readonly smsService: SmsService,
  ) {}
  private generateOtp() {
    const otp = generate(6, {
      lowerCaseAlphabets: false,
      specialChars: false,
      upperCaseAlphabets: false,
      digits: true,
    });
    return otp;
  }

  private getSessionToken() {
    const token = crypto.randomUUID();
    return token;
  }

  async sendOtp(phone_number: string) {
    const key = `user:${phone_number}`;

    await this.checkOtpExisted(key);
    const tempOtp = this.generateOtp();

    const responseRedis = await this.redisService.setOtp(phone_number, tempOtp);
    if (responseRedis == 'OK') {
      await this.smsService.sendSms(phone_number, tempOtp);
      return true;
    }
  }

  async checkOtpExisted(key: string) {
    const checkOtp = await this.redisService.getOtp(key);

    if (checkOtp) {
      const ttl = await this.redisService.getTtlKey(key);
      throw new BadRequestException(`Please try again after ${ttl} seconds`);
    }
    return checkOtp;
  }

  async verifyOtpSendedUser(key: string, code: string, phone_number: string) {
    const otp = await this.redisService.getOtp(key);
    if (!otp || otp !== code)
      throw new BadRequestException('you sended code invalid');

    await this.redisService.delOtp(key);
    const sessionToken = this.getSessionToken();
    await this.redisService.setSessionToken(phone_number, sessionToken);
    return sessionToken;
  }

  async checkSessionTokenUser(key: string, session_token: string) {
    const token: string = (await this.redisService.getKey(key)) as string;
    if (!token || session_token !== token)
      throw new InternalServerErrorException('Session token false');
  }
}
