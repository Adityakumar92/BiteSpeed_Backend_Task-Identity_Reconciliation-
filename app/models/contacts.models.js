const connectDB = require("../utils/connection");
const { DB } = process.env;

const ContactsSchema = `
CREATE DATABASE IF NOT EXISTS \`${DB}\`;

USE \`${DB}\`;

CREATE TABLE IF NOT EXISTS Contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phoneNumber VARCHAR(255),
    email VARCHAR(255),
    linkedId INT,
    linkPrecedence ENUM('secondary', 'primary') DEFAULT 'primary',
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME,
    deletedAt DATETIME
);
`;

async function setupContactsTable() {
    try {
        const db = await connectDB();
        await db.query(ContactsSchema);
        console.log("Contacts table setup complete.");
        await db.end();
    } catch (error) {
        console.error("Error setting up Contacts table:", error.message);
    }
}

module.exports = setupContactsTable;
