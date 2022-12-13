export var DataDirection;
(function (DataDirection) {
    DataDirection[DataDirection["HostToDevice"] = 0] = "HostToDevice";
    DataDirection[DataDirection["DeviceToHost"] = 1] = "DeviceToHost";
})(DataDirection || (DataDirection = {}));
export var SetupType;
(function (SetupType) {
    SetupType[SetupType["Standard"] = 0] = "Standard";
    SetupType[SetupType["Class"] = 1] = "Class";
    SetupType[SetupType["Vendor"] = 2] = "Vendor";
    SetupType[SetupType["Reserved"] = 3] = "Reserved";
})(SetupType || (SetupType = {}));
export var SetupRecipient;
(function (SetupRecipient) {
    SetupRecipient[SetupRecipient["Device"] = 0] = "Device";
    SetupRecipient[SetupRecipient["Interface"] = 1] = "Interface";
    SetupRecipient[SetupRecipient["Endpoint"] = 2] = "Endpoint";
    SetupRecipient[SetupRecipient["Other"] = 3] = "Other";
})(SetupRecipient || (SetupRecipient = {}));
export var SetupRequest;
(function (SetupRequest) {
    SetupRequest[SetupRequest["GetStatus"] = 0] = "GetStatus";
    SetupRequest[SetupRequest["ClearFeature"] = 1] = "ClearFeature";
    SetupRequest[SetupRequest["Reserved1"] = 2] = "Reserved1";
    SetupRequest[SetupRequest["SetFeature"] = 3] = "SetFeature";
    SetupRequest[SetupRequest["Reserved2"] = 4] = "Reserved2";
    SetupRequest[SetupRequest["SetAddress"] = 5] = "SetAddress";
    SetupRequest[SetupRequest["GetDescriptor"] = 6] = "GetDescriptor";
    SetupRequest[SetupRequest["SetDescriptor"] = 7] = "SetDescriptor";
    SetupRequest[SetupRequest["GetConfiguration"] = 8] = "GetConfiguration";
    SetupRequest[SetupRequest["SetDeviceConfiguration"] = 9] = "SetDeviceConfiguration";
    SetupRequest[SetupRequest["GetInterface"] = 10] = "GetInterface";
    SetupRequest[SetupRequest["SetInterface"] = 11] = "SetInterface";
    SetupRequest[SetupRequest["SynchFrame"] = 12] = "SynchFrame";
})(SetupRequest || (SetupRequest = {}));
export var DescriptorType;
(function (DescriptorType) {
    DescriptorType[DescriptorType["Device"] = 1] = "Device";
    DescriptorType[DescriptorType["Configration"] = 2] = "Configration";
    DescriptorType[DescriptorType["String"] = 3] = "String";
    DescriptorType[DescriptorType["Interface"] = 4] = "Interface";
    DescriptorType[DescriptorType["Endpoint"] = 5] = "Endpoint";
})(DescriptorType || (DescriptorType = {}));
