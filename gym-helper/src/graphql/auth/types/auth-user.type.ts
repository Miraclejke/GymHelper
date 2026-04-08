import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('AuthUser', {
  description: 'Authenticated GymHelper user returned by GraphQL operations.',
})
export class AuthUserType {
  @Field(() => String, {
    description: 'Unique user identifier.',
  })
  id!: string;

  @Field(() => String, {
    description: 'Display name of the user.',
  })
  name!: string;

  @Field(() => String, {
    description: 'User email address.',
  })
  email!: string;

  @Field(() => String, {
    description: 'Role assigned to the user.',
  })
  role!: 'user' | 'admin';
}
