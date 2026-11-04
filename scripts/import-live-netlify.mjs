import {createHash} from "node:crypto";
import {writeFileSync} from "node:fs";
const url="https://alevelmechanicslab.netlify.app/";
const r=await fetch(url,{redirect:"follow",headers:{"User-Agent":"MechanicsLab-GitHubPagesMigration/1.0"},signal:AbortSignal.timeout(30000)});
if(r.status!==200)throw new Error("Cannot safely import Netlify source: HTTP "+r.status);
const original=await r.text();
if(!/^<!doctype html>/i.test(original.trimStart())
    || !/<title>Mechanics Lab — 9MA0 Mechanics Modelling<\/title>/.test(original)
    || Buffer.byteLength(original,"utf8")<600000
    || !original.includes("<style>")
    || !original.includes("<script"))throw new Error("Unexpected Netlify document; refusing to overwrite source");
const hud=/<script\b(?=[^>]*\bsrc=["']\/\.netlify\/scripts\/hud\?variant=public["'])[^>]*><\/script>[ \t]*\r?\n?/g;
const netlifyHostingComment=/<!-- This site is hosted on Netlify\.[\s\S]*?Netlify hosting facts for this site: static\/SSR served via Netlify Edge\. -->[ \t]*\r?\n?/g;
const hudCount=[...original.matchAll(hud)].length;
if(hudCount!==1)throw new Error("Expected one Netlify-injected HUD script, found "+hudCount);
const comments=[...original.matchAll(netlifyHostingComment)].length;
if(comments>1)throw new Error("Unexpected hosting-comment duplication");
const html=original.replace(hud,"").replace(netlifyHostingComment,"");
if(/<script\b[^>]*\bsrc=/i.test(html)
    || /<link\b[^>]*rel=["']stylesheet["']/i.test(html)
    || /\/\.netlify\/(?:scripts|functions)\//i.test(html))throw new Error("External dependency remains after normalization");
writeFileSync(new URL("../index.html",import.meta.url),html,"utf8");
console.log("IMPORTED_LIVE_SITE="+JSON.stringify({
    source:url,
    sourceBytes:Buffer.byteLength(original,"utf8"),
    githubBytes:Buffer.byteLength(html,"utf8"),
    sha256:createHash("sha256").update(html).digest("hex"),
    removedNetlifyHud:hudCount,
    removedNetlifyHostingComments:comments
}));