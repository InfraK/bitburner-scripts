export async function main(ns) {
  const [sym, sampleSize, smaPort] = ns.args;

  // let shortPos = false;
  let longPos = false;

  const COM = 100000;

  await ns.run('sma.ns', 1, sym, sampleSize, smaPort);

  await ns.sleep((sampleSize + 5) * 6000);

  const smas = [];
  let money = 0;
  while (true) {
    money = ns.getServerMoneyAvailable('home') * 0.5;
    const sma = ns.read(smaPort);
    if (sma != 'NULL PORT DATA') {
      smas.push(sma);
      if (smas.length > sampleSize) {
        smas.shift();
        // Only Execute trading if sma is full
        if (smas[sampleSize - 1] > smas[0]) {
          // Upwards Momentum
          const pos = ns.getStockPosition(sym);
          const stockPrice = ns.getStockPrice(sym);
          // if (shortPos) {
          //   // Get out of short position
          //   if (!ns.sellShort(sym, pos[2])) {
          //     ns.print('Error: sellshort Failed');
          //   }
          //   shortPos = false;
          // }

          if (!longPos) {
            // Enter long position
            money = ns.getServerMoneyAvailable('home') * 0.5;
            ns.buyStock(sym, Math.floor((money - COM) / stockPrice));
            longPos = true;
          }
        }
      } else {
        // Downwards momentum
        const pos = ns.getStockPosition(sym);
        const stockPrice = ns.getStockPrice(sym);
        if (longPos) {
          // Get out of long position
          if (!ns.sellStock(sym, pos[0])) {
            ns.print('Error: SellStock Failed');
          }
          longPos = false;
        }

        // if (!shortPos) {
        //   // Enter short position
        //   money = ns.getServerMoneyAvailable('home') * 0.5;
        //   ns.shortStock(sym, Math.floor((money - COM) / stockPrice));
        //   shortPos = true;
        // }
      }
    }
    await ns.sleep(200);
  }
}
