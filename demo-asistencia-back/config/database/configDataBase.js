import { Sequelize } from "sequelize"
import dotenv from "dotenv"

dotenv.config();

const database = process.env.DB_NAME;
const username = process.env.DB_USER_M;
const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;
const dialect = process.env.DB_DIALECT_M;

export { Sequelize, database, username, password, host, dialect }

