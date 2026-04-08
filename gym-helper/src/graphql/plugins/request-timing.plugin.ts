import { Plugin } from '@nestjs/apollo';
import type {
  ApolloServerPlugin,
  GraphQLRequestListener,
} from '@apollo/server';
import { Logger } from '@nestjs/common';
import type { GraphqlContext } from '../graphql-context.type';

@Plugin()
export class RequestTimingPlugin implements ApolloServerPlugin<GraphqlContext> {
  private readonly logger = new Logger(RequestTimingPlugin.name);

  requestDidStart(): Promise<GraphQLRequestListener<GraphqlContext>> {
    const startedAt = process.hrtime.bigint();

    return Promise.resolve({
      willSendResponse: ({ contextValue, request }) => {
        const elapsedMs = Math.max(
          1,
          Number((process.hrtime.bigint() - startedAt) / BigInt(1_000_000)),
        );

        contextValue.res?.setHeader('X-Elapsed-Time', `${elapsedMs}ms`);
        this.logger.log(
          `GRAPHQL ${request.operationName ?? 'anonymous'} - ${elapsedMs}ms`,
        );

        return Promise.resolve();
      },
    });
  }
}
