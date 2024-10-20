import { QdrantClient } from "@qdrant/js-client-rest";

// TO connect to Qdrant running locally
const client = new QdrantClient({ url: "http://127.0.0.1:6333" });

const collectionName = "player-recommendation";

const exists = await client.collectionExists(collectionName);
if (!exists.exists) {
  console.log(`Creating collection ${collectionName}`);
  await client.createCollection(collectionName, {
    vectors: { size: 4, distance: "Cosine" },
  });
}

type PlayerStats = {
  id: number;
  gamesPlayed: number;
  win: number;
  loss: number;
};

async function upsertPlayer(player: PlayerStats) {
  const winLossRatio = player.win / player.gamesPlayed;
  await client.upsert(collectionName, {
    points: [
      {
        id: player.id,
        vector: [player.gamesPlayed, player.win, player.loss, winLossRatio],
      },
    ],
  });
}

const players = [
  // noob
  { id: 1, gamesPlayed: 5, win: 1, loss: 4 },
  // master
  { id: 2, gamesPlayed: 10, win: 9, loss: 1 },
  //soldier
  { id: 3, gamesPlayed: 20, win: 10, loss: 10 },
  //soldier
  { id: 4, gamesPlayed: 30, win: 15, loss: 15 },
  //master
  { id: 5, gamesPlayed: 40, win: 30, loss: 10 },
  //noob
  { id: 6, gamesPlayed: 50, win: 10, loss: 40 },
];

for (let player of players) {
  await upsertPlayer(player);
}
//   players.map(player => {
//       upsertPlayer(player)
//   })

// const limit = 100;
// for (let i = 0; i < limit; i++) {
//   //   client.upsert(collectionName, {
//   //     points: [{ id: i, vector: [i + 2, i, 3, 4] }],
//   //   });

//   for (let j = 0; j < limit; j++) {
//     const timesPlayed = Math.floor(Math.random() * 10);
//     client.upsert(collectionName, {
//       points: [{ id: limit * i + j, vector: [timesPlayed, 0, 0, 0] }],
//     });
//     console.log(limit * i + j, j);
//   }
// }
