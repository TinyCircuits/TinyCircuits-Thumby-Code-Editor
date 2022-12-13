export function opcodeADCS(Rdn, Rm) {
    return (0b0100000101 << 6) | ((Rm & 7) << 3) | (Rdn & 7);
}
export function opcodeADDS1(Rd, Rn, imm3) {
    return (0b0001110 << 9) | ((imm3 & 0x7) << 6) | ((Rn & 7) << 3) | (Rd & 7);
}
export function opcodeADDS2(Rdn, imm8) {
    return (0b00110 << 11) | ((Rdn & 7) << 8) | (imm8 & 0xff);
}
export function opcodeADDspPlusImm(Rd, imm8) {
    return (0b10101 << 11) | ((Rd & 7) << 8) | ((imm8 >> 2) & 0xff);
}
export function opcodeADDsp2(imm) {
    return (0b101100000 << 7) | ((imm >> 2) & 0x7f);
}
export function opcodeADDSreg(Rd, Rn, Rm) {
    return (0b0001100 << 9) | ((Rm & 0x7) << 6) | ((Rn & 7) << 3) | (Rd & 7);
}
export function opcodeADDreg(Rdn, Rm) {
    return (0b01000100 << 8) | ((Rdn & 0x8) << 4) | ((Rm & 0xf) << 3) | (Rdn & 0x7);
}
export function opcodeADR(Rd, imm8) {
    return (0b10100 << 11) | ((Rd & 7) << 8) | ((imm8 >> 2) & 0xff);
}
export function opcodeANDS(Rn, Rm) {
    return (0b0100000000 << 6) | ((Rm & 7) << 3) | (Rn & 0x7);
}
export function opcodeASRS(Rd, Rm, imm5) {
    return (0b00010 << 11) | ((imm5 & 0x1f) << 6) | ((Rm & 0x7) << 3) | (Rd & 0x7);
}
export function opcodeASRSreg(Rdn, Rm) {
    return (0b0100000100 << 6) | ((Rm & 0x7) << 3) | ((Rm & 0x7) << 3) | (Rdn & 0x7);
}
export function opcodeBT1(cond, imm8) {
    return (0b1101 << 12) | ((cond & 0xf) << 8) | ((imm8 >> 1) & 0x1ff);
}
export function opcodeBT2(imm11) {
    return (0b11100 << 11) | ((imm11 >> 1) & 0x7ff);
}
export function opcodeBICS(Rdn, Rm) {
    return (0b0100001110 << 6) | ((Rm & 7) << 3) | (Rdn & 7);
}
export function opcodeBL(imm) {
    const imm11 = (imm >> 1) & 0x7ff;
    const imm10 = (imm >> 12) & 0x3ff;
    const s = imm < 0 ? 1 : 0;
    const j2 = 1 - (((imm >> 22) & 0x1) ^ s);
    const j1 = 1 - (((imm >> 23) & 0x1) ^ s);
    const opcode = (0b1101 << 28) | (j1 << 29) | (j2 << 27) | (imm11 << 16) | (0b11110 << 11) | (s << 10) | imm10;
    return opcode >>> 0;
}
export function opcodeBLX(Rm) {
    return (0b010001111 << 7) | (Rm << 3);
}
export function opcodeBX(Rm) {
    return (0b010001110 << 7) | (Rm << 3);
}
export function opcodeCMN(Rn, Rm) {
    return (0b0100001011 << 6) | ((Rm & 0x7) << 3) | (Rn & 0x7);
}
export function opcodeCMPimm(Rn, Imm8) {
    return (0b00101 << 11) | ((Rn & 0x7) << 8) | (Imm8 & 0xff);
}
export function opcodeCMPregT1(Rn, Rm) {
    return (0b0100001010 << 6) | ((Rm & 0x7) << 3) | (Rn & 0x7);
}
export function opcodeCMPregT2(Rn, Rm) {
    return (0b01000101 << 8) | (((Rn >> 3) & 0x1) << 7) | ((Rm & 0xf) << 3) | (Rn & 0x7);
}
export function opcodeDMBSY() {
    return 0x8f50f3bf;
}
export function opcodeDSBSY() {
    return 0x8f4ff3bf;
}
export function opcodeEORS(Rdn, Rm) {
    return (0b0100000001 << 6) | ((Rm & 0x7) << 3) | (Rdn & 0x7);
}
export function opcodeISBSY() {
    return 0x8f6ff3bf;
}
export function opcodeLDMIA(Rn, registers) {
    return (0b11001 << 11) | ((Rn & 0x7) << 8) | (registers & 0xff);
}
export function opcodeLDRreg(Rt, Rn, Rm) {
    return (0b0101100 << 9) | ((Rm & 0x7) << 6) | ((Rn & 0x7) << 3) | (Rt & 0x7);
}
export function opcodeLDRimm(Rt, Rn, imm5) {
    return (0b01101 << 11) | (((imm5 >> 2) & 0x1f) << 6) | ((Rn & 0x7) << 3) | (Rt & 0x7);
}
export function opcodeLDRlit(Rt, imm8) {
    return (0b01001 << 11) | ((imm8 >> 2) & 0xff) | ((Rt & 0x7) << 8);
}
export function opcodeLDRB(Rt, Rn, imm5) {
    return (0b01111 << 11) | ((imm5 & 0x1f) << 6) | ((Rn & 0x7) << 3) | (Rt & 0x7);
}
export function opcodeLDRsp(Rt, imm8) {
    return (0b10011 << 11) | ((Rt & 7) << 8) | ((imm8 >> 2) & 0xff);
}
export function opcodeLDRBreg(Rt, Rn, Rm) {
    return (0b0101110 << 9) | ((Rm & 0x7) << 6) | ((Rn & 0x7) << 3) | (Rt & 0x7);
}
export function opcodeLDRH(Rt, Rn, imm5) {
    return (0b10001 << 11) | (((imm5 >> 1) & 0xf) << 6) | ((Rn & 0x7) << 3) | (Rt & 0x7);
}
export function opcodeLDRHreg(Rt, Rn, Rm) {
    return (0b0101101 << 9) | ((Rm & 0x7) << 6) | ((Rn & 0x7) << 3) | (Rt & 0x7);
}
export function opcodeLDRSB(Rt, Rn, Rm) {
    return (0b0101011 << 9) | ((Rm & 0x7) << 6) | ((Rn & 0x7) << 3) | (Rt & 0x7);
}
export function opcodeLDRSH(Rt, Rn, Rm) {
    return (0b0101111 << 9) | ((Rm & 0x7) << 6) | ((Rn & 0x7) << 3) | (Rt & 0x7);
}
export function opcodeLSLSreg(Rdn, Rm) {
    return (0b0100000010 << 6) | ((Rm & 0x7) << 3) | (Rdn & 0x7);
}
export function opcodeLSLSimm(Rd, Rm, Imm5) {
    return (0b00000 << 11) | ((Imm5 & 0x1f) << 6) | ((Rm & 0x7) << 3) | (Rd & 0x7);
}
export function opcodeLSRS(Rd, Rm, imm5) {
    return (0b00001 << 11) | ((imm5 & 0x1f) << 6) | ((Rm & 0x7) << 3) | (Rd & 0x7);
}
export function opcodeLSRSreg(Rdn, Rm) {
    return (0b0100000011 << 6) | ((Rm & 0x7) << 3) | (Rdn & 0x7);
}
export function opcodeMOV(Rd, Rm) {
    return (0b01000110 << 8) | ((Rd & 0x8 ? 1 : 0) << 7) | (Rm << 3) | (Rd & 0x7);
}
export function opcodeMOVS(Rd, imm8) {
    return (0b00100 << 11) | ((Rd & 0x7) << 8) | (imm8 & 0xff);
}
export function opcodeMOVSreg(Rd, Rm) {
    return (0b000000000 << 6) | ((Rm & 0x7) << 3) | (Rd & 0x7);
}
export function opcodeMRS(Rd, specReg) {
    return (((0b1000 << 28) | ((Rd & 0xf) << 24) | ((specReg & 0xff) << 16) | 0b1111001111101111) >>> 0);
}
export function opcodeMSR(specReg, Rn) {
    return ((0b10001000 << 24) | ((specReg & 0xff) << 16) | (0b111100111000 << 4) | (Rn & 0xf)) >>> 0;
}
export function opcodeMULS(Rn, Rdm) {
    return (0b0100001101 << 6) | ((Rn & 7) << 3) | (Rdm & 7);
}
export function opcodeMVNS(Rd, Rm) {
    return (0b0100001111 << 6) | ((Rm & 7) << 3) | (Rd & 7);
}
export function opcodeNOP() {
    return 0b1011111100000000;
}
export function opcodeORRS(Rn, Rm) {
    return (0b0100001100 << 6) | ((Rm & 0x7) << 3) | (Rn & 0x7);
}
export function opcodePOP(P, registerList) {
    return (0b1011110 << 9) | ((P ? 1 : 0) << 8) | registerList;
}
export function opcodePUSH(M, registerList) {
    return (0b1011010 << 9) | ((M ? 1 : 0) << 8) | registerList;
}
export function opcodeREV(Rd, Rn) {
    return (0b1011101000 << 6) | ((Rn & 0x7) << 3) | (Rd & 0x7);
}
export function opcodeREV16(Rd, Rn) {
    return (0b1011101001 << 6) | ((Rn & 0x7) << 3) | (Rd & 0x7);
}
export function opcodeREVSH(Rd, Rn) {
    return (0b1011101011 << 6) | ((Rn & 0x7) << 3) | (Rd & 0x7);
}
export function opcodeROR(Rdn, Rm) {
    return (0b0100000111 << 6) | ((Rm & 0x7) << 3) | (Rdn & 0x7);
}
export function opcodeRSBS(Rd, Rn) {
    return (0b0100001001 << 6) | ((Rn & 0x7) << 3) | (Rd & 0x7);
}
export function opcodeSBCS(Rn, Rm) {
    return (0b0100000110 << 6) | ((Rm & 0x7) << 3) | (Rn & 0x7);
}
export function opcodeSTMIA(Rn, registers) {
    return (0b11000 << 11) | ((Rn & 0x7) << 8) | (registers & 0xff);
}
export function opcodeSTR(Rt, Rm, imm5) {
    return (0b01100 << 11) | (((imm5 >> 2) & 0x1f) << 6) | ((Rm & 0x7) << 3) | (Rt & 0x7);
}
export function opcodeSTRsp(Rt, imm8) {
    return (0b10010 << 11) | ((Rt & 7) << 8) | ((imm8 >> 2) & 0xff);
}
export function opcodeSTRreg(Rt, Rn, Rm) {
    return (0b0101000 << 9) | ((Rm & 0x7) << 6) | ((Rn & 0x7) << 3) | (Rt & 0x7);
}
export function opcodeSTRB(Rt, Rm, imm5) {
    return (0b01110 << 11) | ((imm5 & 0x1f) << 6) | ((Rm & 0x7) << 3) | (Rt & 0x7);
}
export function opcodeSTRBreg(Rt, Rn, Rm) {
    return (0b0101010 << 9) | ((Rm & 0x7) << 6) | ((Rn & 0x7) << 3) | (Rt & 0x7);
}
export function opcodeSTRH(Rt, Rm, imm5) {
    return (0b10000 << 11) | (((imm5 >> 1) & 0x1f) << 6) | ((Rm & 0x7) << 3) | (Rt & 0x7);
}
export function opcodeSTRHreg(Rt, Rn, Rm) {
    return (0b0101001 << 9) | ((Rm & 0x7) << 6) | ((Rn & 0x7) << 3) | (Rt & 0x7);
}
export function opcodeSUBS1(Rd, Rn, imm3) {
    return (0b0001111 << 9) | ((imm3 & 0x7) << 6) | ((Rn & 7) << 3) | (Rd & 7);
}
export function opcodeSUBS2(Rdn, imm8) {
    return (0b00111 << 11) | ((Rdn & 7) << 8) | (imm8 & 0xff);
}
export function opcodeSUBSreg(Rd, Rn, Rm) {
    return (0b0001101 << 9) | ((Rm & 0x7) << 6) | ((Rn & 7) << 3) | (Rd & 7);
}
export function opcodeSUBsp(imm) {
    return (0b101100001 << 7) | ((imm >> 2) & 0x7f);
}
export function opcodeSVC(imm8) {
    return (0b11011111 << 8) | (imm8 & 0xff);
}
export function opcodeSXTB(Rd, Rm) {
    return (0b1011001001 << 6) | ((Rm & 7) << 3) | (Rd & 7);
}
export function opcodeSXTH(Rd, Rm) {
    return (0b1011001000 << 6) | ((Rm & 7) << 3) | (Rd & 7);
}
export function opcodeTST(Rm, Rn) {
    return (0b0100001000 << 6) | ((Rn & 7) << 3) | (Rm & 7);
}
export function opcodeUXTB(Rd, Rm) {
    return (0b1011001011 << 6) | ((Rm & 7) << 3) | (Rd & 7);
}
export function opcodeUDF(imm8) {
    return ((0b11011110 << 8) | (imm8 & 0xff)) >>> 0;
}
export function opcodeUDF2(imm16) {
    const imm12 = imm16 & 0xfff;
    const imm4 = (imm16 >> 12) & 0xf;
    return ((0b111101111111 << 4) | imm4 | (0b1010 << 28) | (imm12 << 16)) >>> 0;
}
export function opcodeUXTH(Rd, Rm) {
    return (0b1011001010 << 6) | ((Rm & 7) << 3) | (Rd & 7);
}
export function opcodeWFI() {
    return 0b1011111100110000;
}
export function opcodeYIELD() {
    return 0b1011111100010000;
}
