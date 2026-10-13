'use strict';
/**
 * OFFLINE acceptance-output comparator, NOT a HAIEC authenticity verifier.
 * Must consume an independently collected normalized result from the real
 * HAIEC evaluation runner; it does not invoke or impersonate any detector.
 */
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'../contracts/manufacturing/v0.1.0');
const files=['semantic-pack.json','detector-acceptance-spec.json','detector-acceptance-inputs.json','detector-acceptance-oracle.json'];
const digest=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
if(process.argv.includes('--digests')){
 for(const n of files)console.log(digest(path.join(root,n))+'  '+n);
 process.exit(0);
}
const arg=process.argv.indexOf('--results');
if(arg<0 || !process.argv[arg+1]){
 console.error('UNVERIFIED: specify --results /path/to/authenticated-HAIEC-normalized-results.json');
 console.error('This compares offline engine output only; independently verify signed receipt and authenticated tenant/source binding.');
 process.exit(2);
}
try{
 const oracle=JSON.parse(fs.readFileSync(path.join(root,'detector-acceptance-oracle.json'),'utf8'));
 const resultPath=path.resolve(process.argv[arg+1]);
 const data=JSON.parse(fs.readFileSync(resultPath,'utf8'));
 if(data.schemaVersion!=='haiec.manufacturing.acceptance-results/0.1')throw Error('Invalid normalized results schema');
 if(data.origin!=='CANONICAL_HAIEC_EVALUATION')throw Error('Missing canonical provenance marker');
 if(data.semanticPackSha256!==digest(path.join(root,'semantic-pack.json')))throw Error('semantic pack content digest mismatch');
 if(!data.evaluationId||!data.organizationId||!data.sourceDigest||!data.runId)throw Error('Missing evaluation, organization, run or frozen source identity');
 if(!Array.isArray(data.cases) || data.cases.length!==oracle.cases.length)throw Error('Wrong result count');
 const byCase=new Map(data.cases.map(x=>[x.caseId,x]));
 if(byCase.size!==oracle.cases.length)throw Error('Duplicate case result');
 let failures=[];
 for(const expected of oracle.cases){
  const row=byCase.get(expected.caseId);
  if(!row){failures.push(expected.caseId+': missing result');continue}
  if(row.ruleId!==expected.ruleId)failures.push(expected.caseId+': wrong rule');
  if(row.evaluationId!==data.evaluationId)failures.push(expected.caseId+': mismatch evaluation');
  if(row.status!==expected.expectedHarnessStatus)failures.push(expected.caseId+': expected '+expected.expectedHarnessStatus+', got '+row.status);
  if(!Array.isArray(row.sourceRefs)||row.sourceRefs.length===0)failures.push(expected.caseId+': missing source refs');
  if(row.sourceQualification!=='SERVER_VERIFIED_QUALIFIED' && row.status==='MATCH')failures.push(expected.caseId+': unqualified match');
  if(!Array.isArray(row.limitations))failures.push(expected.caseId+': missing limitations array');
 }
 if(failures.length){console.error('PARITY_MISMATCH ('+failures.length+'):\n'+failures.join('\n'));process.exitCode=1;}
 else {
  console.log('OFFLINE_OUTPUT_PARITY_MATCH: 25 public acceptance vectors match the supplied result file.');
  console.log('NOT A LIVE HAIEC ACCEPTANCE PASS. Independently verify the actual evaluation receipt, system/org identity, production source binder and blind C2 tests.');
 }
}catch(error){console.error('PARITY_CHECK_FAILED: '+error.message);process.exitCode=1}
