Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseServerFrankingTagMixin = function (e) {
  const t = (0, i.flattenedChildWithTag)(e, "franking");
  if (!t.success) {
    return t;
  }
  const n = (0, i.flattenedChildWithTag)(t.value, "reporting_tag");
  if (!n.success) {
    return n;
  }
  const a = (0, i.contentBytesRange)(n.value, 16, 128);
  if (!a.success) {
    return a;
  }
  return (0, r.makeResult)({
    frankingReportingTagElementValue: a.value
  });
};
var r = require("./135781.js");
var i = require("./686310.js");