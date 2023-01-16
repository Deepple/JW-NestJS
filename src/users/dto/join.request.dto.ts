import { ApiProperty } from '@nestjs/swagger';

export class JoinRequestDto {
  @ApiProperty({
    example: 'jeaewon.jang@soldout.com',
    description: '이메일',
    required: true,
  })
  public email: string;

  @ApiProperty({
    example: 'jewon119',
    description: '닉네임',
    required: true,
  })
  public nickname: string;

  @ApiProperty({
    example: 'abcd1234',
    description: '비밀번호',
    required: true,
  })
  public password: string;
}
