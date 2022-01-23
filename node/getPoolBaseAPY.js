import fetch from "node-fetch";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "process";

const rl = readline.createInterface({ input, output });

const GRAPH_ENDPOINT =
  "https://api.thegraph.com/subgraphs/name/convex-community/curve-factory-volume";

async function main(pool) {
  const APY_QUERY = `
{
  dailyPoolSnapshots(first: 1000, 
                   orderBy: timestamp, 
                   orderDirection: desc, 
                   where: 
                   {pool: "${pool.toLowerCase()}"})
  {
    baseApr
    virtualPrice
    timestamp
  }
}
`;

  const res = await fetch(GRAPH_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: APY_QUERY }),
  });

  let data = await res.json();
  data = data.data;
  const snapshots = data.dailyPoolSnapshots.map((a) => ({
    baseApr: +a.baseApr,
    virtualPrice: +a.virtualPrice,
    timestamp: a.timestamp,
  }));

  if (snapshots.length < 2) {
    console.log("Not enough data");
    return;
  }
  const latestDailyApy = ((snapshots[0].baseApr + 1) ** 365 - 1) * 100;
  const days = 7;
  const latestApyDailyRollingAverage =
    ((snapshots.slice(0, days).reduce((p, c) => p + c.baseApr, 0) / days + 1) **
      365 -
      1) *
    100;
  console.log(`APY (Latest daily data): ${latestDailyApy.toFixed(2)}%`);
  console.log(
    `APY (up to 7 day rolling avg): ${latestApyDailyRollingAverage.toFixed(2)}%`
  );

  if (snapshots.length > 6) {
    const latestWeeklyRate =
      (snapshots[0].virtualPrice - snapshots[6].virtualPrice) /
      snapshots[0].virtualPrice;
    const latestWeeklyApy = ((latestWeeklyRate + 1) ** 52 - 1) * 100;
    console.log(`APY (Latest weekly data): ${latestWeeklyApy.toFixed(2)}%`);
  }

  if (snapshots.length > 30) {
    const weeks = 4;
    const latestApyWeeklyRollingAverage =
      ((snapshots
        .slice(0, 30)
        .filter((e, i) => i % 7 == 0)
        .map((e, i, a) =>
          i < a.length - 1
            ? (e.virtualPrice - a[i + 1].virtualPrice) / a[i + 1].virtualPrice
            : 0
        )
        .slice(0, weeks)
        .reduce((p, c) => p + c, 0) /
        weeks +
        1) **
        52 -
        1) *
      100;
    console.log(
      `APY (4 week rolling avg): ${latestApyWeeklyRollingAverage.toFixed(2)}%`
    );
    const latestMonthlyRate =
      (snapshots[0].virtualPrice - snapshots[30].virtualPrice) /
      snapshots[0].virtualPrice;
    const latestMonthlyApy = ((latestMonthlyRate + 1) ** 12 - 1) * 100;
    console.log(`APY (Latest monthly data): ${latestMonthlyApy.toFixed(2)}%`);
  }

  const totalAverageDailyApy =
    ((snapshots.reduce((p, c) => p + c.baseApr, 0) / snapshots.length + 1) **
      365 -
      1) *
    100;
  console.log(`APY (Average total data): ${totalAverageDailyApy.toFixed(2)}%`);
  return;
}

const pool = await rl.question("Enter pool address: ");
await main(pool);
process.exit();
