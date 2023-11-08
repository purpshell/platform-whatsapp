Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseReportMessagesClientErrors = function (e) {
  const t = (0, r.parseIQErrorBadRequestMixin)(e);
  if (t.success) {
    return (0, a.makeResult)({
      name: "IQErrorBadRequest",
      value: t.value
    });
  }
  const n = (0, o.parseIQErrorForbiddenMixin)(e);
  if (n.success) {
    return (0, a.makeResult)({
      name: "IQErrorForbidden",
      value: n.value
    });
  }
  const c = (0, l.parseIQErrorItemNotFoundMixin)(e);
  if (c.success) {
    return (0, a.makeResult)({
      name: "IQErrorItemNotFound",
      value: c.value
    });
  }
  const d = (0, u.parseIQErrorRateOverlimitMixin)(e);
  if (d.success) {
    return (0, a.makeResult)({
      name: "IQErrorRateOverlimit",
      value: d.value
    });
  }
  const f = (0, i.parseIQErrorLockedMixin)(e);
  if (f.success) {
    return (0, a.makeResult)({
      name: "IQErrorLocked",
      value: f.value
    });
  }
  return (0, s.errorMixinDisjunction)(e, ["IQErrorBadRequest", "IQErrorForbidden", "IQErrorItemNotFound", "IQErrorRateOverlimit", "IQErrorLocked"], [t, n, c, d, f]);
};
var a = require("../app/135781.js");
var r = require("../app/452390.js");
var o = require("../app/341963.js");
var l = require("../app/495837.js");
var i = require("../app/457039.js");
var u = require("../app/58511.js");
var s = require("../app/686310.js");