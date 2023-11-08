var r = require("../vendor/307914.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendCreateRPC = function () {
  return p.apply(this, arguments);
};
var i = r(require("../vendor/311504.js"));
var a = require("./250281.js");
var o = require("./529776.js");
var s = require("./734592.js");
var l = require("./992950.js");
var u = require("./62873.js");
var c = require("./590062.js");
var d = require("./216342.js");
function p() {
  return (p = (0, i.default)(function* (e, t) {
    const n = (0, u.makeCreateRequest)(e);
    const r = yield (0, a.sendSmaxStanza)(n, t);
    const i = (0, l.parseCreateResponseSuccess)(r, n);
    if (i.success) {
      return {
        name: "CreateResponseSuccess",
        value: i.value
      };
    }
    const p = (0, o.parseCreateResponseClientError)(r, n);
    if (p.success) {
      return {
        name: "CreateResponseClientError",
        value: p.value
      };
    }
    const f = (0, s.parseCreateResponseServerError)(r, n);
    if (f.success) {
      return {
        name: "CreateResponseServerError",
        value: f.value
      };
    }
    throw new c.SmaxParsingFailure((0, d.errorMessageRpcParsing)("Create", {
      Success: i,
      ClientError: p,
      ServerError: f
    }));
  })).apply(this, arguments);
}