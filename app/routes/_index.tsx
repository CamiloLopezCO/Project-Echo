import type { MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { QdrantClient } from "@qdrant/js-client-rest";
//import pg from "pg";
import { useState } from "react";


// POST collections/player-recommendation/points/scroll
// {
//   "limit": 4,
//   "with_vector":true,
//    "filter": {
//     "must": [
//       {
//         "key": "geo",
//         "geo_radius": {
//           "center":{
//             "lat": 40.73, 
//             "lon": -73.93 
//           },
//           "radius": 10
//         }
//       }
//     ]
//    }
// }
//
//
type PlayerRef = {
  id: number
  geo: Geo
}

type PlayerStats = {
  id: number;
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


const noobId = 6
const masterId = 5
const queryPlayers = async (geo: Geo) => {
  const collectionName = "player-recommendation";
  // TO connect to Qdrant running locally
  const client = new QdrantClient({ url: "http://127.0.0.1:6333" });
  const results = await client.recommend(collectionName, {
    "positive": [noobId],
    "negative": [masterId],
    "strategy": "average_vector",
    "filter": {
      "must": [
        {
          "key": "geo",
          "geo_radius": {
            "center": geo,
            "radius": 10
          }
        }
      ]
    },
    "limit": 10
  })
  // POST /collections/player-recommendation/points/query
  return results.map(item => ({ id: item.id, geo: item.payload as Geo }))
}

// async function upsertPlayer(player: PlayerStats) {
//   const winLossRatio = player.win / player.gamesPlayed;
//   await client.upsert(collectionName, {
//     points: [
//       {
//         id: player.id,
//         vector: [player.gamesPlayed, player.win, player.loss, winLossRatio],
//         payload: { geo: player.geo },
//       },
//     ],
//   });
// }
//
// const createCollection = async () => {
//   const exists = await client.collectionExists(collectionName);
//   if (!exists.exists) {
//     console.log(`Creating collection ${collectionName}`);
//     await client.createCollection(collectionName, {
//       vectors: { size: 4, distance: "Cosine" },
//     });
//   }
// }
//

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

const user = {
  id: 123,
  name: "test-name2",
};
const user2 = {
  id: 1234,
  name: "camilo",
};

// const users = [user, user2];

//TODO swap with data from postgres
async function _getUsers() {
  const { Client } = pg;
  const client = new Client({ password: "password", user: "postgres", port: 6432 });
  await client.connect();

  const res = await client.query("select id,name from player");
  console.log(res.rows.map(row => row.message));
  await client.end();
  return res.rows;
}

export async function loader() {
  const geo = {
    "lat": 40.73,
    "lon": -73.93
  }
  return json(await queryPlayers(geo));
}
// select id,name from player;

const GeoButton = ({ name, onClick }: { name: string, onClick: () => void }) =>
  <button
    onClick={onClick}
    type="button"
    className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
  >
    {name}
  </button>

const NewYork: Geo = { lat: 40.73, lon: -73.93 };
const Miami: Geo = { lat: 25.79, lon: -80.13 };
const California: Geo = { lat: 36.77, lon: -119.41 };
const Wisconsin: Geo = { lat: 44.25, lon: -89.63 };

type City = {
  name: string
  geo: Geo
}

const cities: City[] = [
  { name: "New York", geo: NewYork },
  { name: "Miami", geo: Miami },
  { name: "California", geo: California },
  { name: "Wisconsin", geo: Wisconsin },
]

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const users = data.map((user) => <div key={user.id}>{user.id}</div>);
  const [lat, setLat] = useState(40.73)
  const [lon, setLon] = useState(-73.93)

  const [city, setCity] = useState(cities[0])

  const setGeo = (city: City) => {
    setCity(city)
    setLat(city.geo.lat)
    setLon(city.geo.lon)
  }

  //map(data, lambda x: x)
  //const glatreeting = "Hello"
  return (
    <div className="flex h-screen items-center flex flex-col mt-10">
      <div className="flex flex-row space-x-4">
        {
          cities.map((city, i) =>
            <div key={i} className="mb-4">
              <GeoButton name={city.name} onClick={() => setGeo(city)} />
            </div>
          )
        }
      </div>
      <div>
        {city.name}
      </div>
      <div className="flex flex-row">
        <div className="m-4">
          <div className="mb-2">Latitude</div>
          <input value={lat} onChange={event => setLat(event.target.value)} placeholder="Latitude" autoFocus={true} className="py-2 px-2 bg-white text-black rounded-md" />
        </div>
        <div className="m-4">
          <div className="mb-2">Longitude</div>
          <input value={lon} onChange={event => setLon(event.target.value)} placeholder="Longitude" className="py-2 px-2 bg-white text-black rounded-md" />
        </div>
      </div>
      <div>
        {lat}
      </div>
      <div>
        {lon}
      </div>
      {users}
    </div>
  );
}

