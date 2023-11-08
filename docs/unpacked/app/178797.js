var r = require("../vendor/307914.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendChatBlockSetRPC = function () {
  return d.apply(this, arguments);
};
var i = r(require("../vendor/311504.js"));
var a = require("./250281.js");
var o = require("./838123.js");
var s = require("./143963.js");
var l = require("./413371.js");
var u = require("./590062.js");
var c = require("./216342.js");
function d() {
  return (d = (0, i.default)(function* (e, t) {
    const n = (0, l.makeChatBlockSetRequest)(e);
    const r = yield (0, a.sendSmaxStanza)(n, t);
    const i = (0, s.parseChatBlockSetResponseSuccess)(r, n);
    if (i.success) {
      return {
        name: "ChatBlockSetResponseSuccess",
        value: i.value
      };
    }
    const d = (0, o.parseChatBlockSetResponseServerError)(r, n);
    if (d.success) {
      return {
        name: "ChatBlockSetResponseServerError",
        value: d.value
      };
    }
    throw new u.SmaxParsingFailure((0, c.errorMessageRpcParsing)("ChatBlockSet", {
      Success: i,
      ServerError: d
    }));
  })).apply(this, arguments);
}