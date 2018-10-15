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

const getAllServers = ns => {
  const aPorts = getPortsAvailable(ns);

  const localhost = ns.getHostname();
  const hosts = ns.scan(localhost);
  let done = false;
  while (!done) {
    done = true;
    hosts.forEach(s => {
      const connections = ns.scan(s);
      connections.forEach(c => {
        if (!hosts.includes(c)) {
          done = false;
          hosts.push(c);
        }
      });
    });
  }
  const filtered = hosts
    .filter(s => {
      return ns.getServerNumPortsRequired(s) <= aPorts;
    })
    .filter(s => !s.match(/HackServer/g))
    .filter(s => !s.match(/home/g))
    .filter(s => !s.match(/darkweb/g))
    .filter(s => !s.match(/fulcrumassets/g));
  return filtered;
};

export async function main(ns) {
  const target = ns.args[0];

  const SIZE = 2.48;
  const FILE = 'hackLoop.ns';
  const max = ns.getServerMaxMoney(target);
  const mt = max * 0.9;
  const st = Math.min(ns.getServerBaseSecurityLevel(target) / 3) + 2;
  while (true) {
    const servers = getAllServers(ns);
    rootServers(ns, servers);
    for (let i = 0; i < servers.length; i++) {
      const s = servers[i];
      const mem = ns.getServerRam(s);

      if (
        !(
          ns.fileExists(FILE, s) === true &&
          ns.isRunning(FILE, s, target, mt, st) === true
        )
      ) {
        if (ns.hasRootAccess(s) === true && max >= mt) {
          const free = mem[0] - mem[1];
          const t = Math.floor(free / SIZE);
          if (t > 1) {
            if (ns.fileExists(FILE, s) === false) {
              ns.scp(FILE, s);
              await ns.exec(FILE, s, t, target, mt, st);
            } else if (
              ns.fileExists(FILE, s) === true &&
              ns.isRunning(FILE, s, target, mt, st) === false
            ) {
              await ns.exec(FILE, s, t, target, mt, st);
            }
          }
        }
      }
    }
    await ns.sleep(150);
  }
}
