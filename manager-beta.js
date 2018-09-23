
// ***   SETTINGS *** //
const RAM_VALUE = 50000;

const minRam = 64;
// const maxRam = 256;
// const maxRam = 4096;
const maxRam = 16384;
// const maxRam = 65536;
const upgradeFactor = 4;
const namePrefix = 'HackServer';
// ** PORT ** //
const rport = 10;
const hackFiles = ['hackTarget.ns', 'hack.script', 'weaken.script', 'grow.script'];

export const getMoney = ns => ns.getServerMoneyAvailable('home');

const copyHacks = (ns, s) => {
  ns.scp(hackFiles, 'home', s);
};

const assign = (servers, targets) => {
  const assignments = [];
  const counter = Math.min(servers.length, targets.length);
  for (let i = 0; i < counter; i++) {
    assignments.push({
      server: servers[i],
      target: targets[i],
    });
  }
  return assignments;
};


async function executeHacks(ns, assigned) {
  for (let pair of assigned) {
    if (!ns.isRunning('hackTarget.ns', pair.server, pair.target)) {
      ns.killall(pair.server);
      await ns.sleep(15000);
      copyHacks(ns, pair.server);
      await ns.exec('hackTarget.ns', pair.server, 1, pair.target);
    }
  }
}

async function buyServer(ns, num) {
  while (true) {
    if (getMoney(ns) > (minRam * RAM_VALUE)) {
      const sname = namePrefix + '-' + num;
      ns.purchaseServer(sname, minRam);
      break;
    }
    await ns.sleep(500);
  }
}

const getSmallestServer = (ns) => {
  const servers = ns.getPurchasedServers();
  let lowest = 5000000000;
  for (let i = 0; i < servers.length; i++) {
    const svRam = ns.getServerRam(servers[i])[0];
    if (svRam < lowest) {
      lowest = svRam;
    }
  }
  return lowest;
};

async function upgradeServer(ns, ram) {
  // Find the servers with the desired RAM
  const servers = ns.getPurchasedServers();
  const filtered = servers.filter(s => ns.getServerRam(s)[0] === ram);
  const newRam = ram * upgradeFactor;
  for (let server of filtered) {
    if (getMoney(ns) > newRam * RAM_VALUE) {
      ns.killall(server);
      await ns.sleep(15000);
      ns.deleteServer(server);
      ns.purchaseServer(server, newRam);
    } else {
      ns.print(`Not enough money to upgrade ${server}, required ${newRam * RAM_VALUE}`);
    }
  }
}

export async function main(ns) {
  // Disabling anoying loggins
  ns.disableLog('sleep');
  ns.disableLog('scp');
  ns.disableLog('getServerMoneyAvailable');
  ns.disableLog('getServerRam');
  ns.disableLog('killall');
  while (true) {
    const servers = ns.getPurchasedServers();
    const targets = ns.read(rport);
    const assigned = assign(servers, targets);

    await executeHacks(ns, assigned);
    if (!servers.length >= targets.length) {
      ns.print(`Buying server N° ${servers.length}`);
      buyServer(ns, servers.length);
      await ns.sleep(10000);
      continue;
    }

    const smallest = getSmallestServer(ns);
    if (smallest < maxRam) {
      ns.print(`Upgrading servers with ${smallest} ram`);
      upgradeServer(ns, smallest);
      await ns.sleep(10000);
      continue;
    }
    await ns.sleep(10000);
  }
}
