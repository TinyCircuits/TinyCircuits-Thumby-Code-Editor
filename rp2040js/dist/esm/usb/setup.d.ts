import { DescriptorType, ISetupPacketParams } from './interfaces.js';
export declare function createSetupPacket(params: ISetupPacketParams): Uint8Array;
export declare function setDeviceAddressPacket(address: number): Uint8Array;
export declare function getDescriptorPacket(type: DescriptorType, length: number, index?: number): Uint8Array;
export declare function setDeviceConfigurationPacket(configurationNumber: number): Uint8Array;
