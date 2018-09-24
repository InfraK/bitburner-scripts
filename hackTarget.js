// File sizes
const WEAKEN_SIZE = 1.75;
const GROW_SIZE = 1.75;
const HACK_SIZE = 1.7;

const WEAKEN = 0.05;
const getFreeRam = (ns) => {
  const ram = ns.getServerRam(ns.getHostname());
  return Math.floor(ram[0] - ram[1]);
};

async function eHack(ns, threads, data) {
  const {
    host,
    tName,
  } = data;
  await ns.exec('hack.script', host, threads, tName);
}

async function eGrow(ns, threads, data) {
  const {
    host,
    tName,
  } = data;
  await ns.exec('grow.script', host, threads, tName);
}

async function eWeaken(ns, threads, data) {
  const {
    host,
    tName,
  } = data;
  await ns.exec('weaken.script', host, threads, tName);
}

const calculateHackThreads = (ns, data) => {
  const {
    lvl,
    mults,
    bitNodeMult,
    lvlReq,
    tName,
  } = data;

  const difficultyMult = (100 - ns.getServerSecurityLevel(tName)) / 100;
  const skillMult = (lvl - (lvlReq - 1)) / lvl;
  const percentMoneyHacked = difficultyMult * skillMult * mults.money / 240;

  const perHack = percentMoneyHacked * bitNodeMult;
  const threads = Math.ceil(1 / perHack);
  const threadsAvailable = Math.floor(getFreeRam(ns) / HACK_SIZE);

  if (threads > threadsAvailable) {
    return threadsAvailable;
  }
  return threads;
};


const calculateWeakenThreads = (ns, data) => {
  const {
    tMinSecurity,
    tName,
  } = data;
  const currSecurity = ns.getServerSecurityLevel(tName);
  const threads = Math.ceil(currSecurity - tMinSecurity) / WEAKEN;
  const threadsAvailable = Math.floor(getFreeRam(ns) / WEAKEN_SIZE);
  if (threads > threadsAvailable) {
    return threadsAvailable;
  }
  return threads;
};

const calculateGrowThreads = (ns, data) => {
  const {
    tGrowth,
    tName,
    tMaxMoney,
    mults,
  } = data;

  const adjGrowthRate = 1 + (tGrowth - 1) / ns.getServerSecurityLevel(tName);
  const serverMaxGrowthRate = 1.0035;
  const growPercent = Math.min(adjGrowthRate, serverMaxGrowthRate);

  const perThread = Math.pow(growPercent, tGrowth / 100 * mults.growth);
  const var1 = tMaxMoney * Math.log(perThread);
  const lambert = Math.log(var1) - Math.log(Math.log(var1)) - Math.log(1 - Math.log(Math.log(var1)) / Math.log(var1));
  const threads = Math.ceil(lambert / Math.log(perThread));
  const threadsAvailable = Math.floor(getFreeRam(ns) / GROW_SIZE);

  if (threads > threadsAvailable) {
    return threadsAvailable;
  }
  return threads;
};

const getMoney = (ns) => {
  return ns.getServerMoneyAvailable('home');
};

const nextStep = (ns, data) => {
  const {
    tName,
    tMinSecurity,
    tMaxMoney,
  } = data;
  if (ns.getServerSecurityLevel(tName) > tMinSecurity) {
    return 'weaken';
  }
  if (getMoney(ns) < tMaxMoney) {
    return 'grow';
  }
  return 'hack';
};

const getSleepTime = (ns, data, step) => {
  switch (step) {
    case 'hack':
      return (ns.getHackTime(data.tName) + 10) * 1000;
    case 'grow':
      return (ns.getGrowTime(data.tName) + 10) * 1000;
    case 'weaken':
      return (ns.getWeakenTime(data.tName) + 10) * 1000;
  }
};

