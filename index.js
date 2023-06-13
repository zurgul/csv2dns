#!/usr/bin/env node
import { parse } from 'csv-parse';
import fs from 'fs';

const DEFAULT_INPUT = 'dns.csv';
const DEFAULT_OUTPUT = 'dns.zone';
const DEFAULT_TTL = 300;

const parser = parse({ delimiter: ',', columns: true, skip_empty_lines: true });
const inputFile = process.argv?.[2] || DEFAULT_INPUT;
const records = [];
const skipped = [];

fs.createReadStream(inputFile)
  .pipe(parser)
  .on('data', (data) => records.push(data))
  .on('end', process);

function process() {
  records.sort((a, b) => (a.Host < b.Host ? -1 : a.Host > b.Host ? 1 : 0)); // optional sort

  let outRecord, skippedRecord;
  const outputFile = fs.createWriteStream(DEFAULT_OUTPUT);
  outputFile.on('error', (err) => console.error('E', err));

  for (const record of records) {
    skippedRecord = '';
    if (!record.Type || !record.Host || !record.Value) {
      skippedRecord = '[SKIP]   No Type specified ' + JSON.stringify(record);
    }
    if (record.Type === 'MX' && !record.Priority) {
      skippedRecord = '[SKIP]   No Priority specified for MX record ' + JSON.stringify(record);
    }
    if (skippedRecord) {
      skipped.push(skippedRecord);
      console.warn(skippedRecord);
      continue;
    }

    normalize(record);
    outRecord = `${record.Host}.\t${record.TTL}\t${record.Type}\t${record.Priority || ''}\t${record.Value}`;

    outputFile.write(outRecord + '\n');
    console.log('[ADD]\t', outRecord);
  }
  outputFile.end();
  if (skipped.length > 0) {
    console.warn('\n\nInvalid records', skipped, '\n');
  }
}

function normalize(record) {
  if (!record.TTL) {
    record.TTL = DEFAULT_TTL;
  }
  if (/\s/.test(record.Value)) {
    record.Value = `"${record.Value}"`;
  }
}
