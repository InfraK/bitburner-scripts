const getBestCrime = (ns) => {
  const crimes = ['shoplift', 'mug', 'traffick arms', 'kidnap', 'assassinate', 'heist'];
  let bestCrime = crimes[0];
  for (let crime of crimes) {
    if (ns.getCrimeChance(crime) === 1) {
      bestCrime = crime;
    }
  }
  return bestCrime;
}

export async function main(ns) {
  let counter = 0;
  while (true) {
    while (!ns.isBusy()) {
      ns.commitCrime(getBestCrime(ns));
      counter++;
    }
    if (counter === 20) {
      await ns.sleep(10000);
      counter = 0;
    }
    await ns.sleep(300);
  }
}
