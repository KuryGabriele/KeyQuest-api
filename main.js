const express = require('express');
const server = express();
const bodyParser = require('body-parser');
const cors = require("cors");

const OAuth = require("./classes/auth");
const authenticator = new OAuth();

const SQL = require("./classes/mysql");
const database = new SQL(config);

server.use(cors());

server.use((req, res, next) => {
    console.log(req.method, req.url);
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Expose-Headers", "Authorization");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    if (!req.authenticator) req.authenticator = authenticator;
    if (!req.utils) req.utils = require("./classes/utils");
    if (!req.database) req.database = database.getConnection();

    // check if database is connected
    if (!req.database) {
        console.error("Database not connected. Exiting...");
        res.status(500).send({ message: "Database not connected. Exiting..." });
        return;
    }

    next();
})

server.listen(4616, () => console.log("API online and listening on port", 4616));