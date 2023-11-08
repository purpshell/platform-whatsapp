Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseNewsletterMessageFanoutMixin = function (e) {
  const t = (0, s.assertTag)(e, "message");
  if (!t.success) {
    return t;
  }
  const n = (0, s.attrStanzaId)(e, "id");
  if (!n.success) {
    return n;
  }
  const l = (0, s.attrIntRange)(e, "server_id", 99, 2147476647);
  if (!l.success) {
    return l;
  }
  const u = (0, s.attrIntRange)(e, "t", 0, undefined);
  if (!u.success) {
    return u;
  }
  const c = (0, s.optionalLiteral)(s.attrString, e, "is_sender", "true");
  if (!c.success) {
    return c;
  }
  const d = (0, o.parseNewsletterMessageOriginalTimestampMixin)(e);
  const p = (0, a.parseNewsletterMessageLastEditTimestampMixin)(e);
  const f = (0, i.parseNewsletterMessageFanoutContent)(e);
  if (!f.success) {
    return f;
  }
  return (0, r.makeResult)({
    id: n.value,
    serverId: l.value,
    t: u.value,
    isSender: c.value,
    newsletterMessageOriginalTimestampMixin: d.success ? d.value : null,
    newsletterMessageLastEditTimestampMixin: p.success ? p.value : null,
    newsletterMessageFanoutContent: f.value
  });
};
var r = require("./135781.js");
var i = require("./875855.js");
var a = require("./490268.js");
var o = require("./288675.js");
var s = require("./686310.js");