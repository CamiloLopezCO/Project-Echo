import type { MetaFunction } from "@remix-run/node";
import { Geo, queryPlayers, type PlayerRef } from "./user-query";
import { json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { QdrantClient } from "@qdrant/js-client-rest";
//import pg from "pg";
import { useRef, useState } from "react";

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

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

// const users = [user, user2];

//TODO swap with data from postgres
async function _getUsers() {
  const { Client } = pg;
  const client = new Client({
    password: "password",
    user: "postgres",
    port: 6432,
  });
  await client.connect();

  const res = await client.query("select id,name from player");
  console.log(res.rows.map((row) => row.message));
  await client.end();
  return res.rows;
}
const geo = {
  lat: -14.24,
  lon: -51.93,
};
export async function loader() {
  return json(await queryPlayers(geo));
}
// select id,name from player;

const GeoButton = ({
  name,
  onClick,
}: {
  name: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    type="button"
    className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
  >
    {name}
  </button>
);

const UnitedStates: Geo = { lat: 37.09, lon: -95.71 };
const Peru: Geo = { lat: -9.19, lon: -75.02 };
const Brazil: Geo = { lat: -14.24, lon: -51.93 };

type Country = {
  name: string;
  geo: Geo;
};

const countries: Country[] = [
  { name: "UnitedStates", geo: UnitedStates },
  { name: "Peru", geo: Peru },
  { name: "Brazil", geo: Brazil },
];

export default function Index() {
  const serverData = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const data = (fetcher.data as PlayerRef[] | undefined) ?? []; //?? serverData;

  const [lat, setLat] = useState(geo.lat.toString());
  const [lon, setLon] = useState(geo.lon.toString());

  const [country, setCountry] = useState(countries[0]);
  const ref = useRef<HTMLFormElement>(null);

  const setGeo = (country: Country) => {
    setCountry(country);
    setLat(country.geo.lat.toString());
    setLon(country.geo.lon.toString());
    if (ref.current) {
      fetcher.submit(ref.current);
    }
  };

  //map(data, lambda x: x)
  //const glatreeting = "Hello"
  return (
    <div className="flex h-screen items-center flex flex-col mt-10">
      <div className="flex flex-row space-x-4">
        {countries.map((country, i) => (
          <div key={i} className="mb-4">
            <GeoButton name={country.name} onClick={() => setGeo(country)} />
          </div>
        ))}
      </div>
      <div>{country.name}</div>
      <div className="flex flex-row">
        <fetcher.Form ref={ref} method="get" action="/user-query">
          <div className="m-4">
            <div className="mb-2">Latitude</div>
            <input
              name="lat"
              value={lat}
              onChange={(event) => {
                fetcher.submit(event.target.form);
                setLat(event.target.value);
              }}
              placeholder="Latitude"
              autoFocus={true}
              className="py-2 px-2 bg-white text-black rounded-md"
            />
          </div>
          <div className="m-4">
            <div className="mb-2">Longitude</div>
            <input
              name="lon"
              value={lon}
              onChange={(event) => {
                // fetcher.submit(event.target.form);
                setLon(event.target.value);
              }}
              placeholder="Longitude"
              className="py-2 px-2 bg-white text-black rounded-md"
            />
          </div>
          <button
            onClick={(event) => {
              if (ref.current) {
                fetcher.submit(ref.current);
              }
            }}
          >
            Search
          </button>
        </fetcher.Form>
      </div>
      <div>{lat}</div>
      <div>{lon}</div>
      <div className="flex flex-col">
        {data.map((user) => (
          <div className="flex flex-row space-x-8 text-left " key={user.id}>
            <div> {user.id} </div>
            <div> {user.meta.name} </div>
            <div> {user.meta.geo.lat} </div>
            <div> {user.meta.geo.lon} </div>
            <div> {user.meta.win} </div>
          </div>
        ))}
      </div>
    </div>
  );
}
