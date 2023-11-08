var r = require("../vendor/595318.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.unmuteNewsletterAction = function () {
  return p.apply(this, arguments);
};
var i = r(require("../vendor/348926.js"));
var a = require("./418987.js");
var o = require("./509169.js");
var s = require("./549142.js");
var l = r(require("./358533.js"));
var u = require("./639735.js");
var c = require("./991547.js");
var d = r(require("./556869.js"));
function p() {
  return (p = (0, i.default)(function* (e, t) {
    let {
      eventSurface: n
    } = t;
    if (!e.isNewsletter()) {
      __LOG__(4, undefined, new Error(), true, ["newsletter"])`[newsletter][unmuteNewsletterAction] called with a non-newsletter chat`;
      return void SEND_LOGS("mute-not-a-newsletter", 1, "newsletter");
    }
    try {
      o.NewsletterCoreEventLogger.log({
        eventSurface: n,
        cid: e,
        channelCoreEventType: c.CHANNEL_EVENT_TYPE.UNMUTE
      });
      const t = l.default.get(e);
      if (t == null) {
        throw (0, d.default)("Failed to retrieve newsletter");
      }
      t.mute.promises.unmute = (0, u.unmuteNewsletter)([(0, a.toNewsletterJid)(e.toJid())]).then(() => ({
        status: 200
      })).catch(() => ({
        status: 400
      }));
      yield t.mute.promises.unmute;
      yield s.NewsletterBridgeApi.unmuteNewsletter({
        id: e
      });
    } catch (e) {
      __LOG__(4, undefined, new Error(), true, ["newsletter"])`[newsletter][unmuteNewsletterAction] failed to unmute the newsletter`;
      SEND_LOGS("newsletter-unmute-action-failed", 1, "newsletter");
    }
  })).apply(this, arguments);
}