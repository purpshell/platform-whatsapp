var a = require("../vendor/595318.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.E2EAttachmentV2Icon = function (e) {
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
  let m = 19;
  let h = 21;
  if (!(a == null && c == null)) {
    m = a;
    h = c;
  }
  return u.default.createElement(l.BaseSvgSpan, (0, r.default)({
    name: "e2e-attachment-v2"
  }, f), u.default.createElement("svg", {
    viewBox: (t = p) !== null && t !== undefined ? t : "0 0 21 19",
    height: m,
    width: h,
    preserveAspectRatio: "xMidYMid meet",
    className: (0, i.default)(n),
    fill: "none"
  }, u.default.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M18.5979 16.694C17.5341 17.7781 16.1207 18.3775 14.6167 18.3775C13.1137 18.3775 11.7013 17.7812 10.6375 16.6961L1.07347 6.93913C0.302533 6.15476 -0.0759668 5.13265 0.0126812 4.05974C0.0923652 3.07115 0.562483 2.09069 1.33342 1.30327C2.93008 -0.32338 5.40922 -0.444282 6.86046 1.03606L14.791 9.12468C15.6735 10.0249 15.5848 11.4239 14.5768 12.4572C13.6156 13.4356 12.1494 13.5332 11.3078 12.6767C11.3078 12.6767 7.48397 8.77514 5.78771 7.04485C5.50682 6.75834 5.51978 6.30723 5.73393 6.08879C5.81461 6.00649 5.89831 5.92109 5.97899 5.83879C6.17023 5.64371 6.54673 5.48226 6.93718 5.88054C8.63942 7.61591 12.4533 11.5072 12.4533 11.5072C12.6336 11.6911 13.0897 11.6362 13.4314 11.2887C13.53 11.1892 14.0091 10.6619 13.6445 10.2941L5.71501 2.20354C4.89527 1.36938 3.44503 1.48923 2.47887 2.47173C1.97786 2.9838 1.67609 3.59545 1.62828 4.19389C1.57748 4.78013 1.78464 5.32875 2.21892 5.7697L11.7829 15.5276C12.5399 16.3008 13.5469 16.7245 14.6167 16.7245C15.6884 16.7245 16.6944 16.2987 17.4514 15.5256C18.2084 14.7544 18.6258 13.7283 18.6258 12.6351C18.6258 11.5418 18.2094 10.5146 17.4514 9.74345C17.4514 9.74345 12.1206 4.30361 10.2301 2.37419C10.0727 2.21366 9.96516 1.78283 10.2012 1.54204C10.3397 1.40183 10.4124 1.32769 10.5439 1.19255C10.7441 0.988332 11.0976 0.923332 11.3795 1.21086C13.278 3.1474 18.5979 8.575 18.5979 8.575C19.6607 9.6591 20.2463 11.1008 20.2463 12.634C20.2463 14.1702 19.6607 15.6109 18.5979 16.694Z",
    fill: "#00A884"
  })));
};
var r = a(require("../vendor/967154.js"));
var o = a(require("../vendor/506479.js"));
var l = require("../app/220584.js");
var i = a(require("../app/156720.js"));
var u = a(require("../vendor/667294.js"));
const s = ["iconXstyle", "height", "width", "viewBox"];