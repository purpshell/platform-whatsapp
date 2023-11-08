var a = require("../vendor/307914.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendSubscribeNewsletterRPC = function () {
  return f.apply(this, arguments);
};
var r = a(require("../vendor/311504.js"));
var o = require("../app/250281.js");
var l = require("./585833.js");
var i = require("./508232.js");
var u = require("./654898.js");
var s = require("./415252.js");
var c = require("../app/590062.js");
var d = require("../app/216342.js");
function f() {
  return (f = (0, r.default)(function* (e, t) {
    const n = (0, s.makeSubscribeNewsletterRequest)(e);
    const a = yield (0, o.sendSmaxStanza)(n, t);
    const r = (0, u.parseSubscribeNewsletterResponseSuccess)(a, n);
    if (r.success) {
      return {
        name: "SubscribeNewsletterResponseSuccess",
        value: r.value
      };
    }
    const f = (0, l.parseSubscribeNewsletterResponseClientError)(a, n);
    if (f.success) {
      return {
        name: "SubscribeNewsletterResponseClientError",
        value: f.value
      };
    }
    const p = (0, i.parseSubscribeNewsletterResponseServerError)(a, n);
    if (p.success) {
      return {
        name: "SubscribeNewsletterResponseServerError",
        value: p.value
      };
    }
    throw new c.SmaxParsingFailure((0, d.errorMessageRpcParsing)("SubscribeNewsletter", {
      Success: r,
      ClientError: f,
      ServerError: p
    }));
  })).apply(this, arguments);
}