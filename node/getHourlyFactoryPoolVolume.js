import fetch from "node-fetch"

const GRAPH_ENDPOINT = "https://api.thegraph.com/subgraphs/name/convex-community/curve-factory-volume"
const POOL_QUERY = `
{
  dailySwapVolumeSnapshots(first: 1000, 
                           orderBy: timestamp, 
                           orderDirection: desc, 
                           where: 
                           {pool: "0xfd5db7463a3ab53fd211b4af195c5bccc1a03890"})
  {
    volume
    volumeUSD
    timestamp
    count
  }
}
`

async function main() {
    const res = await fetch(GRAPH_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: POOL_QUERY })
    })

    const data = await res.json()
    console.log(JSON.stringify(data, null, 2))
}

main()
