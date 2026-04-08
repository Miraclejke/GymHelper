import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { GraphqlContext } from '../graphql-context.type';

@Injectable()
export class GqlSessionAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const gqlContext =
      GqlExecutionContext.create(context).getContext<GraphqlContext>();

    if (gqlContext.req.session?.userId) {
      return true;
    }

    throw new UnauthorizedException('You need to log in.');
  }
}