const getAutoHackThreads = (data) => {
  const {
    tMinSecurity,
    lvl,
    lvlReq,
    mults,
    bitNodeMult,
    tGrowth,
    tMaxMoney,
  } = data;

  const perHack = (100 - tMinSecurity) * ((lvl - lvlReq + 1) / lvl) / 24000 * mults.money * bitNodeMult;
  const hackThreads = Math.ceil(1 / perHack);

  const security = tMinSecurity + hackThreads * 0.002;
  const growPercent = Math.min(1 + 0.03 / security, 1.0035);
  const perGrow = Math.pow(growPercent, tGrowth / 100 * mults.growth);

  const helper = tMaxMoney * Math.log(perGrow);
  const lambert = Math.log(helper) - Math.log(Math.log(helper)) - Math.log(1 - Math.log(Math.log(helper)) / Math.log(helper));
  const growThreads = Math.ceil(lambert / Math.log(perGrow));
  // Calculate number of Weaken Threads Required
  let weakenThreads = Math.ceil((((hackThreads * 0.002) + (growThreads * 0.004)) / (0.05)));
  const maxWeakens = (100 - tMinSecurity) / (0.05);
  if (weakenThreads > maxWeakens) {
    weakenThreads = maxWeakens;
  }

  return {
    growThreads,
    hackThreads,
    weakenThreads,
  };
};

const canAutoHack = (ns, data) => {
  const {
    hackThreads,
    growThreads,
    weakenThreads,
  } = getAutoHackThreads(data);

  let totalmem = 0;
  // Add up how much memory this will use, report the value
  totalmem = (hackThreads * 1.80) + (growThreads * 1.55) + (weakenThreads * 1.55) + 6.70;

  if (getFreeRam(ns) > totalmem) {
    return true;
  }
  return false;
};

async function doHack(ns, data) {
  const threads = calculateHackThreads(ns, data);
  if (threads === 0) {
    return;
  }
  const wait = getSleepTime(ns, data, 'hack');
  await eHack(ns, threads, data);
  await ns.sleep(wait);
}

async function doGrow(ns, data) {
  const threads = calculateGrowThreads(ns, data);
  if (threads === 0) {
    return;
  }
  const wait = getSleepTime(ns, data, 'grow');
  await eGrow(ns, threads, data);
  await ns.sleep(wait);
}

async function doWeaken(ns, data) {
  const threads = calculateWeakenThreads(ns, data);
  if (threads === 0) {
    return;
  }
  const wait = getSleepTime(ns, data, 'hack');
  await eWeaken(ns, threads, data);
  await ns.sleep(wait);
}

async function doAutoHack(ns, data) {
  const {
    tName,
    tMinSecurity,
    host,
  } = data;

  const {
    hackThreads,
    growThreads,
    weakenThreads,
  } = getAutoHackThreads(data);

  const currSecurity = ns.getServerSecurityLevel(tName);
  if (currSecurity > tMinSecurity) {
    await ns.run('weaken.script', Math.ceil((currSecurity - tMinSecurity) / 0.05), tName);

    while (ns.isRunning('weaken.script', host, tName)) {
      await ns.sleep(150, false);
    }
  }

  while (true) {
    await ns.run('weaken.script', weakenThreads, tName);
    await ns.run('grow.script', growThreads, tName);
    if (ns.isRunning('hack.script', host, tName) === false) {
      await ns.run('hack.script', hackThreads, tName);
    }

    while (ns.isRunning('weaken.script', host, tName)) {
      await ns.sleep(150, false);
    }
  }


}


export async function main(ns) {

  const tName = ns.args[0];

  //* Aquiring data *//
  const bitNodeMult = 1;
  let lvl = ns.getHackingLevel();
  const lvlReq = ns.getServerRequiredHackingLevel(tName);
  const host = ns.getHostname();
  const mults = ns.getHackingMultipliers();
  const tMaxMoney = ns.getServerMaxMoney(tName);
  const tGrowth = ns.getServerGrowth(tName);
  const tMinSecurity = ns.getServerMinSecurityLevel(tName);
  // Constants
  const serverMaxGrowthRate = 1.0035;

  const data = {
    tName,
    lvl,
    lvlReq,
    host,
    mults,
    tMaxMoney,
    tGrowth,
    tMinSecurity,
    serverMaxGrowthRate,
    bitNodeMult,
  };
  // Root
  if (!ns.hasRootAccess(tName)) {
    await ns.exec('root.ns', 'home', 1, tName);
    await ns.sleep(2000);
  }

  if (canAutoHack(ns, data)) {
    await doAutoHack(ns, data);
  }

  while (true) {
    // Updating the changing hacking level
    lvl = ns.getHackingLevel();
    data.lvl = lvl;

    switch (nextStep(ns, data)) {
      case 'hack':
        await doHack(ns, data);
        break;
      case 'weaken':
        await doWeaken(ns, data);
        break;
      case 'grow':
        await doGrow(ns, data);
        break;
    }
    await ns.sleep(10000);
  }
}
