import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  MongoClient,
  Db,
  Collection,
  IndexSpecification,
  CreateIndexesOptions,
} from "mongodb";

@Injectable()
export class MongoDBService implements OnModuleInit, OnModuleDestroy {
  private client: MongoClient;
  private db: Db;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    // Determine which service is running based on multiple possible indicators
    let isLoggingService = false;
    let isDataService = false;

    // 1. First priority: Check npm command arguments (for local development)
    if (process.env.npm_config_argv) {
      const npmArgs = JSON.parse(process.env.npm_config_argv);
      const appName = npmArgs.remain[0] || "";
      isLoggingService = appName.includes("logging");
      isDataService = appName.includes("data") || appName.includes("ingestion");
      console.log(`Detected service from npm command: ${appName}`);
    }
    // 2. Second priority: Check process arguments
    else if (process.argv.length > 0) {
      const args = process.argv.join(" ");
      isLoggingService = args.includes("logging");
      isDataService = args.includes("data") || args.includes("ingestion");
      console.log(
        `Detected service from process arguments: ${
          isLoggingService
            ? "logging"
            : isDataService
            ? "data-ingestion"
            : "unknown"
        }`
      );
    }
    // 3. Third priority: Check Docker-specific environment variables
    else if (this.configService.get<string>("PORT_LOGGING")) {
      isLoggingService = true;
      console.log(
        "Detected logging service from PORT_LOGGING environment variable"
      );
    } else if (this.configService.get<string>("PORT_DATA_INGESTION")) {
      isDataService = true;
      console.log(
        "Detected data-ingestion service from PORT_DATA_INGESTION environment variable"
      );
    }
    // 4. Last resort: Use a default if we can't determine
    else {
      console.log(
        "Could not determine service type, defaulting to data-ingestion-service"
      );
      isDataService = true;
    }

    // Select the appropriate MongoDB URI based on the service determination
    let variableName: string;

    if (isLoggingService) {
      variableName = "LOGGING_SERVICE_MONGODB_URI";
      console.log("Using Logging Service MongoDB URI");
    } else {
      variableName = "DATA_SERVICE_MONGODB_URI";
      console.log("Using Data Ingestion Service MongoDB URI");
    }

    const uri = this.configService.get<string>(variableName);

    if (!uri) {
      throw new Error("MongoDB URI not found in environment variables");
    }

    this.client = new MongoClient(uri);
    await this.client.connect();

    const dbName = uri.split("/").pop();
    this.db = this.client.db(dbName);

    console.log(`Connected to MongoDB: ${uri}`);
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.close();
      console.log("MongoDB connection closed");
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
    options: CreateIndexesOptions = {}
  ) {
    // Convert field to proper IndexSpecification format
    const indexSpec: IndexSpecification =
      typeof field === "string"
        ? { [field]: 1 }
        : (field as IndexSpecification);

    return this.db.collection(collectionName).createIndex(indexSpec, options);
  }
}
