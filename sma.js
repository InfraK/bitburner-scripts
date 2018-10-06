export async function main(ns) {
  const sym = ns.args[0];
  const sampleSize = ns.args[1];
  const outPort = ns.args[2];

  const prices = [];
  let sum = 0;
  let lastPrice = -1;

  while (true) {
    const price = ns.getStockPrice(sym);
    if (price !== lastPrice) {
      prices.push(price);
      sum += price;
      if (prices.length > sampleSize) {
        sum -= prices.shift();
        ns.write(outPort, sum / sampleSize);
        ns.print(sum / sampleSize);
      }
      lastPrice = price;
    }
    await ns.sleep(50);
  }
}
