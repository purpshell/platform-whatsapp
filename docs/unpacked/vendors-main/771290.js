var r;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WEEKDAYS = exports.CALENDAR_TYPE_LOCALES = exports.DEPRECATED_CALENDAR_TYPES = exports.CALENDAR_TYPES = undefined;
exports.CALENDAR_TYPES = {
  GREGORY: "gregory",
  HEBREW: "hebrew",
  ISLAMIC: "islamic",
  ISO_8601: "iso8601"
};
exports.DEPRECATED_CALENDAR_TYPES = {
  ARABIC: "Arabic",
  HEBREW: "Hebrew",
  ISO_8601: "ISO 8601",
  US: "US"
};
exports.CALENDAR_TYPE_LOCALES = ((r = {})[exports.CALENDAR_TYPES.GREGORY] = ["en-CA", "en-US", "es-AR", "es-BO", "es-CL", "es-CO", "es-CR", "es-DO", "es-EC", "es-GT", "es-HN", "es-MX", "es-NI", "es-PA", "es-PE", "es-PR", "es-SV", "es-VE", "pt-BR"], r[exports.CALENDAR_TYPES.HEBREW] = ["he", "he-IL"], r[exports.CALENDAR_TYPES.ISLAMIC] = ["ar", "ar-AE", "ar-BH", "ar-DZ", "ar-EG", "ar-IQ", "ar-JO", "ar-KW", "ar-LY", "ar-OM", "ar-QA", "ar-SA", "ar-SD", "ar-SY", "ar-YE", "dv", "dv-MV", "ps", "ps-AR"], r);
exports.WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];