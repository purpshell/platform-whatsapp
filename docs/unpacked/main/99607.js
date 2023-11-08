var a = require("../vendor/595318.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AttachMenuPopupItemCamera = function (e) {
  let {
    chat: t,
    onCaptureClick: n
  } = e;
  return i.default.createElement(o.AttachMenuPopupItem, {
    testid: "mi-attach-camera",
    action: () => {
      n();
      r.AttachmentMenuLogger.logAttachMenuClick(t, r.AttachmentMenuTarget.CAMERA);
      return true;
    },
    icon: i.default.createElement("svg", {
      width: "20",
      height: "19",
      viewBox: "0 0 20 19",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg"
    }, i.default.createElement("path", {
      d: "M9.9999 13.04C8.16657 13.04 6.67479 11.5482 6.67479 9.71486C6.67479 7.88153 8.16657 6.38976 9.9999 6.38976C11.8332 6.38976 13.325 7.88153 13.325 9.71486C13.325 11.5482 11.8332 13.04 9.9999 13.04Z",
      fill: "var(--attachment-type-camera-color)"
    }), i.default.createElement("path", {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M14.606 1.6763C14.9347 2.23849 15.5121 2.60821 16.1634 2.60821H16.2429C18.3177 2.60821 20 4.29014 20 6.36531V14.8157C20 16.8902 18.3177 18.5725 16.2429 18.5725H3.7571C1.68226 18.5725 0 16.8902 0 14.8157V6.36531C0 4.29014 1.68226 2.60821 3.7571 2.60821H3.83661C4.48792 2.60821 5.06535 2.23849 5.39398 1.6763C5.98035 0.673833 7.06697 0 8.3126 0H11.6874C12.933 0 14.0193 0.673833 14.606 1.6763ZM9.9999 4.73333C7.25322 4.73333 5.01837 6.96818 5.01837 9.71486C5.01837 12.4615 7.25322 14.6964 9.9999 14.6964C12.7466 14.6964 14.9814 12.4615 14.9814 9.71486C14.9814 6.96818 12.7466 4.73333 9.9999 4.73333Z",
      fill: "var(--attachment-type-camera-color)"
    })),
    text: (0, l.CameraText)()
  });
};
var r = require("./855637.js");
var o = require("./498236.js");
var l = require("./533388.js");
var i = a(require("../vendor/667294.js"));