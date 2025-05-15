import { ApiProperty } from '@nestjs/swagger';
import { Filter } from 'mongodb';
import { DataItem } from '../../modules/data/interfaces/data-item.interface';

export class QueryExecutionDetails {
  @ApiProperty({
    description: 'Names of indexes used during query execution',
    type: [String],
  })
  indexesUsed: string[];

  @ApiProperty({
    description: 'Query execution time in milliseconds',
  })
  executionTimeMillis: number;

  @ApiProperty({
    description: 'Total number of documents examined during query execution',
  })
  totalDocsExamined: number;

  @ApiProperty({
    description: 'Total number of index keys examined during query execution',
  })
  totalKeysExamined: number;

  @ApiProperty({
    description: 'Whether any index was used during query execution',
  })
  isIndexUsed: boolean;
}

export class QueryAnalysisResponseDto {
  @ApiProperty({
    description: 'The MongoDB query that was generated',
    type: Object,
  })
  query: Filter<DataItem>;

  @ApiProperty({
    description: 'Analysis of the query execution',
    type: Object,
  })
  analysis: {
    findQuery: QueryExecutionDetails;
    findWithSortQuery: QueryExecutionDetails;
  };
}
