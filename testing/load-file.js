const createLittleFS = require('./node_modules/littlefs/dist/littlefs');


// ##### USER CODE #####
// See load-files.js for source file, run 'browserify load-file.js -o load-file-gen.js' to make browser compatible file again
const BLOCK_COUNT = 352;
const BLOCK_SIZE = 4096;
const FLASH_FS_OFFSET = 0xa0000;

var flash = new Uint8Array(BLOCK_COUNT * BLOCK_SIZE);
var littlefs = undefined;
var writeFile = undefined;
var config = undefined;
var lfs = undefined;

(async () => {
  console.log("FS setup started");
  littlefs = await createLittleFS();
  function flashRead(cfg, block, off, buffer, size) {
    const start = block * BLOCK_SIZE + off;
    littlefs.HEAPU8.set(flash.subarray(start, start + size), buffer);
    return 0;
  }
  function flashProg(cfg, block, off, buffer, size) {
    const start = block * BLOCK_SIZE + off;
    flash.set(littlefs.HEAPU8.subarray(buffer, buffer + size), start);
    return 0;
  }
  function flashErase(cfg, block) {
    const start = block * BLOCK_SIZE;
    flash.fill(0xff, start, start + BLOCK_SIZE);
    return 0;
  }
  const read = littlefs.addFunction(flashRead, 'iiiiii');
  const prog = littlefs.addFunction(flashProg, 'iiiiii');
  const erase = littlefs.addFunction(flashErase, 'iii');
  const sync = littlefs.addFunction(() => 0, 'ii');

  writeFile = littlefs.cwrap(
    'lfs_write_file',
    ['number'],
    ['number', 'string', 'string', 'number']
  );

  config = littlefs._new_lfs_config(read, prog, erase, sync, BLOCK_COUNT, BLOCK_SIZE);
  lfs = littlefs._new_lfs();
  littlefs._lfs_format(lfs, config);
  littlefs._lfs_mount(lfs, config);
  console.log("FS setup ended");
})();


async function loadFileData(fileData, fileName){
  console.log("File loading");
  writeFile(lfs, fileName, fileData, fileData.length);  
  console.log("File loaded");
}
window.loadFileData = loadFileData;


async function copyFSToFlash(rp2040){
  console.log("Flash FS copy started");

  littlefs._lfs_unmount(lfs);
  littlefs._free(lfs);
  littlefs._free(config);

  rp2040.flash.set(flash, 0xa0000);

  console.log("Flash FS copy ended");
}
window.copyFSToFlash = copyFSToFlash;

// ##### END USER CODE #####