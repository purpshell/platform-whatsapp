var a = require("../vendor/595318.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PanelEmojiNatureIcon = function (e) {
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
  let m = 24;
  let h = 24;
  if (!(a == null && c == null)) {
    m = a;
    h = c;
  }
  return u.default.createElement(l.BaseSvgSpan, (0, r.default)({
    name: "panel-emoji-nature"
  }, f), u.default.createElement("svg", {
    viewBox: (t = p) !== null && t !== undefined ? t : "0 0 24 24",
    height: m,
    width: h,
    preserveAspectRatio: "xMidYMid meet",
    className: (0, i.default)(n),
    version: "1.1",
    x: "0px",
    y: "0px",
    enableBackground: "new 0 0 24 24"
  }, u.default.createElement("path", {
    fill: "currentColor",
    d: "M7.2,12.2c0.608,0,1.1,0.627,1.1,1.4S7.808,15,7.2,15s-1.1-0.627-1.1-1.4S6.592,12.2,7.2,12.2z M16.9,12.2 c0.608,0,1.1,0.627,1.1,1.4S17.508,15,16.9,15s-1.1-0.627-1.1-1.4S16.292,12.2,16.9,12.2z M21.5,11.1c-0.3-0.6-0.7-1.4-1.2-2.4 c0.9-0.4,1.7-1.3,2-2.2c0.3-0.7,0.4-2.1-1-3.5l0,0c-1-0.9-2-1.2-2.9-1c-1.1,0.3-1.9,1.2-2.3,1.9c-1.4-0.7-2.9-0.8-4.1-0.8 c-1.5,0-2.8,0.3-4,0.9C7.5,3.1,6.8,2.2,5.7,1.9c-1-0.2-2,0.1-2.9,1l0,0c-1,1-1.4,2.2-1,3.4c0.4,1.1,1.2,1.9,2,2.3 c-0.2,0.5-0.4,1-0.6,1.6L3,10.4c-0.3,0.7-0.5,1.3-0.8,1.9c-0.4,1-0.9,1.9-0.9,3.1c0,1.6,0.8,6.7,10.5,6.7c3.8,0,6.6-0.7,8.5-2.2 s2.2-3.4,2.2-4.3C22.7,13.5,22.3,12.7,21.5,11.1z M18.8,3.5c0.4-0.1,0.9,0.1,1.5,0.6c0.6,0.6,0.8,1.2,0.6,1.8 c-0.2,0.6-0.7,1.1-1.2,1.3c-0.6-1.2-1.3-2-2.1-2.6C17.8,4.2,18.2,3.6,18.8,3.5z M3.3,5.9c-0.2-0.6,0-1.2,0.6-1.8 C4.4,3.6,5,3.4,5.4,3.5c0.5,0.1,1.1,0.7,1.3,1.2C5.8,5.4,5.1,6.2,4.5,7.3C4,7,3.4,6.5,3.3,5.9z M21.1,15.6c0,0.7-0.2,2-1.6,3.1 c-1.5,1.2-4.1,1.8-7.5,1.8c-8.3,0-8.9-3.9-8.9-5.1c0-0.8,0.3-1.5,0.7-2.4c0.3-0.6,0.6-1.2,0.8-2.1l0.1-0.2c0.5-1.5,2-6.2,7.3-6.2 c1.2,0,2.5,0.2,3.7,0.9c0.1,0.1,0.5,0.3,0.5,0.3c0.9,0.7,1.7,1.7,2.4,3.2c0.6,1.3,1,2.2,1.4,2.9C20.8,13.4,21.1,13.9,21.1,15.6z  M14.6,17c-0.1,0.1-0.6,0.4-1.2,0.3c-0.4-0.1-0.7-0.3-0.9-0.8c0-0.1-0.1-0.1-0.1-0.2c0.8-0.1,1.3-0.6,1.3-1.3S13,15,12,15 c-0.9,0-1.7-0.7-1.7,0c0,0.6,0.6,1.2,1.4,1.3l-0.1,0.1c-0.3,0.4-0.5,0.7-0.9,0.8c-0.5,0.1-1.1-0.1-1.3-0.3c-0.2-0.2-0.5-0.1-0.7,0.1 s-0.1,0.5,0.1,0.7c0.1,0.1,0.8,0.5,1.6,0.5c0.2,0,0.4,0,0.5-0.1c0.4-0.1,0.8-0.3,1.1-0.7c0.4,0.4,0.9,0.6,1.2,0.7 c0.8,0.2,1.7-0.2,2-0.5c0.2-0.2,0.2-0.5,0-0.7C15.1,16.9,14.8,16.8,14.6,17z"
  })));
};
var r = a(require("../vendor/967154.js"));
var o = a(require("../vendor/506479.js"));
var l = require("../app/220584.js");
var i = a(require("../app/156720.js"));
var u = a(require("../vendor/667294.js"));
const s = ["iconXstyle", "height", "width", "viewBox"];