import fetch from "node-fetch"

const GRAPH_ENDPOINT = "https://api.thegraph.com/subgraphs/name/convex-community/curve-factory-volume"
const POOL_QUERY = `
{
    pools(first:1000) {
    id
    name
    symbol
    metapool
    basePool
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
