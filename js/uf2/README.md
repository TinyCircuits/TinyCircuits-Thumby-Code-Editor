# USB Flashing Format (UF2) JavaScript Library

JavaScript implementation of the [UF2](https://github.com/microsoft/uf2) file format

![NPM Version](https://img.shields.io/npm/v/uf2)
![License: MIT](https://img.shields.io/npm/l/uf2)
![Types: TypeScript](https://img.shields.io/npm/types/uf2)

## Usage example

```javascript
const fs = require('fs');
const { decodeBlock, familyMap } = require('uf2');

const file = fs.openSync('blink.uf2', 'r');
const buffer = new Uint8Array(512);
while (fs.readSync(file, buffer) === buffer.length) {
  const block = decodeBlock(buffer);
  const family = familyMap.get(block.boardFamily) || 'unknown';
  const { totalBlocks, blockNumber, flashAddress, payload } = block;
  const hexAddress = '0x' + flashAddress.toString(16);
  console.log(`Block ${blockNumber + 1}/${totalBlocks} @${hexAddress}, Family: ${family}`);
  // Do something with payload...
}
fs.closeSync(file);
```

For more examples, see the [unit tests file](src/uf2.spec.ts).

## License

Copyright (C) 2021 Uri Shaked. The code is released under the terms of the MIT license.
