import { Context, Mutation, Query, Resolver, Args } from '@nestjs/graphql';
import { AuthService } from '../../auth/auth.service';
import {
  destroyUserSession,
  establishUserSession,
} from '../../auth/session.util';
import type { GraphqlContext } from '../graphql-context.type';
import { LoginInput } from './inputs/login.input';
import { RegisterInput } from './inputs/register.input';
import { AuthUserType } from './types/auth-user.type';

@Resolver(() => AuthUserType)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => AuthUserType, {
    name: 'me',
    nullable: true,
    description: 'Returns the current user from the active session.',
  })
  me(@Context() context: GraphqlContext) {
    return this.authService.getCurrentUser(context.req.session?.userId);
  }

  @Mutation(() => AuthUserType, {
    name: 'login',
    description:
      'Logs in the user and stores the session identifier in the cookie.',
  })
  async login(
    @Args('input') input: LoginInput,
    @Context() context: GraphqlContext,
  ) {
    const user = await this.authService.login(input.email, input.password);
    await establishUserSession(context.req, user.id);

    return this.authService.toAuthUser(user);
  }

  @Mutation(() => AuthUserType, {
    name: 'register',
    description: 'Registers a new user and immediately creates a session.',
  })
  async register(
    @Args('input') input: RegisterInput,
    @Context() context: GraphqlContext,
  ) {
    const user = await this.authService.register(
      input.name,
      input.email,
      input.password,
    );
    await establishUserSession(context.req, user.id);

    return this.authService.toAuthUser(user);
  }

  @Mutation(() => Boolean, {
    name: 'logout',
    description: 'Destroys the current session and clears the session cookie.',
  })
  logout(@Context() context: GraphqlContext) {
    return destroyUserSession(context.req).then(() => {
      context.res.clearCookie('gymhelper.sid');
      return true;
    });
  }
}
