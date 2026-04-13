import { Sequelize, database, username, password, host, dialect } from "./configDataBase.js";

const sequelize = new Sequelize(database, username, password, {
    host,
    dialect
});

export default sequelize;