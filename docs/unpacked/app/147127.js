Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mergeProfilePictureTypeMixin = function (e, t) {
  const n = function (e) {
    const {
      pictureType: t
    } = e;
    return (0, r.smax)("picture", {
      type: (0, a.CUSTOM_STRING)(t)
    });
  }(t);
  return (0, i.mergeStanzas)(e, n);
};
var r = require("./758616.js");
var i = require("./770006.js");
var a = require("./716358.js");