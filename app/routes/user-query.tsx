import { QdrantClient } from "@qdrant/js-client-rest";
import { json, LoaderFunctionArgs } from "@remix-run/node";

export type PlayerMeta = {
  geo: Geo
  name: string
}

export type PlayerRef = {
  id: number
  meta: PlayerMeta
}

export type Geo = {
  lat: number;
  lon: number;
};

const noobId = 6
const masterId = 5

export const queryPlayers = async (geo: Geo) => {
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
  return results.map(item => ({ id: item.id as number, meta: item.payload as PlayerMeta }))
}

export async function loader({
  request,
}: LoaderFunctionArgs) {
  let results: PlayerRef[]
  try {
    const url = new URL(request.url);
    const lat = Number(url.searchParams.get("lat")!)
    const lon = Number(url.searchParams.get("lon")!)
    const geo = {
      "lat": lat,
      "lon": lon
    }
    results = await queryPlayers(geo)
  } catch {
    results = []
  }
  return json(results)
}
