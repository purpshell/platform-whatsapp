Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mergeBaseIQGetRequestMixin = function (e) {
  const t = (0, r.smax)("iq", {
    id: (0, a.generateId)(),
    type: "get"
  });
  return (0, i.mergeStanzas)(e, t);
};
var r = require("./758616.js");
var i = require("./770006.js");
var a = require("./716358.js");