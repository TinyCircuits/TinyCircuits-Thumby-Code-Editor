import {default as littlefsModule } from "./littlefs.js"  // https://stackoverflow.com/a/75297439

class LittleFSHelper{
    constructor(){
        this.BLOCK_COUNT = undefined;       // Depends on the size of flash passed in init()
        this.BLOCK_SIZE = 4096;
        this.FILESYSTEM_OFFSET = 0xa0000;   // Don't want to overwrite MicroPython or the program
    }


    #flashRead(cfg, block, off, buffer, size){
        const start = block * this.BLOCK_SIZE + off;
        this.littlefs.HEAPU8.set(this.flash.subarray(start, start + size), buffer);
        return 0;
    }


    #flashProg(cfg, block, off, buffer, size){
        const start = block * this.BLOCK_SIZE + off;
        this.flash.set(this.littlefs.HEAPU8.subarray(buffer, buffer + size), start);
        return 0;
    }


    #flashErase(cfg, block){
        const start = block * this.BLOCK_SIZE;
        this.flash.set(0xff, start, start + this.BLOCK_SIZE);
        return 0;
    }


    async init(flash){
        // The passed flash should be the entire flash byte array used by the emulator
        this.flash = flash.subarray(this.FILESYSTEM_OFFSET);
        this.BLOCK_COUNT = this.flash.length / this.BLOCK_SIZE;

        this.littlefs = await littlefsModule();

        this.read = this.littlefs.addFunction(this.#flashRead.bind(this), 'iiiiii');
        this.prog = this.littlefs.addFunction(this.#flashProg.bind(this), 'iiiiii');
        this.erase = this.littlefs.addFunction(this.#flashErase.bind(this), 'iii');
        this.sync = this.littlefs.addFunction(() => 0, 'ii');
        this.writeFile = this.littlefs.cwrap(
            'lfs_write_file',
            ['number'],
            ['number', 'string', 'number', 'number']
        );
        this.writeFileW = this.littlefs.cwrap(
            'lfs_write_file_w',
            ['number'],
            ['number', 'string', 'number', 'number']
        );
        this.mkDir = this.littlefs.cwrap(
            'lfs_mkdir',
            ['number'],
            ['number', 'string']
        );

        this.cfg = this.littlefs._new_lfs_config(this.read, this.prog, this.erase, this.sync, this.BLOCK_COUNT, this.BLOCK_SIZE);
        this.lfs = this.littlefs._new_lfs();
        this.littlefs._lfs_format(this.lfs, this.cfg);
        this.littlefs._lfs_mount(this.lfs, this.cfg);
        console.log("LittleFS JS Filesystem setup complete");
    }
    

    write(data, filePath){
        // Make sure the path leading to the file exists
        let dirs = filePath.split('/').slice(1);
        let dirPath = "";
        for(let i=0; i<dirs.length-1; i++){
            dirPath = dirPath + "/" + dirs[i];
            this.mkdir(dirPath);
        }

        // Create a data buffer in the littlefs module/C code to hold the file data before writing it
        let lfsDataBuffer = this.littlefs._malloc(data.length*data.BYTES_PER_ELEMENT);

        // Set the module's just created data buffer to the data passed to this function
        this.littlefs.HEAPU8.set(data, lfsDataBuffer);

        // Write the file to the common flash (the flash passed to this module in the constructor)
        this.writeFile(this.lfs, filePath, lfsDataBuffer, data.length);

        // Free the buffer from the C module now that it is written to flash
        this.littlefs._free(lfsDataBuffer);
    }

    writeW(data, filePath){
        // Make sure the path leading to the file exists
        let dirs = filePath.split('/').slice(1);
        let dirPath = "";
        for(let i=0; i<dirs.length-1; i++){
            dirPath = dirPath + "/" + dirs[i];
            this.mkdir(dirPath);
        }

        // Create a data buffer in the littlefs module/C code to hold the file data before writing it
        let lfsDataBuffer = this.littlefs._malloc(data.length*data.BYTES_PER_ELEMENT);

        // Set the module's just created data buffer to the data passed to this function
        this.littlefs.HEAPU8.set(data, lfsDataBuffer);

        // Write the file to the common flash (the flash passed to this module in the constructor)
        this.writeFileW(this.lfs, filePath, lfsDataBuffer, data.length);

        // Free the buffer from the C module now that it is written to flash
        this.littlefs._free(lfsDataBuffer);
    }


    mkdir(path){
        this.mkDir(this.lfs, path);
    }


    destroy(){
        this.littlefs._lfs_unmount();
        this.littlefs._free(this.lfs);
        this.littlefs._free(this.cfg);
    }


    mount(){
        this.littlefs._lfs_mount(this.lfs, this.cfg);
    }


    unmount(){
        this.littlefs._lfs_unmount(this.lfs);
    }
}

export { LittleFSHelper };