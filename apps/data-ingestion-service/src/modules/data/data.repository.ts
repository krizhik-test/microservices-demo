import { Injectable, OnModuleInit } from '@nestjs/common';
import { Filter, InsertManyResult, Document } from 'mongodb';
import { MongoDBService } from '@app/shared';
import { DataItem } from './interfaces';

@Injectable()
export class DataRepository implements OnModuleInit {
  private readonly COLLECTION_NAME = 'data_items';

  constructor(private readonly mongoDBService: MongoDBService) {}

  async onModuleInit() {
    await this.mongoDBService.createIndex(
      this.COLLECTION_NAME,
      { title: 'text' },
      { name: 'title_index' },
    );
  }

  async find(
    criteria: Filter<DataItem>,
    skip: number,
    limit: number,
  ): Promise<DataItem[]> {
    const collection = this.mongoDBService.getCollection<DataItem>(
      this.COLLECTION_NAME,
    );

    const query = collection.find(criteria);

    query.sort({ title: 1 });

    return query.skip(skip).limit(limit).toArray();
  }

  async count(criteria: Filter<DataItem>): Promise<number> {
    return this.mongoDBService
      .getCollection<DataItem>(this.COLLECTION_NAME)
      .countDocuments(criteria);
  }

  async bulkInsert(items: DataItem[]): Promise<InsertManyResult<DataItem>> {
    if (items.length === 0) {
      return { acknowledged: true, insertedCount: 0, insertedIds: {} };
    }

    return this.mongoDBService
      .getCollection<DataItem>(this.COLLECTION_NAME)
      .insertMany(items, { ordered: false });
  }

  /**
   * Analyzes a query to check if indexes are being used
   * @param criteria Search criteria to analyze
   * @returns Query execution plan with index usage information
   */
  async analyzeQuery(criteria: Filter<DataItem>) {
    const collection = this.mongoDBService.getCollection<DataItem>(
      this.COLLECTION_NAME,
    );

    const findPlan = await collection.find(criteria).explain('executionStats');

    const findWithSortPlan = await collection
      .find(criteria)
      .sort({ title: 1 })
      .explain('executionStats');

    return {
      findQuery: {
        indexesUsed: this.extractIndexNames(findPlan),
        executionTimeMillis: findPlan.executionStats?.executionTimeMillis,
        totalDocsExamined: findPlan.executionStats?.totalDocsExamined,
        totalKeysExamined: findPlan.executionStats?.totalKeysExamined,
        isIndexUsed: this.isIndexUsed(findPlan),
      },
      findWithSortQuery: {
        indexesUsed: this.extractIndexNames(findWithSortPlan),
        executionTimeMillis:
          findWithSortPlan.executionStats?.executionTimeMillis,
        totalDocsExamined: findWithSortPlan.executionStats?.totalDocsExamined,
        totalKeysExamined: findWithSortPlan.executionStats?.totalKeysExamined,
        isIndexUsed: this.isIndexUsed(findWithSortPlan),
      },
    };
  }

  private extractIndexNames(plan: Document): string[] {
    const indexNames: string[] = [];

    if (plan.queryPlanner?.winningPlan) {
      this.findIndexesInPlan(plan.queryPlanner.winningPlan, indexNames);
    }

    return indexNames;
  }

  private findIndexesInPlan(plan: Document, indexNames: string[]): void {
    if (!plan) return;

    if (plan.inputStage?.indexName) {
      indexNames.push(plan.inputStage.indexName);
    }
    if (plan.indexName) {
      indexNames.push(plan.indexName);
    }

    if (plan.inputStage) {
      this.findIndexesInPlan(plan.inputStage, indexNames);
    }
    if (plan.inputStages) {
      plan.inputStages.forEach((stage: Document) => {
        this.findIndexesInPlan(stage, indexNames);
      });
    }
  }

  private isIndexUsed(plan: Document): boolean {
    const indexNames = this.extractIndexNames(plan);

    return indexNames.length > 0;
  }
}
