var a = require("../vendor/595318.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ShopIcon = function (e) {
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
    name: "shop"
  }, f), u.default.createElement("svg", {
    viewBox: (t = p) !== null && t !== undefined ? t : "0 0 24 24",
    height: m,
    width: h,
    preserveAspectRatio: "xMidYMid meet",
    className: (0, i.default)(n),
    version: "1.1"
  }, u.default.createElement("path", {
    d: "M11.9071327,2 C14.0034625,2 15.2227003,3.16428094 15.43674,5.27247106 L15.9324472,5.27272727 C17.9567472,5.27272727 19.6573296,6.79482129 19.8808762,8.80674021 L20.7899671,16.9885584 C21.0322623,19.1692155 19.4609095,21.1334065 17.2802524,21.3757017 C17.1345745,21.3918882 16.9881125,21.4 16.8415381,21.4 L6.97272727,21.4 C4.77865058,21.4 3,19.6213494 3,17.4272727 C3,17.2806983 3.00811182,17.1342363 3.02429825,16.9885584 L3.93338916,8.80674021 C4.14948416,6.86188526 5.7457871,5.37474446 7.68050995,5.27776269 L7.88181818,5.27272727 L8.37752533,5.27247106 C8.59156505,3.16428094 9.81080288,2 11.9071327,2 Z M15.9324472,6.67272727 L7.88181818,6.67272727 L7.71207742,6.67826233 C6.47693062,6.7590403 5.46330025,7.71507958 5.32482639,8.96134435 L4.41573548,17.1431625 C4.40525319,17.2375031 4.4,17.3323516 4.4,17.4272727 C4.4,18.8481508 5.55184923,20 6.97272727,20 L16.8415381,20 C16.9364592,20 17.0313077,19.9947468 17.1256483,19.9842645 C18.5378359,19.8273548 19.5554396,18.5553501 19.3985299,17.1431625 L18.489439,8.96134435 C18.3446708,7.65843118 17.2433783,6.67272727 15.9324472,6.67272727 Z M14.7555208,8.54553713 L14.8506156,8.55002336 C15.2346916,8.59412138 15.5102982,8.94122503 15.4662002,9.32530107 C15.2082527,11.571921 13.9710827,12.8090909 11.9071327,12.8090909 C9.84318262,12.8090909 8.6060127,11.571921 8.34806513,9.32530107 C8.30396711,8.94122503 8.57957375,8.59412138 8.96364979,8.55002336 C9.34772583,8.50592534 9.69482948,8.78153199 9.7389275,9.16560802 C9.91936771,10.7371699 10.5912887,11.4090909 11.9071327,11.4090909 C13.2229767,11.4090909 13.8948976,10.7371699 14.0753379,9.16560802 C14.1120862,8.84554466 14.3592551,8.60080726 14.6628902,8.55363847 L14.7555208,8.54553713 Z M11.9071327,3.4 C10.6172322,3.4 9.94591364,3.96060645 9.78307298,5.27122352 L14.0311924,5.27122352 C13.8683517,3.96060645 13.1970332,3.4 11.9071327,3.4 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })));
};
var r = a(require("../vendor/967154.js"));
var o = a(require("../vendor/506479.js"));
var l = require("../app/220584.js");
var i = a(require("../app/156720.js"));
var u = a(require("../vendor/667294.js"));
const s = ["iconXstyle", "height", "width", "viewBox"];