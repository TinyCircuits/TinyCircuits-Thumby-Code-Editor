import { decodeBlock } from './uf2/dist/esm/uf2.js';
import { RP2040 } from './rp2040js/dist/esm/rp2040.js';

export async function loadUF2(filename, rp2040) {
  console.log("UF2 loading");
  // Get the uf2 and set its con
  const res = await fetch(filename);
  const buffer = await res.arrayBuffer();
  const fileData = new Uint8Array(buffer);
  let fileIndex = 0;

  var lastFlashAddress = 0;

  while (fileIndex < fileData.length) {
    const dataBlock = fileData.slice(fileIndex, fileIndex + 512);
    const block = decodeBlock(dataBlock);
    const { flashAddress, payload } = block;
    rp2040.flash.set(payload, flashAddress - 0x10000000);
    lastFlashAddress = flashAddress;
    fileIndex = fileIndex + 512;
  }
  console.log("UF2 loaded");
}
