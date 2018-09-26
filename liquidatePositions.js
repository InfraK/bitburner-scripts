export async function main(ns){
    ns.scriptKill('sma.ns', 'home');
    ns.scriptKill('stockTrade-noShort.ns', 'home');
    ns.scriptKill('stockTrade.ns', 'home');
    
    const sym = ['ECP', 'MGCP', 'FLCM', 'FSIG'];
    
    for(let i = 0; i < sym.length; i++){
        const pos = ns.getStockPosition(sym[i]);
        const long = pos[0];
        const short = pos[2];
        
        ns.sellStock(sym[i], long);
        
        if(short){
            ns.sellShort(sym[i], short);
        }
    }
}