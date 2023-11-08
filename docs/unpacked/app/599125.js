Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addTable = function () {
  const e = (0, r.getStorage)();
  const {
    addColumn: t,
    addUserDefinedPrimaryKey: n
  } = (0, a.columnBuilder)(e.config);
  e.add("collection-version").version((0, i.collectionVersionCreateTable)(), [n("collection"), t("version"), t("state"), t("finiteFailureStartTime"), t("ltHash"), t("isCollectionInMacMismatchFatal"), t("lastSuccessfulSyncEndTime"), t("lastSyncAttemptStartTimes")]).view(e => e);
};
exports.getCollectionVersionTable = function () {
  return (0, r.getStorage)().table("collection-version");
};
var r = require("./732011.js");
var i = require("./612975.js");
var a = require("./322511.js");