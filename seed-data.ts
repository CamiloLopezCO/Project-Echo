import { QdrantClient } from "@qdrant/js-client-rest";
/////////new code////////////
import axios from "axios";
import { Client } from "pg";
const insertProPlayers = async (players: ProPlayer[]) => {
  const client = new Client({
    user: "your_username",
    host: "your_host",
    database: "your_database",
    password: "your_password",
    port: 5432, // Default PostgreSQL port
  });
  await client.connect();

  const query = `
    INSERT INTO pro_players (
      account_id, steamid, avatar, avatarmedium, avatarfull, profileurl, personaname,
      last_login, full_history_time, cheese, fh_unavailable, loccountrycode, last_match_time,
      name, country_code, fantasy_role, team_id, team_name, team_tag, is_locked, is_pro, locked_until
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
    ON CONFLICT (account_id) DO NOTHING;
  `;

  for (const player of players) {
    await client.query(query, [
      player.account_id,
      player.steamid,
      player.avatar,
      player.avatarmedium,
      player.avatarfull,
      player.profileurl,
      player.personaname,
      player.last_login,
      player.full_history_time,
      player.cheese,
      player.fh_unavailable,
      player.loccountrycode,
      player.last_match_time,
      player.name,
      player.country_code,
      player.fantasy_role,
      player.team_id,
      player.team_name,
      player.team_tag,
      player.is_locked,
      player.is_pro,
      player.locked_until,
    ]);
  }

  await client.end();
};

/////////////////////////////////////////////////
// TO connect to Qdrant running locally
const client = new QdrantClient({ url: "http://127.0.0.1:7333" });

const collectionName = "player-recommendation";

const exists = await client.collectionExists(collectionName);
if (!exists.exists) {
  console.log(`Creating collection ${collectionName}`);
  await client.createCollection(collectionName, {
    vectors: { size: 4, distance: "Cosine" },
  });
}
////////////////new code could die//////////////
type ProPlayer = {
  account_id: number;
  steamid: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  profileurl: string;
  personaname: string;
  last_login: string | null;
  full_history_time: string | null;
  cheese: number;
  fh_unavailable: boolean;
  loccountrycode: string | null;
  last_match_time: string | null;
  name: string | null;
  country_code: string | null;
  fantasy_role: number | null;
  team_id: number | null;
  team_name: string | null;
  team_tag: string | null;
  is_locked: boolean;
  is_pro: boolean;
  locked_until: number | null;
};
export const fetchProPlayers = async (): Promise<ProPlayer[]> => {
  const url = "https://api.opendota.com/api/proPlayers";
  try {
    const response = await axios.get<ProPlayer[]>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching pro players:", error);
    throw new Error("Failed to fetch pro players");
  }
};

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
        //add fields to the vector that make sence for searching, vector normalized data into numbers
        vector: [player.gamesPlayed, player.win, player.loss, winLossRatio],
        //fields in the payload object are intended for use in the UI or in the API
        payload: {
          win: player.win,
          loss: player.loss,
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
for (const player of players) {
  await upsertPlayer(player);
}
