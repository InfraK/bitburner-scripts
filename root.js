export async function main(ns) {
  const s = ns.args[0];
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