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
  for (let i = 0; i < assigned.length; i++) {
    if (!ns.isRunning('hackTarget.ns', assigned[i].server, assigned[i].target)) {
      ns.killall(assigned[i].server);
      await ns.sleep(10000);
      copyHacks(ns, assigned[i].server);
      await ns.exec('hackTarget.ns', assigned[i].server, 1, assigned[i].target);
      ns.print(`Launching Hack on ${assigned[i].server} targeting ${assigned[i].target}`)
    }
  }
}

async function buyServer(ns, num) {
  while (true) {
    if (getMoney(ns) > (minRam * RAM_VALUE)) {
      const sname = `${namePrefix} - ${num}`;
      ns.purchaseServer(sname, minRam);
      ns.print(`Purchasing ${sname}`);
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
  for (let i = 0; i < filtered.length; i++) {
    if (getMoney(ns) > newRam * RAM_VALUE) {
      ns.killall(filtered[i]);
      await ns.sleep(10000);
      ns.deleteServer(filtered[i]);
      ns.print(`Upgrading ${filtered[i]} from ${ram} to ${newRam} `)
      ns.purchaseServer(filtered[i], newRam);
      // Buy just one server at a time
      break;
    } else {
      ns.print(`Not enough money to upgrade ${filtered[i]}, required ${newRam * RAM_VALUE} `);
    }
  }
}

async function getTargets(ns) {
  while (ns.peek(rport) === 'NULL PORT DATA') {
    // Throw out all empty values
    ns.read(rport);
    await ns.sleep(150);
  }
  const targets = ns.read(rport);
  return targets;
};

export async function main(ns) {
  // Disabling anoying loggins
  ns.disableLog('disableLog');
  ns.disableLog('sleep');
  ns.disableLog('scp');
  ns.disableLog('getServerMoneyAvailable');
  ns.disableLog('getServerRam');
  ns.disableLog('killall');
  ns.disableLog('exec');
  ns.disableLog('purchaseServer');
  ns.disableLog('deleteServer');
  while (true) {
    const servers = ns.getPurchasedServers().sort()
    const targets = await getTargets(ns);
    const assigned = assign(servers, targets);
    ns.print(`Got ${servers.length} servers and ${targets.length} targets`);
    await executeHacks(ns, assigned);
    if (targets.length > servers.length && servers.length < 25) {
      ns.print(`Buying server N° ${servers.length} `);
      await buyServer(ns, servers.length);
      continue;
    }

    const smallest = getSmallestServer(ns);
    if (smallest < maxRam) {
      ns.print(`Upgrading servers with ${smallest} ram`);
      await upgradeServer(ns, smallest);
      continue;
    }
    await ns.sleep(150);
  }
}
