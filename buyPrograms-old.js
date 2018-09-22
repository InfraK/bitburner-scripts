function get_available_money(s){
    return getServerMoneyAvailable(s);
}

function file_exists(s){
    return fileExists(s);
}
function purchase_program(s){
    return purchaseProgram(s);
}
function buy_tor(){
    if (get_available_money('home') > 200000){
        purchaseTor();
    }
}
function get_ports_programs(){
    portBusters = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'HTTPWorm.exe', 'SQLInject.exe'];
    ports = 0;
    for(i=0; i < portBusters.length; i++){
        if(file_exists(portBusters[i]) === true){
                ports++;
        }
    }
    return ports;
}
function buy_programs(){
    
    portBusters = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'HTTPWorm.exe', 'SQLInject.exe'];
    cost = [500000,1500000,5000000,30000000,250000000]
    for(i=0; i < portBusters.length; i++){
        money = get_available_money('home');
        if(file_exists(portBusters[i]) === false && money > cost[i]){
                purchase_program(portBusters[i]);
        }
    }
}
doLoop = true;
while(doLoop){
    if (get_available_money('home') > 200000){
        buy_tor();
        doLoop = false;
    }else{
        doLoop = true;
    }
}

while (get_ports_programs() != 5){
    buy_programs();
}