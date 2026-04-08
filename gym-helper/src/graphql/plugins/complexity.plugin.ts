import { Plugin } from '@nestjs/apollo';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import {
  ApolloServerPlugin,
  BaseContext,
  GraphQLRequestListener,
} from '@apollo/server';
import { GraphQLError } from 'graphql';
import {
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator,
} from 'graphql-query-complexity';

const MAX_QUERY_COMPLEXITY = 30;

@Plugin()
export class ComplexityPlugin implements ApolloServerPlugin<BaseContext> {
  constructor(private readonly gqlSchemaHost: GraphQLSchemaHost) {}

  requestDidStart(): Promise<GraphQLRequestListener<BaseContext>> {
    const { schema } = this.gqlSchemaHost;

    return Promise.resolve({
      didResolveOperation({ request, document }) {
        if (request.operationName === 'IntrospectionQuery') {
          return Promise.resolve();
        }

        const complexity = getComplexity({
          schema,
          operationName: request.operationName,
          query: document,
          variables: request.variables,
          estimators: [
            fieldExtensionsEstimator(),
            simpleEstimator({ defaultComplexity: 1 }),
          ],
        });

        if (complexity > MAX_QUERY_COMPLEXITY) {
          throw new GraphQLError(
            `Query is too complex: ${complexity}. Maximum allowed complexity is ${MAX_QUERY_COMPLEXITY}.`,
          );
        }

        return Promise.resolve();
      },
    });
  }
}
