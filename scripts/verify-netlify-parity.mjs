import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const source=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const response=await fetch("https://alevelmechanicslab.netlify.app/",{
  redirect:"follow",headers:{"User-Agent":"MechanicsLab-NetlifyParity/1.0"},signal:AbortSignal.timeout(30000)
});
if(response.status!==200)throw new Error("Original Netlify site returned HTTP "+response.status);
const html=await response.text();
const injected=/<script\b(?=[^>]*\bsrc=["']\/\.netlify\/scripts\/hud\?variant=public["'])[^>]*><\/script>[ \t]*\r?\n?/g;
const netlifyHostingComment=/<!-- This site is hosted on Netlify\.[\s\S]*?Netlify hosting facts for this site: static\/SSR served via Netlify Edge\. -->[ \t]*\r?\n?/g;
const n=[...html.matchAll(injected)].length;
const comments=[...html.matchAll(netlifyHostingComment)].length;
if(n!==1||comments>1)throw new Error("Unexpected Netlify injection pattern");
const normalized=html.replace(injected,"").replace(netlifyHostingComment,"");
const hash=s=>createHash("sha256").update(s).digest("hex");
const report={status:response.status,netlifyOriginalBytes:Buffer.byteLength(html,"utf8"),
  normalizedNetlifyBytes:Buffer.byteLength(normalized,"utf8"),
  githubBytes:Buffer.byteLength(source,"utf8"),
  normalizedHash:hash(normalized),githubHash:hash(source),
  identical:normalized===source,removedNetlifyHud:n,removedHostingComments:comments};
console.log("PARITY_RESULT="+JSON.stringify(report));
if(!report.identical)throw new Error("Imported GitHub HTML is not identical to the Netlify application");
