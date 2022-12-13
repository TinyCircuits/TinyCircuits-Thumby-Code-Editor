"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.opcodePOP = exports.opcodeORRS = exports.opcodeNOP = exports.opcodeMVNS = exports.opcodeMULS = exports.opcodeMSR = exports.opcodeMRS = exports.opcodeMOVSreg = exports.opcodeMOVS = exports.opcodeMOV = exports.opcodeLSRSreg = exports.opcodeLSRS = exports.opcodeLSLSimm = exports.opcodeLSLSreg = exports.opcodeLDRSH = exports.opcodeLDRSB = exports.opcodeLDRHreg = exports.opcodeLDRH = exports.opcodeLDRBreg = exports.opcodeLDRsp = exports.opcodeLDRB = exports.opcodeLDRlit = exports.opcodeLDRimm = exports.opcodeLDRreg = exports.opcodeLDMIA = exports.opcodeISBSY = exports.opcodeEORS = exports.opcodeDSBSY = exports.opcodeDMBSY = exports.opcodeCMPregT2 = exports.opcodeCMPregT1 = exports.opcodeCMPimm = exports.opcodeCMN = exports.opcodeBX = exports.opcodeBLX = exports.opcodeBL = exports.opcodeBICS = exports.opcodeBT2 = exports.opcodeBT1 = exports.opcodeASRSreg = exports.opcodeASRS = exports.opcodeANDS = exports.opcodeADR = exports.opcodeADDreg = exports.opcodeADDSreg = exports.opcodeADDsp2 = exports.opcodeADDspPlusImm = exports.opcodeADDS2 = exports.opcodeADDS1 = exports.opcodeADCS = void 0;
exports.opcodeYIELD = exports.opcodeWFI = exports.opcodeUXTH = exports.opcodeUDF2 = exports.opcodeUDF = exports.opcodeUXTB = exports.opcodeTST = exports.opcodeSXTH = exports.opcodeSXTB = exports.opcodeSVC = exports.opcodeSUBsp = exports.opcodeSUBSreg = exports.opcodeSUBS2 = exports.opcodeSUBS1 = exports.opcodeSTRHreg = exports.opcodeSTRH = exports.opcodeSTRBreg = exports.opcodeSTRB = exports.opcodeSTRreg = exports.opcodeSTRsp = exports.opcodeSTR = exports.opcodeSTMIA = exports.opcodeSBCS = exports.opcodeRSBS = exports.opcodeROR = exports.opcodeREVSH = exports.opcodeREV16 = exports.opcodeREV = exports.opcodePUSH = void 0;
function opcodeADCS(Rdn, Rm) {
    return (0b0100000101 << 6) | ((Rm & 7) << 3) | (Rdn & 7);
}
exports.opcodeADCS = opcodeADCS;
function opcodeADDS1(Rd, Rn, imm3) {
    return (0b0001110 << 9) | ((imm3 & 0x7) << 6) | ((Rn & 7) << 3) | (Rd & 7);
}
exports.opcodeADDS1 = opcodeADDS1;
function opcodeADDS2(Rdn, imm8) {
    return (0b00110 << 11) | ((Rdn & 7) << 8) | (imm8 & 0xff);
}
exports.opcodeADDS2 = opcodeADDS2;
function opcodeADDspPlusImm(Rd, imm8) {
    return (0b10101 << 11) | ((Rd & 7) << 8) | ((imm8 >> 2) & 0xff);
}
exports.opcodeADDspPlusImm = opcodeADDspPlusImm;
function opcodeADDsp2(imm) {
    return (0b101100000 << 7) | ((imm >> 2) & 0x7f);
}
exports.opcodeADDsp2 = opcodeADDsp2;
function opcodeADDSreg(Rd, Rn, Rm) {
    return (0b0001100 << 9) | ((Rm & 0x7) << 6) | ((Rn & 7) << 3) | (Rd & 7);
}
exports.opcodeADDSreg = opcodeADDSreg;
function opcodeADDreg(Rdn, Rm) {
    return (0b01000100 << 8) | ((Rdn & 0x8) << 4) | ((Rm & 0xf) << 3) | (Rdn & 0x7);
}
exports.opcodeADDreg = opcodeADDreg;
function opcodeADR(Rd, imm8) {
    return (0b10100 << 11) | ((Rd & 7) << 8) | ((imm8 >> 2) & 0xff);
}
exports.opcodeADR = opcodeADR;
function opcodeANDS(Rn, Rm) {
    return (0b0100000000 << 6) | ((Rm & 7) << 3) | (Rn & 0x7);
}
exports.opcodeANDS = opcodeANDS;
function opcodeASRS(Rd, Rm, imm5) {
    return (0b00010 << 11) | ((imm5 & 0x1f) << 6) | ((Rm & 0x7) << 3) | (Rd & 0x7);
}
exports.opcodeASRS = opcodeASRS;
function opcodeASRSreg(Rdn, Rm) {
    return (0b0100000100 << 6) | ((Rm & 0x7) << 3) | ((Rm & 0x7) << 3) | (Rdn & 0x7);
}
exports.opcodeASRSreg = opcodeASRSreg;
function opcodeBT1(cond, imm8) {
    return (0b1101 << 12) | ((cond & 0xf) << 8) | ((imm8 >> 1) & 0x1ff);
}
exports.opcodeBT1 = opcodeBT1;
function opcodeBT2(imm11) {
    return (0b11100 << 11) | ((imm11 >> 1) & 0x7ff);
}
exports.opcodeBT2 = opcodeBT2;
function opcodeBICS(Rdn, Rm) {
    return (0b0100001110 << 6) | ((Rm & 7) << 3) | (Rdn & 7);
}
exports.opcodeBICS = opcodeBICS;
function opcodeBL(imm) {
    const imm11 = (imm >> 1) & 0x7ff;
    const imm10 = (imm >> 12) & 0x3ff;
    const s = imm < 0 ? 1 : 0;
    const j2 = 1 - (((imm >> 22) & 0x1) ^ s);
    const j1 = 1 - (((imm >> 23) & 0x1) ^ s);
    const opcode = (0b1101 << 28) | (j1 << 29) | (j2 << 27) | (imm11 << 16) | (0b11110 << 11) | (s << 10) | imm10;
    return opcode >>> 0;
}
exports.opcodeBL = opcodeBL;
function opcodeBLX(Rm) {
    return (0b010001111 << 7) | (Rm << 3);
}
exports.opcodeBLX = opcodeBLX;
function opcodeBX(Rm) {
    return (0b010001110 << 7) | (Rm << 3);
}
exports.opcodeBX = opcodeBX;
function opcodeCMN(Rn, Rm) {
    return (0b0100001011 << 6) | ((Rm & 0x7) << 3) | (Rn & 0x7);
}
exports.opcodeCMN = opcodeCMN;
function opcodeCMPimm(Rn, Imm8) {
    return (0b00101 << 11) | ((Rn & 0x7) << 8) | (Imm8 & 0xff);
}
exports.opcodeCMPimm = opcodeCMPimm;
function opcodeCMPregT1(Rn, Rm) {
    return (0b0100001010 << 6) | ((Rm & 0x7) << 3) | (Rn & 0x7);
}
exports.opcodeCMPregT1 = opcodeCMPregT1;
function opcodeCMPregT2(Rn, Rm) {
    return (0b01000101 << 8) | (((Rn >> 3) & 0x1) << 7) | ((Rm & 0xf) << 3) | (Rn & 0x7);
}
exports.opcodeCMPregT2 = opcodeCMPregT2;
function opcodeDMBSY() {
    return 0x8f50f3bf;
}
exports.opcodeDMBSY = opcodeDMBSY;
function opcodeDSBSY() {
    return 0x8f4ff3bf;
}
exports.opcodeDSBSY = opcodeDSBSY;
function opcodeEORS(Rdn, Rm) {
    return (0b0100000001 << 6) | ((Rm & 0x7) << 3) | (Rdn & 0x7);
}
exports.opcodeEORS = opcodeEORS;
function opcodeISBSY() {
    return 0x8f6ff3bf;
}
exports.opcodeISBSY = opcodeISBSY;
function opcodeLDMIA(Rn, registers) {
    return (0b11001 << 11) | ((Rn & 0x7) << 8) | (registers & 0xff);
}
exports.opcodeLDMIA = opcodeLDMIA;
function opcodeLDRreg(Rt, Rn, Rm) {
    return (0b0101100 << 9) | ((Rm & 0x7) << 6) | ((Rn & 0x7) << 3) | (Rt & 0x7);
}
exports.opcodeLDRreg = opcodeLDRreg;
function opcodeLDRimm(Rt, Rn, imm5) {
    return (0b01101 << 11) | (((imm5 >> 2) & 0x1f) << 6) | ((Rn & 0x7) << 3) | (Rt & 0x7);
}
exports.opcodeLDRimm = opcodeLDRimm;
function opcodeLDRlit(Rt, imm8) {
    return (0b01001 << 11) | ((imm8 >> 2) & 0xff) | ((Rt & 0x7) << 8);
}
exports.opcodeLDRlit = opcodeLDRlit;
function opcodeLDRB(Rt, Rn, imm5) {
    return (0b01111 << 11) | ((imm5 & 0x1f) << 6) | ((Rn & 0x7) << 3) | (Rt & 0x7);
}
exports.opcodeLDRB = opcodeLDRB;
function opcodeLDRsp(Rt, imm8) {
    return (0b10011 << 11) | ((Rt & 7) << 8) | ((imm8 >> 2) & 0xff);
}
exports.opcodeLDRsp = opcodeLDRsp;
function opcodeLDRBreg(Rt, Rn, Rm) {
    return (0b0101110 << 9) | ((Rm & 0x7) << 6) | ((Rn & 0x7) << 3) | (Rt & 0x7);
}
exports.opcodeLDRBreg = opcodeLDRBreg;
function opcodeLDRH(Rt, Rn, imm5) {
    return (0b10001 << 11) | (((imm5 >> 1) & 0xf) << 6) | ((Rn & 0x7) << 3) | (Rt & 0x7);
}
exports.opcodeLDRH = opcodeLDRH;
function opcodeLDRHreg(Rt, Rn, Rm) {
    return (0b0101101 << 9) | ((Rm & 0x7) << 6) | ((Rn & 0x7) << 3) | (Rt & 0x7);
}
exports.opcodeLDRHreg = opcodeLDRHreg;
function opcodeLDRSB(Rt, Rn, Rm) {
    return (0b0101011 << 9) | ((Rm & 0x7) << 6) | ((Rn & 0x7) << 3) | (Rt & 0x7);
}
exports.opcodeLDRSB = opcodeLDRSB;
function opcodeLDRSH(Rt, Rn, Rm) {
    return (0b0101111 << 9) | ((Rm & 0x7) << 6) | ((Rn & 0x7) << 3) | (Rt & 0x7);
}
exports.opcodeLDRSH = opcodeLDRSH;
function opcodeLSLSreg(Rdn, Rm) {
    return (0b0100000010 << 6) | ((Rm & 0x7) << 3) | (Rdn & 0x7);
}
exports.opcodeLSLSreg = opcodeLSLSreg;
function opcodeLSLSimm(Rd, Rm, Imm5) {
    return (0b00000 << 11) | ((Imm5 & 0x1f) << 6) | ((Rm & 0x7) << 3) | (Rd & 0x7);
}
exports.opcodeLSLSimm = opcodeLSLSimm;
function opcodeLSRS(Rd, Rm, imm5) {
    return (0b00001 << 11) | ((imm5 & 0x1f) << 6) | ((Rm & 0x7) << 3) | (Rd & 0x7);
}
exports.opcodeLSRS = opcodeLSRS;
function opcodeLSRSreg(Rdn, Rm) {
    return (0b0100000011 << 6) | ((Rm & 0x7) << 3) | (Rdn & 0x7);
}
exports.opcodeLSRSreg = opcodeLSRSreg;
function opcodeMOV(Rd, Rm) {
    return (0b01000110 << 8) | ((Rd & 0x8 ? 1 : 0) << 7) | (Rm << 3) | (Rd & 0x7);
}
exports.opcodeMOV = opcodeMOV;
function opcodeMOVS(Rd, imm8) {
    return (0b00100 << 11) | ((Rd & 0x7) << 8) | (imm8 & 0xff);
}
exports.opcodeMOVS = opcodeMOVS;
function opcodeMOVSreg(Rd, Rm) {
    return (0b000000000 << 6) | ((Rm & 0x7) << 3) | (Rd & 0x7);
}
exports.opcodeMOVSreg = opcodeMOVSreg;
function opcodeMRS(Rd, specReg) {
    return (((0b1000 << 28) | ((Rd & 0xf) << 24) | ((specReg & 0xff) << 16) | 0b1111001111101111) >>> 0);
}
exports.opcodeMRS = opcodeMRS;
function opcodeMSR(specReg, Rn) {
    return ((0b10001000 << 24) | ((specReg & 0xff) << 16) | (0b111100111000 << 4) | (Rn & 0xf)) >>> 0;
}
exports.opcodeMSR = opcodeMSR;
function opcodeMULS(Rn, Rdm) {
    return (0b0100001101 << 6) | ((Rn & 7) << 3) | (Rdm & 7);
}
exports.opcodeMULS = opcodeMULS;
function opcodeMVNS(Rd, Rm) {
    return (0b0100001111 << 6) | ((Rm & 7) << 3) | (Rd & 7);
}
exports.opcodeMVNS = opcodeMVNS;
function opcodeNOP() {
    return 0b1011111100000000;
}
exports.opcodeNOP = opcodeNOP;
function opcodeORRS(Rn, Rm) {
    return (0b0100001100 << 6) | ((Rm & 0x7) << 3) | (Rn & 0x7);
}
exports.opcodeORRS = opcodeORRS;
function opcodePOP(P, registerList) {
    return (0b1011110 << 9) | ((P ? 1 : 0) << 8) | registerList;
}
exports.opcodePOP = opcodePOP;
function opcodePUSH(M, registerList) {
    return (0b1011010 << 9) | ((M ? 1 : 0) << 8) | registerList;
}
exports.opcodePUSH = opcodePUSH;
function opcodeREV(Rd, Rn) {
    return (0b1011101000 << 6) | ((Rn & 0x7) << 3) | (Rd & 0x7);
}
exports.opcodeREV = opcodeREV;
function opcodeREV16(Rd, Rn) {
    return (0b1011101001 << 6) | ((Rn & 0x7) << 3) | (Rd & 0x7);
}
exports.opcodeREV16 = opcodeREV16;
function opcodeREVSH(Rd, Rn) {
    return (0b1011101011 << 6) | ((Rn & 0x7) << 3) | (Rd & 0x7);
}
exports.opcodeREVSH = opcodeREVSH;
function opcodeROR(Rdn, Rm) {
    return (0b0100000111 << 6) | ((Rm & 0x7) << 3) | (Rdn & 0x7);
}
exports.opcodeROR = opcodeROR;
function opcodeRSBS(Rd, Rn) {
    return (0b0100001001 << 6) | ((Rn & 0x7) << 3) | (Rd & 0x7);
}
exports.opcodeRSBS = opcodeRSBS;
function opcodeSBCS(Rn, Rm) {
    return (0b0100000110 << 6) | ((Rm & 0x7) << 3) | (Rn & 0x7);
}
exports.opcodeSBCS = opcodeSBCS;
function opcodeSTMIA(Rn, registers) {
    return (0b11000 << 11) | ((Rn & 0x7) << 8) | (registers & 0xff);
}
exports.opcodeSTMIA = opcodeSTMIA;
function opcodeSTR(Rt, Rm, imm5) {
    return (0b01100 << 11) | (((imm5 >> 2) & 0x1f) << 6) | ((Rm & 0x7) << 3) | (Rt & 0x7);
}
exports.opcodeSTR = opcodeSTR;
function opcodeSTRsp(Rt, imm8) {
    return (0b10010 << 11) | ((Rt & 7) << 8) | ((imm8 >> 2) & 0xff);
}
exports.opcodeSTRsp = opcodeSTRsp;
function opcodeSTRreg(Rt, Rn, Rm) {
    return (0b0101000 << 9) | ((Rm & 0x7) << 6) | ((Rn & 0x7) << 3) | (Rt & 0x7);
}
exports.opcodeSTRreg = opcodeSTRreg;
function opcodeSTRB(Rt, Rm, imm5) {
    return (0b01110 << 11) | ((imm5 & 0x1f) << 6) | ((Rm & 0x7) << 3) | (Rt & 0x7);
}
exports.opcodeSTRB = opcodeSTRB;
function opcodeSTRBreg(Rt, Rn, Rm) {
    return (0b0101010 << 9) | ((Rm & 0x7) << 6) | ((Rn & 0x7) << 3) | (Rt & 0x7);
}
exports.opcodeSTRBreg = opcodeSTRBreg;
function opcodeSTRH(Rt, Rm, imm5) {
    return (0b10000 << 11) | (((imm5 >> 1) & 0x1f) << 6) | ((Rm & 0x7) << 3) | (Rt & 0x7);
}
exports.opcodeSTRH = opcodeSTRH;
function opcodeSTRHreg(Rt, Rn, Rm) {
    return (0b0101001 << 9) | ((Rm & 0x7) << 6) | ((Rn & 0x7) << 3) | (Rt & 0x7);
}
exports.opcodeSTRHreg = opcodeSTRHreg;
function opcodeSUBS1(Rd, Rn, imm3) {
    return (0b0001111 << 9) | ((imm3 & 0x7) << 6) | ((Rn & 7) << 3) | (Rd & 7);
}
exports.opcodeSUBS1 = opcodeSUBS1;
function opcodeSUBS2(Rdn, imm8) {
    return (0b00111 << 11) | ((Rdn & 7) << 8) | (imm8 & 0xff);
}
exports.opcodeSUBS2 = opcodeSUBS2;
function opcodeSUBSreg(Rd, Rn, Rm) {
    return (0b0001101 << 9) | ((Rm & 0x7) << 6) | ((Rn & 7) << 3) | (Rd & 7);
}
exports.opcodeSUBSreg = opcodeSUBSreg;
function opcodeSUBsp(imm) {
    return (0b101100001 << 7) | ((imm >> 2) & 0x7f);
}
exports.opcodeSUBsp = opcodeSUBsp;
function opcodeSVC(imm8) {
    return (0b11011111 << 8) | (imm8 & 0xff);
}
exports.opcodeSVC = opcodeSVC;
function opcodeSXTB(Rd, Rm) {
    return (0b1011001001 << 6) | ((Rm & 7) << 3) | (Rd & 7);
}
exports.opcodeSXTB = opcodeSXTB;
function opcodeSXTH(Rd, Rm) {
    return (0b1011001000 << 6) | ((Rm & 7) << 3) | (Rd & 7);
}
exports.opcodeSXTH = opcodeSXTH;
function opcodeTST(Rm, Rn) {
    return (0b0100001000 << 6) | ((Rn & 7) << 3) | (Rm & 7);
}
exports.opcodeTST = opcodeTST;
function opcodeUXTB(Rd, Rm) {
    return (0b1011001011 << 6) | ((Rm & 7) << 3) | (Rd & 7);
}
exports.opcodeUXTB = opcodeUXTB;
function opcodeUDF(imm8) {
    return ((0b11011110 << 8) | (imm8 & 0xff)) >>> 0;
}
exports.opcodeUDF = opcodeUDF;
function opcodeUDF2(imm16) {
    const imm12 = imm16 & 0xfff;
    const imm4 = (imm16 >> 12) & 0xf;
    return ((0b111101111111 << 4) | imm4 | (0b1010 << 28) | (imm12 << 16)) >>> 0;
}
exports.opcodeUDF2 = opcodeUDF2;
function opcodeUXTH(Rd, Rm) {
    return (0b1011001010 << 6) | ((Rm & 7) << 3) | (Rd & 7);
}
exports.opcodeUXTH = opcodeUXTH;
function opcodeWFI() {
    return 0b1011111100110000;
}
exports.opcodeWFI = opcodeWFI;
function opcodeYIELD() {
    return 0b1011111100010000;
}
exports.opcodeYIELD = opcodeYIELD;
