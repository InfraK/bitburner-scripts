const doBlackops = ns => {
  const blackops = ns.bladeburner.getBlackOpNames();
  blackops.forEach(b => startAction("blackops", b));
};

export async function main(ns) {
  while (true) {
    while (!ns.isBusy()) {
      doBlackops(ns);
      await ns.sleep(150);
    }
    await ns.sleep(150);
  }
}
