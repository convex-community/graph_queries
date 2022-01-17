import fetch from "node-fetch"

const GRAPH_ENDPOINT = "https://api.thegraph.com/subgraphs/name/convex-community/curve-factory-volume"
const POOL_ADDR = "0xfd5db7463a3ab53fd211b4af195c5bccc1a03890"
const CURRENT_TIMESTAMP = Math.round(new Date().getTime() / 1000);
const TIMESTAMP_24H_AGO = CURRENT_TIMESTAMP - (24 * 3600);

const POOL_QUERY = `
{
  hourlySwapVolumeSnapshots(
    first: 1000, 
    orderBy: timestamp, 
    orderDirection: desc, 
    where: {
      pool: "${POOL_ADDR}"
      timestamp_gt: ${TIMESTAMP_24H_AGO}
    }
  )
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
    let rollingDaySummedVolume = 0
    for (let i = 0; i < data.data.hourlySwapVolumeSnapshots.length; i ++) {
        const hourlyVolUSD = parseFloat(data.data.hourlySwapVolumeSnapshots[i].volumeUSD)
        rollingDaySummedVolume =  rollingDaySummedVolume + hourlyVolUSD
    }
    console.log(`Past 24 Hour volume for pool ${POOL_ADDR}: ${rollingDaySummedVolume} USD.`)
}

main()
