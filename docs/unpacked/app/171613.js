Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeActiveIQRequest = function () {
  return (0, r.smax)("iq", {
    id: (0, i.generateId)(),
    type: "set",
    xmlns: "passive",
    to: i.S_WHATSAPP_NET
  }, (0, r.smax)("active", null));
};
var r = require("./758616.js");
var i = require("./716358.js");