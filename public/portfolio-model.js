export function validateHolding(data){
 const name=String(data.name||'').trim();
 const quantity=Number(data.quantity),entry=Number(data.entry),mark=data.mark===''||data.mark===null?null:Number(data.mark),fees=Number(data.fees);
 if(!name||name.length>120)throw new Error('Enter a company name of up to 120 characters.');
 if(!Number.isInteger(quantity)||quantity<1||quantity>100000000)throw new Error('Enter a whole number of shares between 1 and 100,000,000.');
 if(!Number.isFinite(entry)||entry<=0||entry>100000000)throw new Error('Enter a valid purchase price greater than zero.');
 if(mark!==null&&(!Number.isFinite(mark)||mark<0||mark>100000000))throw new Error('Enter a valid valuation or sale price, or leave it blank.');
 if(!Number.isFinite(fees)||fees<0||fees>100000000)throw new Error('Enter valid total costs of zero or more.');
 if(!['Held','Sold'].includes(data.status))throw new Error('Select Held or Sold.');
 if(data.status==='Sold'&&mark===null)throw new Error('Enter the sale price for a sold holding.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(data.date)||!Number.isFinite(Date.parse(data.date+'T00:00:00Z'))||new Date(data.date+'T00:00:00Z').toISOString().slice(0,10)!==data.date)throw new Error('Enter a valid transaction date.');
 const note=String(data.note||'').trim();if(note.length>500)throw new Error('Keep notes within 500 characters.');
 return {name,quantity,entry,mark,fees,status:data.status,date:data.date,note};
}
export function holdingMetrics(h){const invested=h.quantity*h.entry+h.fees,value=h.mark===null?null:h.quantity*h.mark,profit=value===null?null:value-invested;return {invested,value,profit,returnPct:profit===null?null:profit/invested*100};}
export function portfolioTotals(holdings){return holdings.reduce((t,h)=>{const m=holdingMetrics(h);t.totalCost+=m.invested;if(h.status==='Held'){t.openCost+=m.invested;if(m.value!==null){t.openValue+=m.value;t.unrealized+=m.profit;t.valued++;}else t.unpriced++;}else t.realized+=m.profit;t.count++;return t;},{totalCost:0,openCost:0,openValue:0,unrealized:0,realized:0,valued:0,unpriced:0,count:0});}
export function csvCell(v){let s=String(v??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
