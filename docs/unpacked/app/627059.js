var r = require("../vendor/307914.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseFetchMissingPreKeysResponseRequestError = function (e, t) {
  const n = (0, l.assertTag)(e, "iq");
  if (!n.success) {
    return n;
  }
  const r = (0, l.flattenedChildWithTag)(e, "error");
  if (!r.success) {
    return r;
  }
  const u = (0, o.parseIQErrorResponseMixin)(e, t);
  if (!u.success) {
    return u;
  }
  const c = (0, s.parseRequestErrorsFetch)(r.value);
  if (!c.success) {
    return c;
  }
  return (0, a.makeResult)((0, i.default)((0, i.default)({}, u.value), {}, {
    errorRequestErrorsFetch: c.value
  }));
};
var i = r(require("../vendor/73982.js"));
var a = require("./135781.js");
var o = require("./118488.js");
var s = require("./887898.js");
var l = require("./686310.js");