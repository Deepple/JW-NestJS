import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getTestEnv(): string {
    return process.env.SECRET;
  }
}
