Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseAckRevokeMixin = function (e) {
  const t = (0, i.assertTag)(e, "ack");
  if (!t.success) {
    return t;
  }
  const n = (0, i.literal)(i.attrString, e, "edit", "7");
  if (!n.success) {
    return n;
  }
  return (0, r.makeResult)({
    edit: n.value
  });
};
var r = require("./135781.js");
var i = require("./686310.js");