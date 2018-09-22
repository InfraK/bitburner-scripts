target = args[0];
moneyThresh = args[1];
securityThresh = args[2];

while (true) {
    if (getServerSecurityLevel(target) > securityThresh) {
        //If the server's security level is above our threshold, weaken it
        weaken(target);
    } else if (getServerMoneyAvailable(target) < moneyThresh) {
        //If the server's money is less than our threshold, grow it
        grow(target);
    } else {
        //Otherwise, hack it
        hack(target);
    }
}