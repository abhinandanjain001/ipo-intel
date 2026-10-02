export function scenarios({price,lot,lots,gmp,spread,fees}){
 if(![price,lot,lots,spread,fees].every(Number.isFinite)||price<=0||lot<=0||lots<1||!Number.isInteger(lot)||!Number.isInteger(lots)||spread<0||fees<0)throw new Error('Enter valid positive prices, whole shares and lots, and nonnegative costs.');
 const shares=lot*lots,capital=shares*price,base=price+(gmp??0),delta=price*spread/100;
 return ['Bearish','Base','Bullish'].map((name,i)=>{const listing=Math.max(0,base+(i-1)*delta),profit=(listing-price)*shares-fees;return {name,listing,profit,returnPct:profit/capital*100,shares,capital};});
}
