import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";

const source=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const origin="https://alevelmechanicslab.netlify.app/";
const newUrl="https://mechanics.mrwalkermaths.com/";
const sha=text=>createHash("sha256").update(text).digest("hex");
const hud=/<script\b(?=[^>]*\bsrc=["']\/\.netlify\/scripts\/hud\?variant=public["'])[^>]*><\/script>[ \t]*\r?\n?/g;
const comment=/<!-- This site is hosted on Netlify\.[\s\S]*?Netlify hosting facts for this site: static\/SSR served via Netlify Edge\. -->[ \t]*\r?\n?/g;
const fetchPage=async url=>{
  const res=await fetch(url,{redirect:"follow",headers:{"User-Agent":"MechanicsLab-GitHubPages-Verification/1.0"},signal:AbortSignal.timeout(25000)});
  const html=await res.text();
  return {res,html};
};
const [gh,netlify]=await Promise.all([fetchPage(newUrl),fetchPage(origin)]);
const ghMatches=gh.html.trimEnd()===source.trimEnd();
const normalizedNetlify=netlify.html.replace(hud,"").replace(comment,"");
const netlifyMatches=normalizedNetlify===source;
const result={
  github:{url:newUrl,status:gh.res.status,finalUrl:gh.res.url,htmlBytes:Buffer.byteLength(gh.html),sha256:sha(gh.html),sourceMatch:ghMatches,title:gh.html.match(/<title>(.*?)<\/title>/)?.[1]},
  netlify:{url:origin,status:netlify.res.status,htmlBytes:Buffer.byteLength(netlify.html),normalizedSourceMatch:netlifyMatches},
  hasInteractiveMechanics:gh.html.includes("Mechanics Lab — 9MA0 Mechanics Modelling")&&gh.html.includes("renderAll()")
};
console.log("LIVE_SITE_VERIFICATION="+JSON.stringify(result));
if(gh.res.status!==200||!ghMatches||!result.hasInteractiveMechanics)throw new Error("New Mechanics Lab custom domain is not publishing the reviewed source");
if(netlify.res.status!==200||!netlifyMatches)throw new Error("Existing Netlify site is not equivalent to the reviewed Mechanics Lab source");
