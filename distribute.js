hosts = scan(getHostname());
target = args[0];
size = 2.48;// Size of hacking script
file = 'hack1.script'; // Name of hacking script
max = getServerMaxMoney(target);
mt = max * 0.9; // Money threshold, servers below this will be grown
st = Math.min(getServerBaseSecurityLevel(target) / 3) + 2; // Security threshold, servers above this will be weakened
 while(true) {
  hackLvl = getHackingLevel();
  for(i = 0; i < hosts.length; i++) {
    s = hosts[i];
    print("---------------------------------------------------------------");
    print("Checking " + s);
    mem = getServerRam(s);
    
    if (fileExists(file, s) === true
        && isRunning(file, s, target, mt, st) === true){
            print("Script is already running with those parameters on this server!");
            print("---------------------------------------------------------------");
        }else{
            if ( // If hackable and not encountered yet, root it
      hasRootAccess(s) === false
      && getServerRequiredHackingLevel(s) <= hackLvl
      && s != 'darkweb' && max >= mt && s != "home"
    ) {
      ports = 0;
      if (fileExists('BruteSSH.exe', 'home')) {
        brutessh(s);
        ++ports;
      }
      if (fileExists('FTPCrack.exe', 'home')) {
        ftpcrack(s);
        ++ports;
      }
      if (fileExists('relaySMTP.exe', 'home')) {
        relaysmtp(s);
        ++ports;
      }
      if (fileExists('HTTPWorm.exe', 'home')) {
        httpworm(s);
        ++ports;
      }
      if (fileExists('SQLInject.exe', 'home')) {
        sqlinject(s);
        ++ports;
      }
      if (ports >= getServerNumPortsRequired(s)) {
        nuke(s);
      }
    }
    if (hasRootAccess(s) === true && max >= mt) {
      // drop hack file and run it with t threads
      free = mem[0] - mem[1];
      t = Math.floor((free / size));
      if (s === 'home'){
          t = t * 0.7;
      }
      if (t === 0) {
          
      }else{
        if (
            fileExists(file, s) === false
            // Si el archivo no existe en el servidor, copiarlo y ejecutarlo
        ) {
            scp(file, s);
            exec(file, s, t, target, mt, st);
        } else if (
            // Si el archivo existe, pero no esta siendo ejecutado con los parametros que queremos, volverlo a ejecutar
            fileExists(file, s) === true
            && isRunning(file, s, target, mt, st) === false
        ) {
            exec(file, s, t, target, mt, st);
        }
        
      }
    }
            
        }
    
    
    // Scan for servers on current host and add them to array
    print("Scanning for servers on current host add them to array");
    sHosts = scan(s);
    print("---------------------------------------------------------------");
    for(j = 0; j < sHosts.length; j++) {
      if (hosts.indexOf(sHosts[j]) == -1) {
        hosts.push(sHosts[j]);
      }
    }
  }
}