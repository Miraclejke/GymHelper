import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType('RegisterInput', {
  description: 'Data required to register a new GymHelper user.',
})
export class RegisterInput {
  @Field(() => String, {
    description: 'Display name of the new user.',
  })
  @IsString()
  @IsNotEmpty()
  name = '';

  @Field(() => String, {
    description: 'Email address of the new user.',
  })
  @IsEmail()
  email = '';

  @Field(() => String, {
    description: 'Password of the new user.',
  })
  @IsString()
  @MinLength(4)
  password = '';
}
