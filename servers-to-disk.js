const getServerValue = (ns, s) => {
    const maxMoney = ns.getServerMaxMoney(s);
    const reqHackingLevel = ns.getServerRequiredHackingLevel(s);
    const ports = ns.getServerNumPortsRequired(s);
    const minSecurity = ns.getServerMinSecurityLevel(s);
    const growthRate = ns.getServerGrowth(s);
    const value = Math.ceil((maxMoney * (100 / minSecurity) * growthRate) / 10000);
    return [value, reqHackingLevel, ports, s];
};

const getServerData = (ns, s) => {
    const servers = s.map((server) => {
        return getServerValue(ns, server);
    });
    return servers.filter(server => server[0] > 0);
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

export async function main(ns) {
    const serverScan = getServerNames(ns);
    const servers = getServerData(ns, serverScan);
    const sortedServers = sortServers(servers);
    ns.write('servers-info.txt', sortedServers, 'w');
}