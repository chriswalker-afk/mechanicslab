import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {Script} from "node:vm";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const html=read("index.html");

test("A Level Mechanics Lab is a complete standalone site",()=>{
  assert.match(html,/^<!doctype html>/i);
  assert.match(html,/<title>Mechanics Lab — 9MA0 Mechanics Modelling<\/title>/);
  assert.match(html,/<body\b/i);
  assert.match(html,/<\/body>\s*<\/html>\s*$/i);
  assert.ok(Buffer.byteLength(html,"utf8")>600000,"The complete live Mechanics Lab app must be present");
  assert.match(html,/Newton/);
  assert.match(html,/friction/);
  assert.match(html,/canvas/i,"Mechanics visualisation should remain present");
});

test("No Netlify-only runtime or missing static assets",()=>{
  assert.equal([...html.matchAll(/<style\b/gi)].length,1);
  assert.equal([...html.matchAll(/<script\b/gi)].length,1);
  assert.doesNotMatch(html,/<script\b[^>]*\bsrc=/i);
  assert.doesNotMatch(html,/<link\b[^>]*rel=["']stylesheet["']/i);
  assert.doesNotMatch(html,/\/\.netlify\/(?:functions|scripts)\//i);
});

test("Embedded mechanics simulator script parses",()=>{
  const match=html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i);
  assert.ok(match);
  assert.doesNotThrow(()=>new Script(match[1],{filename:"mechanics-lab.js"}));
});

test("GitHub Pages custom subdomain",()=>{
  assert.equal(read("CNAME").trim(),"mechanics.mrwalkermaths.com");
});
