// ***   SETTINGS *** //
var RAM_VALUE = 50000;
var TO_UPGRADE = 50000000;

var minRam = 64;
var maxRam = 256;
// var maxRam = 4096;
// var maxRam = 16384;
// var maxRam = 65536;
var upgradeFactor = 4;
var namePrefix = 'HackServer';
// ** PORT ** //
var rport = 10;

async function getTargets(ns) {
  let target;
  let doLoop = true;
  while (doLoop) {
    target = ns.read(rport);
    if (target !== 'NULL PORT DATA') {
      doLoop = false;
    }
    await ns.sleep(100);
  }
  return target;
}

const assignment = (a, b) => {
  const assignments = [];
  const counter = Math.max([a.length, b.length]);
  for (let i = 0; i < counter; i++) {
    assignments.push(a[i], b[i]);
  }
  return assignments;
};

const getHackers = ns => ns.getPurchasedServers().unshift('home');

export async function executeHacks(ns, servers) {
  for (const s of servers) {
    if (!ns.isRunning('hack_target.script', s[0], s[1])) {
      await ns.killall(s[0]);
    }
    await ns.exec('hack_target.script', s[0], 1, s[1]);
    await ns.sleep(100);
  }
}

export async function executeHack(ns, pair) {
  await ns.exec('hack_target.script', pair[0], 1, pair[1]);
}

const getMoney = (ns) => {
  return ns.getServerMoneyAvailable('home');
};


export async function buyServers(ns, servers, targets) {
  for (let s of servers) {
    let bought = false;
    while (!bought) {
      ns.print('Trying to buy a server');
      if (getMoney > (minRam * RAM_VALUE)) {
        const sname = namePrefix + servers.length;
        ns.purchaseServer(sname, minRam);
        copyHack(ns, sname);
        if (!targets.length < servers.length + 1) {
          await executeHack(servers[servers.length - 1]);
        }
        bought = true;
      }
    }
  }
}

const copyHack = (ns, s) => {
  const hackFiles = ['hack_target.script', 'hack.script', 'weaken.script', 'grow.script'];
  ns.scp(hackFiles, 'home', s);
};

export async function upgradeServer(ns, s, paired) {
  const oldRam = ns.getServerRam(s)[0];
  const newRam = oldRam * upgradeFactor;
  if (getMoney(ns) > (newRam * RAM_VALUE)) {
    await ns.killall(s);
    await ns.sleep(1000);
    ns.deleteServer(s);
    ns.purchaseServer(s, newRam);
    copyHack(ns, s);
    for (let pair of paired) {
      if (pair[0] === s) {
        await executeHack(ns, pair);
      }
    }
  }
}

export async function main(ns) {
  while (true) {
    const targets = getTargets(ns);
    const hackers = getHackers(ns);
    const paired = assignment(hackers, targets);
    executeHacks(ns, paired);
    if (targets.length > hackers.length) {
      buyServers(ns, hackers, targets);
    } else {
      ns.print('Server limit reached');
      let toUpgrade = TO_UPGRADE;
      ns.getPurchasedServers().forEach((s) => {
        if (ns.getServerRam(s)[0] < toUpgrade) {
          toUpgrade = ns.getServerRam(s)[0];
        }
      });

      if (toUpgrade === maxRam) {
        ns.print('All Servers have maximum ram');
        break;
      } else {
        ns.print('Upgrading servers...');
        ns.getPurchasedServers().forEach((s) => {
          if (ns.getServerRam(s)[0] === toUpgrade) {
            upgradeServer(ns, s, paired);
          }
        })
      }

    }
    await ns.sleep(1000);
  }

  while (true) {
    ns.print('Keeping hacking servers on target');
    const targets = getTargets();
    const hackers = getHackers();
    const paired = assignment(hackers, targets);
    await executeHacks(ns, paired);
    await ns.sleep(1000);
  }

};