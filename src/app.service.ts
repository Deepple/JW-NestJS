import { Injectable } from '@nestjs/common';
import { UsersService } from './users/users.service';
import * as process from 'process';

@Injectable()
export class AppService {
  constructor(private UsersService: UsersService) {}

  getHello() {
    return 'Hello World!';
  }
}
