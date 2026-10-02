import test from 'node:test';import assert from 'node:assert/strict';import {scenarios} from './public/model.js';import {numeric,parseFeed} from './api/ipos.js';
test('profit, costs and downside are calculated on allotted shares',()=>{const r=scenarios({price:100,lot:150,lots:2,gmp:20,spread:30,fees:50});assert.equal(r[0].profit,-3050);assert.equal(r[1].profit,5950);assert.equal(r[2].profit,14950);assert.equal(r[0].capital,30000);});
test('missing GMP is neutral and bearish price never becomes negative',()=>{const r=scenarios({price:100,lot:1,lots:1,gmp:null,spread:15,fees:0});assert.equal(r[1].listing,100);assert.equal(scenarios({price:100,lot:1,lots:1,gmp:-100,spread:60,fees:0})[0].listing,0);});
test('invalid allocations are rejected',()=>assert.throws(()=>scenarios({price:100,lot:150,lots:1.5,gmp:0,spread:15,fees:0})));
test('unknown numbers stay null, actual zero stays zero',()=>{assert.equal(numeric('--'),null);assert.equal(numeric(''),null);assert.equal(numeric('0'),0);assert.equal(numeric('1,600'),1600);});
test('changed upstream layout is rejected instead of producing fake data',()=>assert.throws(()=>parseFeed('<html>Source unavailable</html>')));
