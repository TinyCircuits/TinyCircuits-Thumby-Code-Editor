import { decodeBlock, encodeBlock, familyID, isUF2Block, UF2Flags } from './uf2';

// First block of the Blink example from the Pico examples repo:
// https://github.com/raspberrypi/pico-examples/tree/master/blink
// prettier-ignore
const blinkBlock = new Uint8Array([
  85, 70, 50, 10, 87, 81, 93, 158, 0, 32, 0, 0, 0, 0, 0, 16, 0, 1, 0, 0, 0, 0, 0, 0, 50, 0, 0, 0,
  86, 255, 139, 228, 0, 181, 47, 75, 33, 32, 88, 96, 152, 104, 2, 33, 136, 67, 152, 96, 216, 96,
  24, 97, 88, 97, 43, 75, 0, 33, 153, 96, 2, 33, 89, 97, 1, 33, 240, 34, 153, 80, 40, 73, 25, 96,
  1, 33, 153, 96, 53, 32, 0, 240, 62, 248, 2, 34, 144, 66, 20, 208, 6, 33, 25, 102, 0, 240, 46,
  248, 25, 110, 1, 33, 25, 102, 0, 32, 24, 102, 26, 102, 0, 240, 38, 248, 25, 110, 25, 110, 25,
  110, 5, 32, 0, 240, 41, 248, 1, 33, 8, 66, 249, 209, 0, 33, 153, 96, 24, 73, 25, 96, 0, 33, 89,
  96, 23, 73, 24, 72, 1, 96, 1, 33, 153, 96, 235, 33, 25, 102, 160, 33, 25, 102, 0, 240, 12, 248,
  0, 33, 153, 96, 19, 73, 17, 72, 1, 96, 1, 33, 153, 96, 1, 188, 0, 40, 0, 209, 16, 72, 0, 71, 3,
  181, 153, 106, 4, 32, 1, 66, 251, 208, 1, 32, 1, 66, 248, 209, 3, 189, 2, 181, 24, 102, 24, 102,
  255, 247, 242, 255, 24, 110, 24, 110, 2, 189, 0, 0, 2, 64, 0, 0, 0, 24, 0, 0, 7, 0, 0, 3, 95, 0,
  33, 34, 0, 0, 244, 0, 0, 24, 34, 32, 0, 160, 1, 1, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 62, 39, 42, 96, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 111, 177, 10
]);
const blinkPayload = blinkBlock.slice(32, 32 + 256);

describe('isUF2Block', () => {
  it('should return true for a valid UF2 block', () => {
    expect(isUF2Block(blinkBlock)).toBe(true);
  });

  it('should return false if block size is not valid', () => {
    expect(isUF2Block(new Uint8Array(1))).toBe(false);
    expect(isUF2Block(new Uint8Array([...blinkBlock, 10]))).toBe(false);
    expect(isUF2Block(blinkBlock.slice(0, 500))).toBe(false);
  });

  it('should return false if the magic is invalid', () => {
    expect(isUF2Block(new Uint8Array(512))).toBe(false);
  });
});

describe('decodeBlock', () => {
  it('should correctly decode a valid block', () => {
    const rp2040Family = familyID('Raspberry Pi RP2040');
    expect(decodeBlock(blinkBlock)).toEqual({
      boardFamily: rp2040Family,
      flags: UF2Flags.familyIDPresent,
      flashAddress: 0x10000000,
      blockNumber: 0,
      totalBlocks: 50,
      payload: blinkPayload,
    });
  });

  it('should throw an error if the block size is invalid', () => {
    expect(() => decodeBlock(blinkBlock.slice(0, 50))).toThrowError(
      'Invalid UF2 block size. Block size must be exactly 512 bytes.'
    );
  });

  it('should throw an error if the magic number is invalid', () => {
    expect(() => decodeBlock(new Uint8Array([...blinkBlock.slice(0, 511), 0]))).toThrowError(
      'Invalid magic value at offset 508: expected 0xab16f30, but found 0xb16f30.'
    );
  });

  it('should throw an error if the payload size is invalid', () => {
    const block = new Uint8Array([...blinkBlock]);
    block[17] = 0x10;
    expect(() => decodeBlock(block)).toThrowError(
      'Invalid payload size 4096. Should be 476 bytes or less.'
    );
  });
});

describe('encodeBlock', () => {
  it('should correctly encode the first block of blink.uf2', () => {
    expect(
      encodeBlock({
        boardFamily: familyID('Raspberry Pi RP2040') || 0,
        flags: UF2Flags.familyIDPresent,
        flashAddress: 0x10000000,
        blockNumber: 0,
        totalBlocks: 50,
        payload: blinkPayload,
      })
    ).toEqual(blinkBlock);
  });

  it('should throw an error if the payload it too big for a single block', () => {
    expect(() =>
      encodeBlock({
        boardFamily: familyID('Raspberry Pi RP2040') || 0,
        flags: UF2Flags.familyIDPresent,
        flashAddress: 0x10000000,
        blockNumber: 0,
        totalBlocks: 50,
        payload: new Uint8Array(477),
      })
    ).toThrowError('Block payload too big; must be 476 bytes or less.');
  });

  it('should accept a target array as its second argument', () => {
    const target = new Uint8Array(1024);
    expect(
      encodeBlock(
        {
          boardFamily: familyID('Raspberry Pi RP2040') || 0,
          flags: UF2Flags.familyIDPresent,
          flashAddress: 0x10000000,
          blockNumber: 0,
          totalBlocks: 50,
          payload: blinkPayload,
        },
        target,
        512
      )
    );
    expect(target.slice(512)).toEqual(blinkBlock);
  });

  it('should throw an error if the given target array is too small', () => {
    const target = new Uint8Array(1023);
    expect(() =>
      encodeBlock(
        {
          boardFamily: familyID('Raspberry Pi RP2040') || 0,
          flags: UF2Flags.familyIDPresent,
          flashAddress: 0x10000000,
          blockNumber: 0,
          totalBlocks: 50,
          payload: blinkPayload,
        },
        target,
        512
      )
    ).toThrowError(`Can't encode block: target array is too small`);
  });
});
