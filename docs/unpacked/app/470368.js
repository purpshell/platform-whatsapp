var r = require("../vendor/307914.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseNewsletterMetadataIQResponsePayloadMixin = function (e) {
  const t = (0, l.assertTag)(e, "metadata");
  if (!t.success) {
    return t;
  }
  const n = (0, s.parseNewsletterIDMetadataMixin)(e);
  if (!n.success) {
    return n;
  }
  const r = (0, o.parseCommonNewsletterMetadataMixin)(e);
  if (!r.success) {
    return r;
  }
  return (0, a.makeResult)((0, i.default)((0, i.default)({}, n.value), r.value));
};
var i = r(require("../vendor/73982.js"));
var a = require("./135781.js");
var o = require("./738162.js");
var s = require("./829791.js");
var l = require("./686310.js");