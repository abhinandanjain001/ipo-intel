export const SOURCE = 'https://www.investorgain.com/report/live-ipo-gmp/331/';
export function numeric(v) { if(v===null||v===undefined||String(v).trim()===''||String(v).includes('--'))return null; const n=Number(String(v).replace(/[,₹%x]/g,'').trim()); return Number.isFinite(n)?n:null; }
function text(v=''){return v.replace(/<br\s*\/?\s*>/gi,' ').replace(/<[^>]*>/g,'').replace(/&#8377;|&rupee;/g,'₹').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/&#39;/g,"'").replace(/&quot;/g,'"').trim();}
export function parseFeed(html){
 const items=[];
 for(const row of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){
  const cells={};for(const c of row[1].matchAll(/<td\b[^>]*data-label="([^"]+)"[^>]*>([\s\S]*?)<\/td>/gi))cells[c[1]]=c[2];
  if(!cells.Name||!cells.GMP)continue;
  const anchor=cells.Name.match(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);if(!anchor)continue;
  const badges=[...cells.Name.matchAll(/<span[^>]*>([\s\S]*?)<\/span>/g)].map(m=>text(m[1]));
  const code=badges.find(b=>['U','O','C','L'].includes(b));const status=({U:'Upcoming',O:'Open',C:'Closed',L:'Listed'})[code]||(/data-cfemail=/.test(cells.Name)?'Listed':'Unknown');
  const gmp=cells.GMP.match(/<b[^>]*>([\s\S]*?)<\/b>/i);
  const source=new URL(anchor[1],SOURCE);if(source.hostname!=='www.investorgain.com')continue;
  items.push({id:source.pathname,name:text(anchor[2]),board:badges.some(b=>b.includes('SME'))?'SME':'Mainboard',status,price:numeric(text(cells['Price (₹)'])),lot:numeric(text(cells.Lot)),gmp:numeric(text(gmp?.[1])),subscription:numeric(text(cells.Sub)),size:text(cells['IPO Size']),open:text(cells.Open).split('GMP:')[0].trim(),close:text(cells.Close).split('GMP:')[0].trim(),listing:text(cells.Listing).split('GMP:')[0].trim(),updatedLabel:text(cells['Updated-On']),source:source.href});
 }
 if(!items.length)throw new Error('Source layout changed or no usable data returned');return items;
}
let cache=null;let pending=null;
async function fetchFeed(){
 const key=process.env.IPOGURU_API_KEY;
 const response=await fetch(key?'https://www.ipoguru.in/api/v2/ipos?limit=60':SOURCE,{headers:key?{'X-API-KEY':key}:{'User-Agent':'IPOIntel/1.0 (+IPO analysis dashboard)'},signal:AbortSignal.timeout(18000)});
 if(!response.ok)throw new Error(`Data provider returned HTTP ${response.status}`);
 let items;
 if(key){const body=await response.json();if(!body.success||!Array.isArray(body.data))throw new Error('Invalid provider response');items=body.data.map(i=>({id:i.slug,name:i.display_name||i.name,board:i.type,status:i.is_listed?'Listed':i.status,price:numeric(i.issue_price)||numeric(i.price_max),lot:numeric(i.lot_size),gmp:numeric(i.gmp?.price),subscription:numeric(i.subscription_total),size:i.issue_size,open:i.open_date,close:i.close_date,listing:i.listing_date,updatedLabel:i.gmp?.updated_at_label||'Not supplied',source:i.web_url}));}
 else items=parseFeed(await response.text());
 return {items,fetchedAt:new Date().toISOString(),provider:key?'IPO Guru':'InvestorGain',providerUrl:key?'https://www.ipoguru.in':SOURCE,stale:false};
}
export default async function handler(req,res){
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
 res.setHeader('Cache-Control','public, max-age=0, s-maxage=300');
 try{if(!cache||Date.now()-Date.parse(cache.fetchedAt)>300000){pending??=fetchFeed().finally(()=>pending=null);cache=await pending;}return res.status(200).json(cache);}
 catch {if(cache){res.setHeader('Cache-Control','no-store');return res.status(200).json({...cache,stale:true,message:'Refresh failed. Showing the previous fetch.'});}res.setHeader('Cache-Control','no-store');return res.status(503).json({error:'The IPO data source is unavailable. Please retry shortly.',items:[]});}
}
