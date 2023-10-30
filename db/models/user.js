
const { DataTypes } = require("sequelize");

module.exports = (db) => {
    const loadModel = db.define(
        "user",
        {
            caption: DataTypes.TEXT,
            description: DataTypes.TEXT
        },
        {

        }
    );
    return loadModel;
};