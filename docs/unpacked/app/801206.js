Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseSetNewsletterMetadataClientErrors = function (e, t) {
  const n = (0, i.parseBadRequestIQErrorResponseMixin)(e, t);
  if (n.success) {
    return (0, r.makeResult)({
      name: "BadRequestIQErrorResponse",
      value: n.value
    });
  }
  const c = (0, a.parseItemNotFoundIQErrorResponseMixin)(e, t);
  if (c.success) {
    return (0, r.makeResult)({
      name: "ItemNotFoundIQErrorResponse",
      value: c.value
    });
  }
  const d = (0, l.parseUnauthorizedIQErrorResponseMixin)(e, t);
  if (d.success) {
    return (0, r.makeResult)({
      name: "UnauthorizedIQErrorResponse",
      value: d.value
    });
  }
  const p = (0, s.parseSuspendedIQErrorResponseMixin)(e, t);
  if (p.success) {
    return (0, r.makeResult)({
      name: "SuspendedIQErrorResponse",
      value: p.value
    });
  }
  const f = (0, o.parseRateLimitedIQErrorResponseMixin)(e, t);
  if (f.success) {
    return (0, r.makeResult)({
      name: "RateLimitedIQErrorResponse",
      value: f.value
    });
  }
  return (0, u.errorMixinDisjunction)(e, ["BadRequestIQErrorResponse", "ItemNotFoundIQErrorResponse", "UnauthorizedIQErrorResponse", "SuspendedIQErrorResponse", "RateLimitedIQErrorResponse"], [n, c, d, p, f]);
};
var r = require("./135781.js");
var i = require("./704663.js");
var a = require("./238929.js");
var o = require("./565914.js");
var s = require("./270663.js");
var l = require("./220472.js");
var u = require("./686310.js");