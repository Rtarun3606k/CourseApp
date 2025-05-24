import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // In development, use a global variable so that the connection
  // is reused between hot-reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a new connection
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDatabase() {
  const client = await clientPromise;

  const ContentDb = client.db("Content");

  const Users = ContentDb.collection("Users");
  const Courses = ContentDb.collection("Courses");
  const Units = ContentDb.collection("Units");
  const Questions = ContentDb.collection("Questions");
  const UserProgress = ContentDb.collection("UserProgress");
  const Admin = ContentDb.collection("Admin");
  return {
    Admin,
    client,
    ContentDb,
    Users,
    Courses,
    Units,
    Questions,
    UserProgress,
  };
}
