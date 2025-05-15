import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongoClient,
  Db,
  Collection,
  IndexSpecification,
  CreateIndexesOptions,
} from 'mongodb';

@Injectable()
export class MongoDBService implements OnModuleInit, OnModuleDestroy {
  private client: MongoClient;
  private db: Db;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    // Determine which service is running based on multiple possible indicators
    let isLoggingService = false;

    // 1. First priority: Check npm command arguments (for local development)
    if (process.env.npm_config_argv) {
      const npmArgs = JSON.parse(process.env.npm_config_argv);
      const appName = npmArgs.remain[0] || '';
      isLoggingService = appName.includes('logging');
    }
    // 2. Second priority: Check process arguments
    else if (process.argv.length > 0) {
      const args = process.argv.join(' ');
      isLoggingService = args.includes('logging');
    }
    // 3. Third priority: Check Docker-specific environment variables
    else if (this.configService.get<string>('app.portLogging')) {
      isLoggingService = true;
    }

    // Select the appropriate MongoDB URI based on the service determination
    let variableName: string;

    if (isLoggingService) {
      variableName = 'mongo.loggingUri';
    } else {
      variableName = 'mongo.dataIngestionUri';
    }

    const uri = this.configService.get<string>(variableName);

    if (!uri) {
      throw new Error('MongoDB URI not found in environment variables');
    }

    this.client = new MongoClient(uri);
    await this.client.connect();

    const dbName = uri.split('/').pop();
    this.db = this.client.db(dbName);

    console.log(`Connected to MongoDB: ${uri}`);
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.close();
    }
  }

  getCollection<T = any>(collectionName: string): Collection<T> {
    return this.db.collection<T>(collectionName);
  }

  getDb(): Db {
    return this.db;
  }

  async createIndex(
    collectionName: string,
    field: string | object,
    options: CreateIndexesOptions = {},
  ) {
    // Convert field to proper IndexSpecification format
    const indexSpec: IndexSpecification =
      typeof field === 'string'
        ? { [field]: 1 }
        : (field as IndexSpecification);

    return this.db.collection(collectionName).createIndex(indexSpec, options);
  }
}
