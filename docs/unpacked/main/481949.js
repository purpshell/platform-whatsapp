Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseIQErrorResourceLimitMixin = function (e) {
  const t = (0, r.assertTag)(e, "error");
  if (!t.success) {
    return t;
  }
  const n = (0, r.literal)(r.attrString, e, "text", "resource-limit");
  if (!n.success) {
    return n;
  }
  const o = (0, r.literal)(r.attrInt, e, "code", 419);
  if (!o.success) {
    return o;
  }
  return (0, a.makeResult)({
    text: n.value,
    code: o.value
  });
};
var a = require("../app/135781.js");
var r = require("../app/686310.js");