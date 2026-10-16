#!/usr/bin/env node
/* build-factory-data.cjs — emits dashboard/data/digital-factory.js from the
   versioned fixture data/demo-factory/digital-factory.json. Deterministic;
   --check verifies the committed bundle matches the fixture. */
'use strict';
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..');
const fx=JSON.parse(fs.readFileSync(path.join(ROOT,'data/demo-factory/digital-factory.json'),'utf8'));
if(fx.schemaVersion!=='demo-digital-factory-1.0.0')throw new Error('DF_SCHEMA');
if(fx.provenance!=='SIMULATION_ONLY')throw new Error('DF_PROVENANCE');
// Station 217 invariants must survive in the fixture.
const wos=fx.workOrders.map(w=>w.id);
if(!wos.includes('WO-217-4802')||!wos.includes('WO-217-4803'))throw new Error('DF_217_WO');
if(!fx.erp.inventory.some(l=>l.lotId==='LOT-2026-4510'&&l.status==='QUALITY_HOLD'))throw new Error('DF_LOT');
if(!fx.erp.purchaseOrders.some(p=>p.id==='REQ-2026-8842'))throw new Error('DF_PO');
const out='/* GENERATED from data/demo-factory/digital-factory.json; presentation-only simulation baseline. */\n'
  +'window.HAIEC_DIGITAL_FACTORY = '+JSON.stringify(fx,null,2)+';\n';
const dest=path.join(ROOT,'dashboard/data/digital-factory.js');
if(process.argv.includes('--check')){
  if(!fs.existsSync(dest)||fs.readFileSync(dest,'utf8')!==out)throw new Error('digital-factory.js is stale — run node scripts/build-factory-data.cjs');
  console.log('digital-factory build parity: OK');
}else{
  fs.writeFileSync(dest,out);
  console.log('Built digital-factory bundle:',fx.workOrders.length,'work orders,',fx.erp.suppliers.length,'suppliers,',fx.equipment.length,'equipment');
}
