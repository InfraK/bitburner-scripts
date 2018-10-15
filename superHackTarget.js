const getServerNames = ns => {
  const scanArray = ns.scan(ns.getHostname());
  for (let i = 0; i < scanArray.length; i++) {
    const s = scanArray[i];
    const sHosts = ns.scan(s);
    for (let j = 0; j < sHosts.length; j++) {
      if (scanArray.indexOf(sHosts[j]) === -1) {
        scanArray.push(sHosts[j]);
      }
    }
  }
  return scanArray;
};

const getPortsAvailable = ns => {
  const portBusters = [
    'BruteSSH.exe',
    'FTPCrack.exe',
    'relaySMTP.exe',
    'HTTPWorm.exe',
    'SQLInject.exe',
  ];
  let ports = 0;
  for (let i = 0; i < portBusters.length; i++) {
    if (ns.fileExists(portBusters[i]) === true) {
      ports++;
    }
  }
  return ports;
};

const getHackableServers = (ns, servers) => {
  const aPorts = getPortsAvailable(ns);
  const hLevel = ns.getHackingLevel() * 0.9;

  const filtered = servers
    .filter(s => {
      return (
        ns.getServerRequiredHackingLevel(s) < hLevel &&
        ns.getServerNumPortsRequired(s) <= aPorts
      );
    })
    .filter(s => !s.match(/HackServer/g))
    .filter(s => !s.match(/home/g))
    .filter(s => !s.match(/darkweb/g))
    .filter(s => !s.match(/fulcrumassets/g));
  return filtered;
};

const rootServers = (ns, servers) => {
  servers.forEach(s => {
    if (ns.hasRootAccess(s)) return;
    if (ns.fileExists('BruteSSH.exe')) ns.brutessh(s);
    if (ns.fileExists('FTPCrack.exe')) ns.ftpcrack(s);
    if (ns.fileExists('relaySMTP.exe')) ns.relaysmtp(s);
    if (ns.fileExists('HTTPWorm.exe')) ns.httpworm(s);
    if (ns.fileExists('SQLInject.exe')) ns.sqlinject(s);
    ns.nuke(s);
  });
};

export async function main(ns) {
  const servers = getServerNames(ns);
  let loop = true;
  while (loop) {
    [loop] = ns.args;
    const hackableServers = getHackableServers(ns, servers);
    rootServers(ns, hackableServers);
    for (let index = 0; index < hackableServers.length; index++) {
      const s = hackableServers[index];
      await ns.exec('hackTarget.ns', 'home', 1, s);
    }
    await ns.sleep(250);
  }
}
