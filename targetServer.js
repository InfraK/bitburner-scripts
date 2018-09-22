const getServerValue = (ns, s) => {
    const maxMoney = ns.getServerMaxMoney(s);
    const reqHackingLevel = ns.getServerRequiredHackingLevel(s);
    const ports = ns.getServerNumPortsRequired(s);
    const minSecurity = ns.getServerMinSecurityLevel(s);
    const growthRate = ns.getServerGrowth(s);
    const value = Math.ceil((maxMoney * (100 / minSecurity) * growthRate) / 10000);
    return {
        value,
        reqHackingLevel,
        ports,
        name: s,
    };
};

const getServerData = (ns, s) => {
    const servers = s.map((server) => {
        return getServerValue(ns, server);
    });
    return servers.filter(server => server.value > 0 && server.name !== 'home');
};


const getServerNames = (ns) => {
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

const sortServers = servers => servers.sort((a, b) => a.value > b.value ? 1 : -1);

const getSortedServers = (ns) => {
    const serverScan = getServerNames(ns);
    const servers = getServerData(ns, serverScan);
    return sortServers(servers);
}

const getPortsAvailable = (ns) => {
    const portBusters = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'HTTPWorm.exe', 'SQLInject.exe'];
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

    return servers.filter(s => s.reqHackingLevel < hLevel && s.ports <= aPorts);
};

const rootServers = (ns, servers) => {
    servers.forEach((s) => {
        if (ns.hasRootAccess(s.name)) return;
        if (ns.fileExists('BruteSSH.exe')) ns.brutessh(s.name);
        if (ns.fileExists('FTPCrack.exe')) ns.ftpcrack(s.name);
        if (ns.fileExists('relaySMTP.exe')) ns.relaysmtp(s.name);
        if (ns.fileExists('HTTPWorm.exe')) ns.httpworm(s.name);
        if (ns.fileExists('SQLInject.exe')) ns.sqlinject(s.name);
        ns.nuke(s.name);
    });
};

const getBestTargets = (s) => {
    const targets = [];
    for (let i = s.length - 1; i > 0; i--) {
        targets.push(s[i].name);
        if (targets.length === 26) break;
    }
    return targets;
};

export async function main(ns) {
    let first = true;
    const servers = getSortedServers(ns);
    const port = 10;
    ns.clear(port);
    while (true) {
        const hackableServers = getHackableServers(ns, servers);
        // Rooting the hackableServers
        rootServers(ns, hackableServers);
        const targets = getBestTargets(hackableServers);
        ns.write(port, targets);

        await ns.sleep(1000);

        if (first) {
            await ns.run('manager.ns')
            first = false;
        }
    }
}