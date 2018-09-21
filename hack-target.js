function get_free_ram(){
    ram = getServerRam(get_hostname());
    free = ram[0] - ram[1];
    return Math.floor(free);
}
function get_hostname(){
    return getHostname();
}
function get_hacking_level(){
    return getHackingLevel();
}
function get_available_money(s){
    return getServerMoneyAvailable(s);
}
function get_security_level(s){
    return getServerSecurityLevel(s);
}

function e_hack(t){
    exec('hack.script', host, t , target);
}

function e_grow(t){
    exec('grow.script', host, t , target);
}
function e_weaken(t){
    exec('weaken.script', host, t , target);
}

function calculate_weaken_threads(){
    weaken_constant = 0.05;
    current_security = get_security_level(target);
    threads = Math.ceil(current_security - t_minsecurity) / weaken_constant;
    threads_available = Math.floor(get_free_ram() / weaken_size);
    
    //result = [threads, threads_available];
    //return result;
    
    if(threads > threads_available){
        return threads_available;
    }else{
        return threads;
    }
     
}
function calculate_grow_threads(){
    adjGrowthRate = 1 + (t_growth - 1) / get_security_level(target);
    serverMaxGrowthRate = 1.0035;
    growpercent = Math.min(adjGrowthRate, serverMaxGrowthRate);
    perthread = Math.pow(growpercent,t_growth/100 * mults.growth);
    var1 = t_maxmoney * Math.log(perthread);
    lambert = Math.log(var1)-Math.log(Math.log(var1))-Math.log(1-Math.log(Math.log(var1))/Math.log(var1));
    threads = Math.ceil(lambert/Math.log(perthread));
    threads_available = Math.floor(get_free_ram() / grow_size);
    //result = [threads, threads_available];
    //return result;
    
    if(threads > threads_available){
        return threads_available;
    }else{
        return threads;
    }
}
function calculate_hack_threads(){
    lvl = get_hacking_level();
    difficultyMult = (100 - get_security_level(target)) / 100;
    skillMult = (lvl - (lvlreq - 1)) / lvl;
    percentMoneyHacked = difficultyMult * skillMult * mults.money / 240;
    perhack = percentMoneyHacked * bitnodemult;
    threads = Math.ceil(1/perhack);
    threads_available = Math.floor(get_free_ram() / hack_size);
    //result = [threads, threads_available];
    //return result;
    
    if(threads > threads_available){
        return threads_available;
    }else{
        return threads;
    }
     
}
function next_step(){
    if(get_security_level(target) > t_minsecurity){
        return 'weaken';
    }else{
        if(get_available_money(target) < t_maxmoney){
            return 'grow';
        }else{
            return 'hack';
        }
    }
}

function calculate_sleep_time(step){
    if(step === 'hack'){
        return (getHackTime(target)+10) *1000;
    }
    if(step === 'grow'){
        return (getGrowTime(target)+10) *1000;
    }
    if(step === 'weaken'){
        return (getWeakenTime(target)+10)*1000;
    }
}
function can_autohack(){
    perhack = (100-t_minsecurity) *((lvl-lvlreq+1)/lvl) / 24000 * mults.money * bitnodemult;
    hacks = Math.ceil(1/perhack);
    //Gather Growth-related Variables
    security = t_minsecurity + hacks * 0.002;
    //Calculate number of Grow Threads Required
    growpercent = Math.min(1 + 0.03/security,1.0035);
    pergrow = Math.pow(growpercent,t_growth/100 * mults.growth);
    var1 = t_maxmoney * Math.log(pergrow);
    lambert = Math.log(var1)-Math.log(Math.log(var1))-Math.log(1-Math.log(Math.log(var1))/Math.log(var1));
    grows = Math.ceil(lambert/Math.log(pergrow));
    //Calculate number of Weaken Threads Required
    weakens = Math.ceil((((hacks * 0.002) + (grows * 0.004)) / (0.05)));
    maxweakens = (100 - t_minsecurity) / (0.05);
    if (weakens > maxweakens) {weakens = maxweakens}
    totalmem = 0;
    //Add up how much memory this will use, report the value
    totalmem = (hacks * 1.80) + (grows * 1.55) + (weakens * 1.55) + 6.70;
    if (get_free_ram() > totalmem){
        print('This server can use the autohack method');
        return true;
    }else{
        print('This serrver cannot use autohack method');
        return false;
    }
}

