Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mergeMessageParticipantMixin = function (e, t) {
  const n = function (e) {
    const {
      messageParticipant: t
    } = e;
    return (0, r.smax)("message", {
      participant: (0, a.USER_JID)(t)
    });
  }(t);
  return (0, i.mergeStanzas)(e, n);
};
var r = require("./758616.js");
var i = require("./770006.js");
var a = require("./716358.js");