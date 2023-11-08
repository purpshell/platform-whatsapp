var r = require("../vendor/307914.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseSetNewsletterMetadataResponseSuccess = function (e, t) {
  const n = (0, l.assertTag)(e, "iq");
  if (!n.success) {
    return n;
  }
  const r = (0, l.flattenedChildWithTag)(e, "metadata");
  if (!r.success) {
    return r;
  }
  const u = (0, s.parseNewsletterMetadataIQResponsePayloadMixin)(r.value);
  if (!u.success) {
    return u;
  }
  const c = (0, o.parseIQResultResponseMixin)(e, t);
  if (!c.success) {
    return c;
  }
  return (0, a.makeResult)((0, i.default)({
    metadataNewsletterMetadataIQResponsePayloadMixin: u.value
  }, c.value));
};
var i = r(require("../vendor/73982.js"));
var a = require("./135781.js");
var o = require("./822591.js");
var s = require("./470368.js");
var l = require("./686310.js");