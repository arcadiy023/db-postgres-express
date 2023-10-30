const path = require("path");
const Sequelize = require("sequelize");
const config = require("../../config/config.json");
const db = {};
const file = require("file");

const basename = path.basename(__filename);

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(
    process.env[config.use_env_variable],
    config.development
  );
} else {
  sequelize = new Sequelize(
    config.development.database,
    config.development.username,
    config.development.password,
    config.development
  );
}

const defOptions = { paranoid: true };

let findFile = [];

function capitalizeFirstLetter(string) {
  if (string === "index") {
    return "";
  }
  return string[0].toUpperCase() + string.slice(1);
}

file.walkSync(__dirname, (dir, dirs, files) => {
  files
    .filter((item) => {
      return (
        (item !== basename || dir.replace(__dirname, "") !== "") &&
        item.slice(-3) === ".js"
      );
    })
    .forEach((item) => {
      findFile.push(path.join(dir, item));
    });
});

const loaderFile = [];

findFile.forEach((item) => {
  const extension = path.extname(item);
  const file = path.basename(item, extension);

  const modelName =
    path.dirname(item.replace(__dirname + path.sep, "")) !== "."
      ? path
          .dirname(item.replace(__dirname + path.sep, ""))
          .split(path.sep)
          .map((item, index) =>
            index === 0 ? item : capitalizeFirstLetter(item)
          )
          .join("") + capitalizeFirstLetter(file)
      : file;

  const model = require(item);

  if (typeof model === "function") {
    const loadModel = model(sequelize, defOptions, modelName);

    if (loadModel) {
      loaderFile.push(
        modelName === loadModel.name
          ? modelName
          : `${modelName} (${loadModel.name})`
      );
      db[loadModel.name] = loadModel;
    }
  }
});

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;

if (typeof console.logUserDone === "function") {
  console.logUserDone("SYSTEM", `DB-models:\n ${loaderFile.join(", ")}`);
} else {
  console.log("SYSTEM", `DB-models:\n ${loaderFile.join(", ")}`);
}

module.exports = db;
