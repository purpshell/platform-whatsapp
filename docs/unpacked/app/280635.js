var r = require("../vendor/595318.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getIntegrityUpdatesAction = function () {
  return u.apply(this, arguments);
};
var i = r(require("../vendor/348926.js"));
var a = require("./775593.js");
var o = require("./549142.js");
var s = require("./987911.js");
var l = require("./263318.js");
function u() {
  return (u = (0, i.default)(function* (e) {
    let t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : a.JOB_PRIORITY.HIGH;
    try {
      const n = (0, l.toNewsletterJidOrThrow)(e.toJid());
      const r = yield (0, s.getNewsletterIntegrityUpdates)(n, t);
      if (r == null) {
        return;
      }
      const {
        geosuspendedCountriesToAdd: i,
        geosuspendedCountriesToRemove: a,
        violatingMessagesToAdd: u,
        violatingMessagesToRemove: c
      } = r;
      o.NewsletterBridgeApi.updateNewsletterMessageDeliveryUpdate({
        id: e,
        modelUpdatesToAdd: u,
        modelUpdatesToRemove: c
      });
      o.NewsletterBridgeApi.updateGeosuspendedCountry({
        id: e,
        countryCodes: i,
        toAdd: true
      });
      o.NewsletterBridgeApi.updateGeosuspendedCountry({
        id: e,
        countryCodes: a,
        toAdd: false
      });
    } catch (e) {
      __LOG__(4, undefined, new Error(), true, ["newsletter"])`[newsletters][getIntegrityUpdatesAction] Failed to get integrity updates`;
      SEND_LOGS("newsletter-failed-to-get-integrity-updates", 1, "newsletter");
    }
  })).apply(this, arguments);
}