import {createHash} from "node:crypto";

const site="https://alevelmechanicslab.netlify.app/";
const response=await fetch(site,{
  redirect:"follow",
  headers:{"User-Agent":"MechanicsLab-MigrationAudit/1.0"},
  signal:AbortSignal.timeout(30000)
});
if(!response.ok)throw new Error("Netlify source returned HTTP "+response.status);
const html=await response.text();
const sha=text=>createHash("sha256").update(text).digest("hex");
const extract=re=>[...html.matchAll(re)].map(m=>m[1]);
const title=html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim()??null;
const scripts=extract(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi);
const linkTags=[...html.matchAll(/<link\b[^>]*>/gi)].map(m=>m[0]);
const styles=linkTags.filter(x=>/rel=["']stylesheet["']/i.test(x)).map(x=>x.match(/href=["']([^"']+)["']/i)?.[1]).filter(Boolean);
const images=extract(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi);
const video=extract(/<(?:video|audio|source)\b[^>]*\bsrc=["']([^"']+)["']/gi);
const otherRefs=extract(/\b(?:fetch|import)\s*\(\s*["']([^"']+)["']/gi);
const sourcePaths=[...new Set([...scripts,...styles,...images,...video,...otherRefs])];
const sameOrigin=sourcePaths.filter(x=>{try{return new URL(x,site).origin===new URL(site).origin}catch{return false}});
const report={
  source:site,httpStatus:response.status,finalUrl:response.url,
  title,bytes:Buffer.byteLength(html,"utf8"),sha256:sha(html),
  inlineScripts:(html.match(/<script\b(?![^>]*\bsrc=)/gi)||[]).length,
  inlineStyles:(html.match(/<style\b/gi)||[]).length,
  scripts,styles,images:images.slice(0,35),media:video,otherRefs:otherRefs.slice(0,30),sameOrigin,
  netlifyHudScripts:scripts.filter(x=>x.startsWith("/.netlify/scripts/")),
  hasNetlifyFunctions:/\/\.netlify\/functions\//i.test(html),
  hasNetlifyForms:/\bdata-netlify\s*=|<form\b[^>]*\bnetlify\b/i.test(html),
  hasNetlifyIdentity:/netlify-identity/i.test(html),
  hasServiceWorker:/serviceWorker\.register/i.test(html),
  hasBrowserStorage:/localStorage|indexedDB|sessionStorage/i.test(html),
  hasEmbeddedFonts:/data:font/i.test(html),
  hasMechanicsLab:/Mechanics Lab|Mechanics Modelling/i.test(html)
};
console.log("SITE_AUDIT="+JSON.stringify(report));
for(const asset of sameOrigin){
  const url=new URL(asset,site);
  const r=await fetch(url,{signal:AbortSignal.timeout(20000)});
  console.log("ASSET_AUDIT="+JSON.stringify({asset,url:String(url),status:r.status,type:r.headers.get("content-type"),length:r.headers.get("content-length")}));
  if(!r.ok)throw new Error("Missing dependency at "+url);
}