import { Field, ArgsType, Int } from '@nestjs/graphql';
import { Max, Min } from 'class-validator';

@ArgsType()
export class PaginationArgs {
  @Field(() => Int, {
    defaultValue: 1,
    description: 'Page number starting from 1.',
  })
  @Min(1)
  page = 1;

  @Field(() => Int, {
    defaultValue: 10,
    description: 'Maximum number of items to return on a single page.',
  })
  @Min(1)
  @Max(50)
  limit = 10;
}
