module.exports = function (e) {
  if (e && e.__esModule) {
    return e;
  } else {
    return {
      default: e
    };
  }
};
module.exports.default = module.exports;
module.exports.__esModule = true;