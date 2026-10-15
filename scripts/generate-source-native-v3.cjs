'use strict';
/** Rebuild or byte-verify the committed v3 synthetic source-native evidence. */
const fs=require('node:fs'),path=require('node:path');
const {buildAll}=require('../packages/fixtures/src/source-native-v3.cjs');
const root=path.resolve(__dirname,'..'),check=process.argv.includes('--check'),files=buildAll();
const issues=[];
for(const [relative,body] of Object.entries(files)){
 const absolute=path.join(root,relative);
 if(check){if(!fs.existsSync(absolute)||fs.readFileSync(absolute,'utf8')!==body)issues.push(relative);}
 else{fs.mkdirSync(path.dirname(absolute),{recursive:true});fs.writeFileSync(absolute,body);}
}
if(issues.length){console.error('V3_MANIFEST_DRIFT: '+issues.join(', '));process.exitCode=1;}
else console.log('Synthetic v3 '+(check?'verified':'generated')+': '+Object.keys(files).length+' pinned files, nine systems, 36 scenarios.');
