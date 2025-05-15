import { Injectable, OnModuleInit } from '@nestjs/common';
import { MongoDBService } from '@app/shared';
import { Filter, InsertManyResult } from 'mongodb';
import { EventDocument } from './interfaces';

@Injectable()
export class EventsRepository implements OnModuleInit {
  private readonly COLLECTION_NAME = 'events';

  constructor(private readonly mongoDBService: MongoDBService) {}

  async onModuleInit() {
    await this.mongoDBService.createIndex(
      this.COLLECTION_NAME,
      { 'payload.timestamp': -1 },
      { name: 'timestamp_index' },
    );

    await this.mongoDBService.createIndex(
      this.COLLECTION_NAME,
      { type: 1, 'payload.operation': 1, 'payload.status': 1 },
      { name: 'type_operation_status_index' },
    );
  }

  async find(
    criteria: Filter<EventDocument>,
    skip: number,
    limit: number,
  ): Promise<EventDocument[]> {
    return this.mongoDBService
      .getCollection(this.COLLECTION_NAME)
      .find(criteria)
      .sort({ 'payload.timestamp': -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  async findById(id: string): Promise<EventDocument | null> {
    return this.mongoDBService
      .getCollection(this.COLLECTION_NAME)
      .findOne({ _id: id });
  }

  async count(criteria: Filter<EventDocument>): Promise<number> {
    return this.mongoDBService
      .getCollection(this.COLLECTION_NAME)
      .countDocuments(criteria);
  }

  async insert(event: EventDocument): Promise<{ insertedId: any }> {
    return this.mongoDBService
      .getCollection(this.COLLECTION_NAME)
      .insertOne(event);
  }

  async bulkInsert(
    events: EventDocument[],
  ): Promise<InsertManyResult<EventDocument>> {
    if (events.length === 0) {
      return { acknowledged: true, insertedCount: 0, insertedIds: {} };
    }

    return this.mongoDBService
      .getCollection(this.COLLECTION_NAME)
      .insertMany(events);
  }
}
