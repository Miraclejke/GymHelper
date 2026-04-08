import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { GraphqlContext } from '../graphql-context.type';

export const GqlCurrentUserId = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const gqlContext =
      GqlExecutionContext.create(context).getContext<GraphqlContext>();

    return gqlContext.req.session?.userId;
  },
);