//** BiNode Multipliers **//
bitnodemult = 1;

//** File sizes **//
weaken_size = 1.55;
grow_size = 1.55;
hack_size = 1.8;

//** Arguments **//
target = args[0];


//** Aquiring data **//
lvl = get_hacking_level();
lvlreq = getServerRequiredHackingLevel(target);
host = get_hostname();
mults = getHackingMultipliers();
t_maxmoney = getServerMaxMoney(target);
t_growth = getServerGrowth(target);
t_minsecurity = getServerMinSecurityLevel(target);

//** Constants **//
serverMaxGrowthRate = 1.0035;

//** Check if you can use autohack method **//

if (can_autohack() === false){
    if (hasRootAccess(target) === false){
        exec('root.script', 'home', 1, target);
        sleep (10000);
    }
    while(true){
        lvl = get_hacking_level();
        t_maxmoney = getServerMaxMoney(target);
        t_growth = getServerGrowth(target);
        t_minsecurity = getServerMinSecurityLevel(target);

        step = next_step();

        if (step == 'hack'){
            print('Executing hack script');
            t = calculate_hack_threads();
            if(t === 0){
            }else{
            wait = calculate_sleep_time(step);
            e_hack(t);
            print('Waiting for hack to finish....');
            sleep(wait);
            }        
        }else{
            if (step == 'grow'){
                print('Executing grow script');
                
                t = calculate_grow_threads();
                if(t === 0){
                }else{
                wait = calculate_sleep_time(step);
                e_grow(t);
                print('Waiting for grow to finish...');
                sleep(wait);
                }
            }else{
                if (step == 'weaken'){
                    print('Executing weaken script');
                    t = calculate_weaken_threads();
                    if(t === 0){
                    }else{
                    wait = calculate_sleep_time(step);
                    e_weaken(t);
                    print('Waiting for weaken to finish...');
                    sleep(wait);
                    }
                }
            }
        }
    }
}else{

    perhack = (100-t_minsecurity) *((lvl-lvlreq+1)/lvl) / 24000 * mults.money * bitnodemult;
    hacks = Math.ceil(1/perhack);

    //Gather Growth-related Variables
    security = t_minsecurity + hacks * 0.002;

    //Calculate number of Grow Threads Required
    growpercent = Math.min(1 + 0.03/security,1.0035);
    pergrow = Math.pow(growpercent,t_growth/100 * mults.growth);
    var1 = t_maxmoney * Math.log(pergrow);
    lambert = Math.log(var1)-Math.log(Math.log(var1))-Math.log(1-Math.log(Math.log(var1))/Math.log(var1));
    grows = Math.ceil(lambert/Math.log(pergrow));

    //Calculate number of Weaken Threads Required
    weakens = Math.ceil((((hacks * 0.002) + (grows * 0.004)) / (0.05)));
    maxweakens = (100 - t_minsecurity) / (0.05);
    if (weakens > maxweakens) {weakens = maxweakens}

    currsecurity = getServerSecurityLevel(target);

    if (currsecurity > t_minsecurity)
    {
        run('weaken.script',Math.ceil((currsecurity - t_minsecurity) / 0.05),target);

        while (isRunning('weaken.script',getHostname(),target))
        {
            sleep(1000,false);
        }
    }

    while (true)
    {
        run('weaken.script',weakens,target);
        run('grow.script',grows,target);
        if (isRunning('hack.script',getHostname(),target) === false) {run('hack.script',hacks,target);}

        while (isRunning('weaken.script',getHostname(),target))
        {
            sleep(1000,false);
        }
    }

}