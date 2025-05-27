const express = require("express");
const cors = require("cors");
const routes = require("./app/routes");
const setupContactsTable = require("./app/models/contacts.models");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

// Ensure DB connection and table setup before starting server
setupContactsTable().then(() => {
    app.listen(process.env.PORT, () =>
        console.log(`Server running on port ${process.env.PORT}!`)
    );
}).catch((err) => {
    console.error("Failed to initialize database:", err);
});
