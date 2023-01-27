import bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../entities/Users';
import { JoinRequestDto } from './dto/join.request.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private usersRepository: Repository<Users>,
  ) {}

  async findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password'],
    });
  }

  async JoinUsers(userData: JoinRequestDto) {
    const { email, nickname, password } = userData;
    const user = await this.usersRepository.findOne({ where: { email } });
    if (user) {
      throw new UnauthorizedException('이미 존재하는 사용자 입니다.');
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await this.usersRepository.save({
      email,
      nickname,
      password: hashedPassword,
    });
    if (result) {
      const { password, updatedAt, deletedAt, ...userWithoutPassword } = result;
      return userWithoutPassword;
    }
  }
}
