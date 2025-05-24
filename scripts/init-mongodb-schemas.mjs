#!/usr/bin/env node
// Schema initialization script for MongoDB collections
// Run this script to create collections with validation schemas

import { MongoClient } from "mongodb";
import {
  CourseSchema,
  UnitSchema,
  QuestionSchema,
  UserProgressSchema,
} from "../schemas/mongodb-schemas.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/";
const DB_NAME = "Content";

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI environment variable is required");
  process.exit(1);
}

/**
 * Initialize MongoDB collections with validation schemas
 */
async function initializeSchemas() {
  let client;

  try {
    console.log("🚀 Connecting to MongoDB...");
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DB_NAME);
    console.log(`✅ Connected to database: ${DB_NAME}`);

    // Collections to create with their schemas
    const collections = [
      { name: "Courses", schema: CourseSchema },
      { name: "Units", schema: UnitSchema },
      { name: "Questions", schema: QuestionSchema },
      { name: "UserProgress", schema: UserProgressSchema },
    ];

    for (const { name, schema } of collections) {
      try {
        // Check if collection already exists
        const existingCollections = await db
          .listCollections({ name })
          .toArray();

        if (existingCollections.length > 0) {
          console.log(
            `📝 Collection '${name}' already exists, updating schema validation...`
          );

          // Update existing collection with new validation rules
          await db.command({
            collMod: name,
            validator: schema.validator,
          });

          console.log(`✅ Updated validation schema for '${name}'`);
        } else {
          console.log(
            `📝 Creating collection '${name}' with validation schema...`
          );

          // Create new collection with validation
          await db.createCollection(name, schema);

          console.log(`✅ Created collection '${name}' with validation schema`);
        }

        // Create indexes for better performance
        await createIndexes(db, name);
      } catch (error) {
        console.error(
          `❌ Error setting up collection '${name}':`,
          error.message
        );
        throw error;
      }
    }

    console.log("🎉 Schema initialization completed successfully!");

    // Display collection statistics
    await displayCollectionStats(
      db,
      collections.map((c) => c.name)
    );
  } catch (error) {
    console.error("❌ Schema initialization failed:", error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log("🔒 Database connection closed");
    }
  }
}

/**
 * Create performance indexes for collections
 */
async function createIndexes(db, collectionName) {
  const collection = db.collection(collectionName);

  switch (collectionName) {
    case "Courses":
      await collection.createIndex({ title: 1 });
      await collection.createIndex({ category: 1 });
      await collection.createIndex({ level: 1 });
      await collection.createIndex({ instructorId: 1 });
      await collection.createIndex({ isActive: 1, isPublished: 1 });
      await collection.createIndex({ createdAt: -1 });
      console.log(`📊 Created indexes for ${collectionName}`);
      break;

    case "Units":
      await collection.createIndex({ courseId: 1 });
      await collection.createIndex({ courseId: 1, order: 1 });
      await collection.createIndex({ isActive: 1 });
      console.log(`📊 Created indexes for ${collectionName}`);
      break;

    case "Questions":
      await collection.createIndex({ unitId: 1 });
      await collection.createIndex({ courseId: 1 });
      await collection.createIndex({ unitId: 1, order: 1 });
      await collection.createIndex({ type: 1 });
      await collection.createIndex({ difficulty: 1 });
      await collection.createIndex({ isActive: 1 });
      console.log(`📊 Created indexes for ${collectionName}`);
      break;

    case "UserProgress":
      await collection.createIndex({ userId: 1 });
      await collection.createIndex({ courseId: 1 });
      await collection.createIndex(
        { userId: 1, courseId: 1 },
        { unique: true }
      );
      await collection.createIndex({ enrolledAt: -1 });
      await collection.createIndex({ lastAccessedAt: -1 });
      console.log(`📊 Created indexes for ${collectionName}`);
      break;
  }
}

/**
 * Display collection statistics
 */
async function displayCollectionStats(db, collectionNames) {
  console.log("\n📈 Collection Statistics:");
  console.log("─".repeat(50));

  for (const name of collectionNames) {
    try {
      const stats = await db.collection(name).stats();
      console.log(`${name}:`);
      console.log(`  Documents: ${stats.count || 0}`);
      console.log(
        `  Indexes: ${
          stats.indexSizes ? Object.keys(stats.indexSizes).length : 0
        }`
      );
      console.log(
        `  Storage Size: ${
          stats.storageSize ? Math.round(stats.storageSize / 1024) : 0
        } KB`
      );
      console.log("");
    } catch (error) {
      console.log(`${name}: Stats unavailable (${error.message})`);
    }
  }
}

/**
 * Validate schema definitions
 */
function validateSchemas() {
  const schemas = [
    CourseSchema,
    UnitSchema,
    QuestionSchema,
    UserProgressSchema,
  ];

  for (const schema of schemas) {
    if (!schema.validator || !schema.validator.$jsonSchema) {
      throw new Error(
        "Invalid schema structure: missing validator.$jsonSchema"
      );
    }
  }

  console.log("✅ All schemas are valid");
}

// Main execution
async function main() {
  console.log("🏗️  MongoDB Schema Initialization");
  console.log("=".repeat(50));

  try {
    validateSchemas();
    await initializeSchemas();
  } catch (error) {
    console.error("💥 Initialization failed:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === new URL(import.meta.url).href) {
  main();
}

export { initializeSchemas, createIndexes };
