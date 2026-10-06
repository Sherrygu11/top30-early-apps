const { MongoClient } = require("mongodb");

let clientPromise;

function getDb() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set");
  }
  if (!clientPromise) {
    clientPromise = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    })
      .connect()
      .catch((err) => {
        clientPromise = undefined;
        throw err;
      });
  }
  return clientPromise.then((client) => client.db());
}

module.exports = { getDb };
