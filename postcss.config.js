process.env.BROWSERSLIST_IGNORE_OLD_DATA = "1";
const browserslistEnv = require("browserslist/node");

browserslistEnv.getStat = () => undefined;

module.exports = {
  plugins: [
    require("autoprefixer")({
      overrideBrowserslist: ["defaults"],
      stats: {},
    }),
  ],
};
