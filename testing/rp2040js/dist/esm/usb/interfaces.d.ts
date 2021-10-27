export declare enum DataDirection {
    HostToDevice = 0,
    DeviceToHost = 1
}
export declare enum SetupType {
    Standard = 0,
    Class = 1,
    Vendor = 2,
    Reserved = 3
}
export declare enum SetupRecipient {
    Device = 0,
    Interface = 1,
    Endpoint = 2,
    Other = 3
}
export declare enum SetupRequest {
    GetStatus = 0,
    ClearFeature = 1,
    Reserved1 = 2,
    SetFeature = 3,
    Reserved2 = 4,
    SetAddress = 5,
    GetDescriptor = 6,
    SetDescriptor = 7,
    GetConfiguration = 8,
    SetDeviceConfiguration = 9,
    GetInterface = 10,
    SetInterface = 11,
    SynchFrame = 12
}
export declare enum DescriptorType {
    Device = 1,
    Configration = 2,
    String = 3,
    Interface = 4,
    Endpoint = 5
}
export interface ISetupPacketParams {
    dataDirection: DataDirection;
    type: SetupType;
    recipient: SetupRecipient;
    bRequest: SetupRequest;
    wValue: number;
    wIndex: number;
    wLength: number;
}
