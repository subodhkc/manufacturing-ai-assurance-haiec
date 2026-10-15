'use strict';
/** Versioned read-only check / deterministic local generator for synthetic evidence v3.1. */
const fs=require('node:fs'),path=require('node:path');
const {SPECS}=require('../packages/fixtures/src/source-native-v3.cjs');
const {buildEnhanced}=require('../packages/fixtures/src/source-native-v3-1-core.cjs');
const root=path.resolve(__dirname,'..');
const upstream=JSON.parse(fs.readFileSync(path.join(root,'data/source-native/v3/manifest.json'),'utf8'));
const expected=buildEnhanced(SPECS,upstream);
const check=process.argv.includes('--check');
const missingOrChanged=[];
for(const [file,content] of Object.entries(expected)){
  const out=path.join(root,file);
  if(check){
    if(!fs.existsSync(out)||fs.readFileSync(out,'utf8')!==content)missingOrChanged.push(file);
  }else{
    fs.mkdirSync(path.dirname(out),{recursive:true});
    fs.writeFileSync(out,content);
  }
}
if(missingOrChanged.length){
  console.error('V3_1_SOURCE_DRIFT '+missingOrChanged.length+' files: '+missingOrChanged.slice(0,20).join(', '));
  process.exitCode=1;
}else{
  console.log('Manufacturing source-native v3.1 '+(check?'verified':'generated')+': '+Object.keys(expected).length+' files, 9 systems, 36 cases.');
}
