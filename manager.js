function get_available_money(s){
    return getServerMoneyAvailable(s);
}
function delete_server(s){
	deleteServer(s);
}
function get_ram(s){
	return getServerRam(s);
}
function server_exists(s){
	return serverExists(s);
}
function purchase_server(sname,ram){
    while (server_exists(sname) === false){
	    purchaseServer(sname,ram);
    }
}
function copy_hack(s){
	hackfiles = ['hack_target.script', 'hack.script', 'weaken.script', 'grow.script'];
	scp (hackfiles, 'home', s);
}
function get_purchased_servers(){
	return getPurchasedServers();
}
function get_targets(){
	doLoop = true;
	while(doLoop){
		target = read(rport);
		if (target != "NULL PORT DATA"){
			doLoop = false;
		}
	}
	return target;
}
function get_hackers(){
	hackers = get_purchased_servers();
	hackers.unshift('home');
	return hackers; 
}
function assignment(a,b){
	assignments = [];
	counter = 0;
	if (a.length > b.length){
		counter = b.length;
	}else{
		counter = a.length;
	}
	for(i = 0; i < counter; i++){
		assignments.push([a[i],b[i]]);
	}
	return assignments;
}
function assign(paired,pos){
    print('Pos'+pos);
    pos = pos -1;
    print('Pos -1'+ pos);
    print('Error invalid index???');
	paired.push([hackers[pos],targets[pos]]);

	return paired;
}
function execute_hacks(a){
	for(i = 0; i < paired.length; i++){
		if (!isRunning('hack_target.script', a[i][0], a[i][1])){
			if (a[i][0]=== 'home'){
			scriptKill('hack_target.script', 'home');   
			}else{
			killall(a[i][0]);
			}
			sleep(5000);
			exec('hack_target.script', a[i][0], 1, a[i][1]);
		}
	}
}
function execute_hack(a){
	exec('hack_target.script', a[0], 1, a[1]);
}

/*function upgrade_server(s){
	oldRam = get_ram(s)[0];
	newRam = oldRam * upgradeFactor;
	doLoop = true;
	while (doLoop){
	    print('trying to upgrade server');
		if(get_available_money('home') > (newRam *50000)){
			killall(s);
			sleep(5000);
			delete_server(s);
			purchase_server(s,newRam);
			copy_hack(s);
			for (i=0; i < paired.length; i++){
				if (paired[i][0] === s){
					execute_hack(paired[i]);
				}
			}
			doLoop = false;
		}
	}
}
*/

function upgrade_server(s){
	oldRam = get_ram(s)[0];
	newRam = oldRam * upgradeFactor;
	print('trying to upgrade server');
	if(get_available_money('home') > (newRam *50000)){
		killall(s);
		sleep(5000);
		delete_server(s);
		purchase_server(s,newRam);
		copy_hack(s);
		for (i=0; i < paired.length; i++){
			if (paired[i][0] === s){
				execute_hack(paired[i]);
			}
		}
	}
}

function buy_servers() {
	for (i = purchasedServer.length; i < 25; i++){
		doLoop = true;
		while (doLoop){
		    print('trying to buy a server');
			if (get_available_money('home') > (minRam *50000)){
			    purchasedServer = get_purchased_servers();
				sname = namePrefix+purchasedServer.length;
				purchase_server(sname,minRam);
				copy_hack(sname);
				hackers.push(sname);
				if (targets.length < hackers.length){
				}else{
				paired = assign(paired, hackers.length);
				execute_hack(paired[hackers.length -1]);
				}
				
				doLoop = false;
			}
		}
	}
}

///***   SETTINGS ***///
minRam = 64;
//maxRam = 65536;
//maxRam = 256;
maxRam = 4096;
//maxRam = 16384;
upgradeFactor = 4;
namePrefix = 'HackServer';
//** PORT **//
rport = 10;
//** Start of the script **//

while(true){
	print('Adding to array already existing servers');
	purchasedServer = get_purchased_servers();
	print('We have ' + purchasedServer.length);
	print('Aquiring targets');
	targets = get_targets();
	print('Aquiring hacking servers');
	hackers = get_hackers();
	print('Assigning hackers their target');
	paired = assignment(hackers,targets);
	print('Executing Hacking script');
	execute_hacks(paired);

	if (targets.length > hackers.length){
		print('Buying remaining servers');
		buy_servers();
	}else{
		print('Server limit reached... Checking for servers to upgrade');
		toUpgrade = 50000000;
		purchasedServers = get_purchased_servers();
		for (i = 0; i < purchasedServers.length; i++){
			if (get_ram(purchasedServers[i])[0] < toUpgrade){
			    toUpgrade = get_ram(purchasedServers[i])[0];
			}
		}
		print('The lowest ram between the servers is ' +toUpgrade);
		if (toUpgrade === maxRam){
		    print ('All servers have maximum ram, proceeding to only update targets');
		    break;
		}else{
			print('Upgrading servers of '+toUpgrade+' ram');
			for (i = 0; i < purchasedServers.length; i++){
				if(get_ram(purchasedServers[i])[0] === toUpgrade){
		           upgrade_server(purchasedServers[i]);
				}
			}
		}
	}
}

while(true){
	print('Keeping hacking servers on target');
	targets = get_targets();
	hackers = get_hackers();
	paired = assignment(hackers,targets);
	execute_hacks(paired);
}