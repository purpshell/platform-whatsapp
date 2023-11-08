Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseSetSubjectClientErrors = function (e) {
  const t = (0, r.parseIQErrorBadRequestMixin)(e);
  if (t.success) {
    return (0, a.makeResult)({
      name: "IQErrorBadRequest",
      value: t.value
    });
  }
  const n = (0, i.parseIQErrorItemNotFoundMixin)(e);
  if (n.success) {
    return (0, a.makeResult)({
      name: "IQErrorItemNotFound",
      value: n.value
    });
  }
  const p = (0, c.parseIQErrorNotAuthorizedMixin)(e);
  if (p.success) {
    return (0, a.makeResult)({
      name: "IQErrorNotAuthorized",
      value: p.value
    });
  }
  const m = (0, l.parseIQErrorForbiddenMixin)(e);
  if (m.success) {
    return (0, a.makeResult)({
      name: "IQErrorForbidden",
      value: m.value
    });
  }
  const h = (0, s.parseIQErrorNotAcceptableMixin)(e);
  if (h.success) {
    return (0, a.makeResult)({
      name: "IQErrorNotAcceptable",
      value: h.value
    });
  }
  const g = (0, u.parseIQErrorLockedMixin)(e);
  if (g.success) {
    return (0, a.makeResult)({
      name: "IQErrorLocked",
      value: g.value
    });
  }
  const E = (0, d.parseIQErrorRateOverlimitMixin)(e);
  if (E.success) {
    return (0, a.makeResult)({
      name: "IQErrorRateOverlimit",
      value: E.value
    });
  }
  const v = (0, o.parseIQErrorFallbackClientMixin)(e);
  if (v.success) {
    return (0, a.makeResult)({
      name: "IQErrorFallbackClient",
      value: v.value
    });
  }
  return (0, f.errorMixinDisjunction)(e, ["IQErrorBadRequest", "IQErrorItemNotFound", "IQErrorNotAuthorized", "IQErrorForbidden", "IQErrorNotAcceptable", "IQErrorLocked", "IQErrorRateOverlimit", "IQErrorFallbackClient"], [t, n, p, m, h, g, E, v]);
};
var a = require("../app/135781.js");
var r = require("../app/452390.js");
var o = require("../app/996831.js");
var l = require("../app/341963.js");
var i = require("../app/495837.js");
var u = require("../app/457039.js");
var s = require("../app/995767.js");
var c = require("../app/174577.js");
var d = require("../app/58511.js");
var f = require("../app/686310.js");