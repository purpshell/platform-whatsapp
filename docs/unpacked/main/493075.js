var a = require("../vendor/595318.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.requireBundle = exports.SendLogsPopupLoadable = undefined;
var r = a(require("../vendor/348926.js"));
var o = a(require("./114945.js"));
var l = a(require("../app/97359.js"));
var i = a(require("./205106.js"));
var u = a(require("./621570.js"));
var s = require("../vendor/548360.js");
var c = a(require("../vendor/667294.js"));
const d = (0, i.default)((0, r.default)(function* () {
  const e = yield Promise.all([require.e(8295), require.e(1702), require.e(9488), require.e(2790), require.e(275)]).then(require.bind(require, 457226));
  return (0, l.default)(e);
}), "SendLogsPopup");
exports.requireBundle = d;
const f = (0, o.default)({
  loader: d,
  loading: e => c.default.createElement(u.default, {
    title: s.fbt._("Contact us", null, {
      hk: "115X9P"
    }),
    okText: s.fbt._("send", null, {
      hk: "zH055"
    }),
    error: Boolean(e.error)
  })
});
exports.SendLogsPopupLoadable = f;