var a = require("../vendor/595318.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StatusOutlineIcon = function (e) {
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
    name: "status-outline"
  }, f), u.default.createElement("svg", {
    viewBox: (t = p) !== null && t !== undefined ? t : "0 0 24 24",
    height: m,
    width: h,
    preserveAspectRatio: "xMidYMid meet",
    className: (0, i.default)(n),
    fill: "none"
  }, u.default.createElement("path", {
    d: "M13.5627 3.1366C13.6586 2.5927 14.1793 2.22462 14.7109 2.37435C15.7904 2.67838 16.8134 3.16253 17.7359 3.80854C18.9321 4.64621 19.9304 5.73571 20.6605 7.00047C21.3906 8.26523 21.8348 9.67454 21.9619 11.1294C22.06 12.2513 21.9676 13.3793 21.691 14.4662C21.5548 15.0014 20.9756 15.2682 20.4567 15.0792C19.9377 14.8903 19.6769 14.317 19.7996 13.7785C19.9842 12.9693 20.0421 12.1343 19.9695 11.3035C19.8678 10.1396 19.5124 9.01215 18.9284 8.00035C18.3443 6.98854 17.5457 6.11694 16.5887 5.44681C15.9055 4.96841 15.1535 4.60097 14.3605 4.35607C13.8328 4.19311 13.4668 3.68049 13.5627 3.1366Z",
    fill: "currentColor"
  }), u.default.createElement("path", {
    d: "M18.8943 17.785C19.3174 18.14 19.3758 18.7749 18.9803 19.1604C18.1773 19.9433 17.2465 20.5872 16.2257 21.0631C14.9022 21.6802 13.4595 22 11.9992 21.9999C10.5388 21.9998 9.09621 21.6798 7.77275 21.0625C6.75208 20.5864 5.82137 19.9424 5.01843 19.1594C4.62302 18.7739 4.68155 18.1389 5.10467 17.784C5.52779 17.429 6.15471 17.4898 6.55964 17.8653C7.16816 18.4297 7.86233 18.8974 8.61817 19.25C9.67695 19.7438 10.831 19.9998 11.9993 19.9999C13.1676 19.9999 14.3217 19.7441 15.3806 19.2504C16.1365 18.898 16.8307 18.4304 17.4393 17.8661C17.8443 17.4906 18.4712 17.4299 18.8943 17.785Z",
    fill: "currentColor"
  }), u.default.createElement("path", {
    d: "M3.54265 15.078C3.02367 15.2669 2.44458 15.0001 2.30844 14.4648C2.03202 13.378 1.93978 12.2501 2.03794 11.1283C2.16521 9.67358 2.60953 8.26441 3.33966 6.9998C4.06979 5.7352 5.06802 4.64584 6.2642 3.80828C7.18668 3.16237 8.20962 2.6783 9.28902 2.37431C9.82063 2.22459 10.3413 2.59268 10.4372 3.13657C10.5331 3.68047 10.1671 4.19308 9.63938 4.35604C8.84645 4.60091 8.09446 4.96828 7.41133 5.4466C6.45439 6.11664 5.65581 6.98813 5.0717 7.99982C4.4876 9.0115 4.13214 10.1388 4.03032 11.3026C3.95764 12.1334 4.01547 12.9683 4.19986 13.7774C4.32257 14.3159 4.06162 14.8892 3.54265 15.078Z",
    fill: "currentColor"
  }), u.default.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M11.9999 16C14.2091 16 15.9999 14.2091 15.9999 12C15.9999 9.79086 14.2091 8 11.9999 8C9.7908 8 7.99994 9.79086 7.99994 12C7.99994 14.2091 9.7908 16 11.9999 16ZM11.9999 18C15.3136 18 17.9999 15.3137 17.9999 12C17.9999 8.68629 15.3136 6 11.9999 6C8.68623 6 5.99994 8.68629 5.99994 12C5.99994 15.3137 8.68623 18 11.9999 18Z",
    fill: "currentColor"
  })));
};
var r = a(require("../vendor/967154.js"));
var o = a(require("../vendor/506479.js"));
var l = require("../app/220584.js");
var i = a(require("../app/156720.js"));
var u = a(require("../vendor/667294.js"));
const s = ["iconXstyle", "height", "width", "viewBox"];