var a = require("../vendor/595318.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ChevronRightIcon = function (e) {
  var t;
  const {
    iconXstyle: n,
    height: a,
    width: c,
    viewBox: d
  } = e;
  const f = (0, o.default)(e, s);
  let p;
  if (d) {
    const {
      x: e = 0,
      y: t = 0,
      width: n = 0,
      height: a = 0
    } = d;
    p = [e, t, n, a].join(" ");
  }
  let m = 30;
  let h = 30;
  if (!(a == null && c == null)) {
    m = a;
    h = c;
  }
  return u.default.createElement(l.BaseSvgSpan, (0, r.default)({
    name: "chevron-right"
  }, f), u.default.createElement("svg", {
    viewBox: (t = p) !== null && t !== undefined ? t : "0 0 30 30",
    height: m,
    width: h,
    preserveAspectRatio: "xMidYMid meet",
    className: (0, i.default)(n),
    version: "1.1",
    x: "0px",
    y: "0px",
    enableBackground: "new 0 0 30 30"
  }, u.default.createElement("path", {
    fill: "currentColor",
    d: "M11,21.212L17.35,15L11,8.65l1.932-1.932L21.215,15l-8.282,8.282L11,21.212z"
  })));
};
var r = a(require("../vendor/967154.js"));
var o = a(require("../vendor/506479.js"));
var l = require("../app/220584.js");
var i = a(require("../app/156720.js"));
var u = a(require("../vendor/667294.js"));
const s = ["iconXstyle", "height", "width", "viewBox"];