export default async function main(ns) {
  const host = ns.getHostname();
  const hosts = ns.scan(host);
  const target = ns.args[0];

  const SIZE = 2.48;
  const FILE = 'hack1.script';
  const max = ns.getServerMaxMoney(target);
  const mt = max * 0.9;
  const st = Math.min(ns.getServerBaseSecurityLevel(target) / 3) + 2;

  while (true) {
    const hackLvl = ns.getHackingLevel();
    for (let i = 0; i < hosts.length; i++) {
      const s = hosts[i];
      const mem = ns.getServerRam(s);

      if (ns.fileExists(FILE, s) === true
        && ns.isRunning(FILE, s, target, mt, st) === true) {
      } else {
        if ( // If hackable and not encountered yet, root it
          ns.hasRootAccess(s) === false
          && ns.getServerRequiredHackingLevel(s) <= hackLvl
          && s != 'darkweb' && max >= mt && s != "home"
        ) {
          let ports = 0;
          if (ns.fileExists('BruteSSH.exe', 'home')) {
            ns.brutessh(s);
            ++ports;
          }
          if (ns.fileExists('FTPCrack.exe', 'home')) {
            ns.ftpcrack(s);
            ++ports;
          }
          if (ns.fileExists('relaySMTP.exe', 'home')) {
            ns.relaysmtp(s);
            ++ports;
          }
          if (ns.fileExists('HTTPWorm.exe', 'home')) {
            ns.httpworm(s);
            ++ports;
          }
          if (ns.fileExists('SQLInject.exe', 'home')) {
            ns.sqlinject(s);
            ++ports;
          }
          if (ports >= ns.getServerNumPortsRequired(s)) {
            ns.nuke(s);
          }
        }
        if (ns.hasRootAccess(s) === true && max >= mt) {
          const free = mem[0] - mem[1];
          let t = Math.floor((free / SIZE));
          if (s === 'home') {
            t *= 0.7;
          }
          if (!t < 1) {
            if (
              ns.fileExists(FILE, s) === false
            ) {
              ns.scp(FILE, s);
              await ns.exec(FILE, s, t, target, mt, st);
            } else if (
              ns.fileExists(FILE, s) === true
              && ns.isRunning(FILE, s, target, mt, st) === false
            ) {
              await ns.exec(FILE, s, t, target, mt, st);
            }
          }
        }
      }
      const sHosts = ns.scan(s);
      for (let j = 0; j < sHosts.length; j++) {
        if (hosts.indexOf(sHosts[j]) == -1) {
          hosts.push(sHosts[j]);
        }
      }
    }
    await ns.sleep(100);
  }
}