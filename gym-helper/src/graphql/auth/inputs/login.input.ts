import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength } from 'class-validator';

@InputType('LoginInput', {
  description: 'Credentials used to create a user session.',
})
export class LoginInput {
  @Field(() => String, {
    description: 'Email address of the user.',
  })
  @IsEmail()
  email = '';

  @Field(() => String, {
    description: 'Password of the user.',
  })
  @IsString()
  @MinLength(4)
  password = '';
}
