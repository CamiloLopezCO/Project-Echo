import { QdrantClient } from "@qdrant/js-client-rest";

// TO connect to Qdrant running locally
const client = new QdrantClient({ url: "http://127.0.0.1:6333" });

const collectionName = "player-recommendation";

if (!client.collectionExists(collectionName)) {
  client.createCollection(collectionName, {
    vectors: { size: 4, distance: "Cosine" },
  });
}

const limit = 100;
for (let i = 0; i < limit; i++) {
  //   client.upsert(collectionName, {
  //     points: [{ id: i, vector: [i + 2, i, 3, 4] }],
  //   });

  for (let j = 0; j < limit; j++) {
    const timesPlayed = Math.floor(Math.random() * 10);
    client.upsert(collectionName, {
      points: [{ id: limit * i + j, vector: [timesPlayed, 0, 0, 0] }],
    });
    console.log(limit * i + j, j);
  }
}
