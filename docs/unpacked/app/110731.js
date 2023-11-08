Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DailyWamEvent = undefined;
var r = require("./901032.js");
var i = require("./158759.js");
var a = require("./969666.js");
var o = require("./510571.js");
var s = require("./845290.js");
var l = require("./493287.js");
var u = require("./110359.js");
const {
  BOOLEAN: c,
  INTEGER: d,
  STRING: p
} = r.TYPES;
const f = (0, r.defineEvents)({
  Daily: [1158, {
    accessibilityVoiceover: [108, c],
    addressbookSize: [11, d],
    addressbookWhatsappSize: [12, d],
    androidAdvertisingId: [135, p],
    androidKeystoreState: [139, i.ANDROID_KEYSTORE_STATE_TYPE],
    androidXmppWorkersRuntime: [167, d],
    appCodeHash: [103, p],
    appStandbyBucket: [121, d],
    autoDlAudioCellular: [90, c],
    autoDlAudioRoaming: [91, c],
    autoDlAudioWifi: [89, c],
    autoDlDocCellular: [96, c],
    autoDlDocRoaming: [97, c],
    autoDlDocWifi: [95, c],
    autoDlImageCellular: [87, c],
    autoDlImageRoaming: [88, c],
    autoDlImageWifi: [86, c],
    autoDlVideoCellular: [93, c],
    autoDlVideoRoaming: [94, c],
    autoDlVideoWifi: [92, c],
    backupNetworkSetting: [10, a.BACKUP_NETWORK_SETTING],
    backupRestoreEncryptionVersion: [138, d],
    backupSchedule: [9, o.BACKUP_SCHEDULE],
    chatDatabaseSize: [19, d],
    chatLockFolderCount: [168, d],
    defaultDisappearingDuration: [140, d],
    deviceLanguage: [153, p],
    entSecurityNotificationsEnabled: [134, c],
    experimentTmoPreloadGroupDaily: [166, d],
    favoritedAnimatedStickerCount: [113, d],
    favoritedFirstPartyStickerCount: [112, d],
    favoritedTotalStickerCount: [111, d],
    installedAnimatedStickerPackCount: [116, d],
    installedAnimatedThirdPartyStickerPackCount: [137, d],
    installedFirstPartyStickerPackCount: [115, d],
    installedTotalStickerPackCount: [114, d],
    ipStr: [122, p],
    keyboardLanguage: [154, p],
    languageCode: [5, p],
    locationCode: [6, p],
    lockFolderHidden: [171, c],
    lowestAppStandbyBucket: [160, d],
    mdPairTime: [124, d],
    mediaFolderFileCount: [21, d],
    mediaFolderSize: [20, d],
    modifiedInternalProps: [155, c],
    networkIsRoaming: [7, c],
    networkOperatorName: [159, p],
    numAccounts: [163, d],
    osBuildNumber: [4, p],
    osNotificationSetting: [118, s.NOTIFICATION_SETTING_TYPE],
    packageName: [102, p],
    passkeyExists: [165, c],
    paymentsIsEnabled: [100, c],
    permissionAccessCoarseLocation: [57, d],
    permissionAccessFineLocation: [58, d],
    permissionCamera: [56, d],
    permissionContacts: [104, c],
    permissionReadExternalStorage: [53, d],
    permissionRecordAudio: [55, d],
    phoneCores: [156, d],
    phoneyid: [162, p],
    privacySettingsAbout: [141, u.PRIVACY_SETTINGS_VALUE_TYPE],
    privacySettingsAboutExceptNum: [142, l.PRIVACY_SETTINGS_CONTACTS_BUCKETS],
    privacySettingsGroups: [143, u.PRIVACY_SETTINGS_VALUE_TYPE],
    privacySettingsGroupsExceptNum: [144, l.PRIVACY_SETTINGS_CONTACTS_BUCKETS],
    privacySettingsLastSeen: [145, u.PRIVACY_SETTINGS_VALUE_TYPE],
    privacySettingsLastSeenExceptNum: [146, l.PRIVACY_SETTINGS_CONTACTS_BUCKETS],
    privacySettingsProfilePhoto: [147, u.PRIVACY_SETTINGS_VALUE_TYPE],
    privacySettingsProfilePhotoExceptNum: [148, l.PRIVACY_SETTINGS_CONTACTS_BUCKETS],
    privacySettingsStatus: [150, u.PRIVACY_SETTINGS_VALUE_TYPE],
    privacySettingsStatusExceptNum: [151, l.PRIVACY_SETTINGS_CONTACTS_BUCKETS],
    privacySettingsStatusShareNum: [152, l.PRIVACY_SETTINGS_CONTACTS_BUCKETS],
    receiptsEnabled: [8, c],
    secretCodeActive: [172, c],
    showMetaAiButtonSetting: [173, c],
    simMcc: [2, d],
    simMnc: [3, d],
    storageAvailSize: [31, d],
    storageTotalSize: [32, d],
    supportedDecoders: [169, p],
    supportedEncoders: [170, p],
    videoFolderFileCount: [23, d],
    videoFolderSize: [22, d]
  }, [1, 1, 1], "regular"]
});
exports.DailyWamEvent = f;