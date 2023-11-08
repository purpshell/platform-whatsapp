var a = require("../vendor/595318.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AttachStickerIcon = function (e) {
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
  let m = 53;
  let h = 53;
  if (!(a == null && c == null)) {
    m = a;
    h = c;
  }
  return u.default.createElement(l.BaseSvgSpan, (0, r.default)({
    name: "attach-sticker"
  }, f), u.default.createElement("svg", {
    viewBox: (t = p) !== null && t !== undefined ? t : "0 0 53 53",
    height: m,
    width: h,
    preserveAspectRatio: "xMidYMid meet",
    className: (0, i.default)(n),
    fill: "none"
  }, u.default.createElement("g", {
    clipPath: "url(#clip0_850:74884)"
  }, u.default.createElement("circle", {
    cx: 26.5,
    cy: 26.5,
    r: 26.5,
    fill: "#0063CB"
  }), u.default.createElement("path", {
    d: "M53 26.5C53 41.1356 41.1355 53 26.5 53C11.8645 53 0 41.1356 0 26.5L53 26.5Z",
    fill: "#0070E6"
  }), u.default.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M36.0017 22.17V26.4891C35.762 26.8114 35.3783 27.0202 34.9458 27.0202H33.1413C29.7615 27.0202 27.0216 29.76 27.0216 33.1398V34.9443C27.0216 35.3777 26.812 35.7621 26.4886 36.0017H22.17C19.3147 36.0017 17 33.687 17 30.8317V22.17C17 19.3147 19.3147 17 22.17 17H30.8317C33.687 17 36.0017 19.3147 36.0017 22.17ZM30.5216 25.5L31.4591 23.4375L33.5216 22.5L31.4591 21.5625L30.5216 19.5L29.5841 21.5625L27.5216 22.5L29.5841 23.4375L30.5216 25.5ZM23.5 22.5L24.9062 25.5938L28 27L24.9062 28.4062L23.5 31.5L22.0938 28.4062L19 27L22.0938 25.5938L23.5 22.5Z",
    fill: "#F7F7F7"
  }), u.default.createElement("path", {
    d: "M34.9458 28.5202C35.2984 28.5202 35.6358 28.4554 35.9469 28.337C35.8132 29.1226 35.439 29.8536 34.868 30.4246L30.4246 34.868C29.8539 35.4388 29.1232 35.8129 28.338 35.9467C28.4566 35.6353 28.5216 35.2974 28.5216 34.9443V33.1398C28.5216 30.5885 30.5899 28.5202 33.1413 28.5202H34.9458Z",
    fill: "#F7F7F7"
  })), u.default.createElement("defs", null, u.default.createElement("clipPath", {
    id: "clip0_850:74884"
  }, u.default.createElement("rect", {
    width: 53,
    height: 53,
    fill: "white"
  })))));
};
var r = a(require("../vendor/967154.js"));
var o = a(require("../vendor/506479.js"));
var l = require("../app/220584.js");
var i = a(require("../app/156720.js"));
var u = a(require("../vendor/667294.js"));
const s = ["iconXstyle", "height", "width", "viewBox"];