import { QdrantClient } from "@qdrant/js-client-rest";
/////////////////////////////////////
//import for Scraped JSON file
import fs from "fs/promises";
////////////////////////////////////
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
  account_id: number;
  name: string;
  //Camilo API ProPlayers added fields
  /////////////////////////////////////
  steamid: string;
  profileurl: string;
  last_login: string;
  country_code: string;
  is_pro: boolean;
  ////////////////////////////////////
  //TODO: add this to the id or vector
  //game: string;
  gamesPlayed: number;
  win: number;
  loss: number;
  geo: Geo;
};
type Geo = {
  lat: number;
  lon: number;
};

async function upsertPlayer(player: PlayerStats) {
  const winLossRatio = player.win / player.gamesPlayed;
  await client.upsert(collectionName, {
    points: [
      {
        id: player.account_id,
        vector: [player.gamesPlayed, player.win, player.loss, winLossRatio],
        payload: {
          account_id: player.account_id,
          name: player.name,
          steamid: player.steamid,
          profileurl: player.profileurl,
          last_login: player.last_login,
          country_code: player.country_code,
          is_pro: player.is_pro,
          geo: player.geo,
        },
      },
    ],
  });
}

const UnitedStates: Geo = { lat: 37.09, lon: -95.71 };
const Peru: Geo = { lat: -9.19, lon: -75.02 };
const Brazil: Geo = { lat: -14.24, lon: -51.93 };

const players: PlayerStats[] = [
  // noob
  {
    account_id: 1,
    steamid: "id 1",
    profileurl: "www.US1.com",
    last_login: "02/02/2024",
    country_code: "us",
    is_pro: true,
    name: "Noob US",
    gamesPlayed: 10,
    win: 1,
    loss: 9,
    geo: UnitedStates,
  },
  // master
  {
    account_id: 2,
    steamid: "id 2",
    profileurl: "www.US2.com",
    last_login: "05/05/2024",
    country_code: "us",
    is_pro: true,
    name: "Master US",
    gamesPlayed: 10,
    win: 9,
    loss: 1,
    geo: UnitedStates,
  },
  //soldier
  {
    account_id: 3,
    steamid: "id 3",
    profileurl: "www.US3.com",
    last_login: "03/03/2024",
    country_code: "us",
    is_pro: true,
    name: "Soldier US",
    gamesPlayed: 10,
    win: 5,
    loss: 5,
    geo: UnitedStates,
  },
  //soldier
  {
    account_id: 4,
    steamid: "id 4",
    profileurl: "www.PE1.com",
    last_login: "01/01/2024",
    country_code: "pe",
    is_pro: true,
    name: "Soldier PE",
    gamesPlayed: 10,
    win: 5,
    loss: 5,
    geo: Peru,
  },
  //master
  {
    account_id: 5,
    steamid: "id 5",
    profileurl: "www.PE2.com",
    last_login: "02/02/2024",
    country_code: "pe",
    is_pro: true,
    name: "Master PE",
    gamesPlayed: 10,
    win: 9,
    loss: 1,
    geo: Peru,
  },
  //noob
  {
    account_id: 6,
    steamid: "id 6",
    profileurl: "www.PE3.com",
    last_login: "03/03/2024",
    country_code: "pe",
    is_pro: true,
    name: "Noob PE",
    gamesPlayed: 10,
    win: 1,
    loss: 9,
    geo: Peru,
  },
  // noob
  {
    account_id: 7,
    steamid: "id 7",
    profileurl: "www.BR1.com",
    last_login: "06/06/2024",
    country_code: "br",
    is_pro: true,
    name: "Noob BR",
    gamesPlayed: 10,
    win: 1,
    loss: 9,
    geo: Brazil,
  },
  // master
  {
    account_id: 8,
    steamid: "id 8",
    profileurl: "www.BR2.com",
    last_login: "07/07/2024",
    country_code: "br",
    is_pro: true,
    name: "Master BR",
    gamesPlayed: 10,
    win: 10,
    loss: 0,
    geo: Brazil,
  },
  //soldier
  {
    account_id: 9,
    steamid: "id 9",
    profileurl: "www.BR3.com",
    last_login: "10/10/2024",
    country_code: "br",
    is_pro: true,
    name: "Soldier BR",
    gamesPlayed: 10,
    win: 5,
    loss: 5,
    geo: Brazil,
  },
];
/////////////////////////////////////////////////////////////
// Function to insert players from a scraped JSON file
async function insertPlayersFromJSON(filePath: string) {
  try {
    // Read and parse the JSON file
    const data = await fs.readFile(filePath, "utf-8");
    const scrapedPlayers: PlayerStats[] = JSON.parse(data);

    // Iterate over each player in the JSON and upsert them into the collection
    for (const player of scrapedPlayers) {
      await upsertPlayer(player);
      console.log(`Player ${player.name} upserted successfully.`);
    }

    console.log("All players from the JSON file have been upserted.");
  } catch (error) {
    console.error("Error inserting players from JSON file:", error);
  }
}
//Call the function with the file path
await insertPlayersFromJSON("./players.json");
////////////////////////////////////////////////////////////////
for (const player of players) {
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
