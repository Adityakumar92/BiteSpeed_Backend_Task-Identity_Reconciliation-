const validator = require("validator");
const connectDB = require("../utils/connection");

const identify = async (req, res, next) => {
    const { email = "", phoneNumber = 0 } = req.body;

    try {
        const db = await connectDB();

        const emailCheck = validator.isEmail(email);
        const phoneNumberCheck = validator.isInt(phoneNumber.toString(), {
            gt: 99999,
            lt: 10000000000
        });

        if (!(emailCheck || phoneNumberCheck)) {
            throw new Error("Invalid Input!");
        }

        // Ensure Contacts table exists
        await db.execute(`
            CREATE TABLE IF NOT EXISTS Contacts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                phoneNumber VARCHAR(15),
                email VARCHAR(255),
                linkedId INT,
                linkPrecedence ENUM('primary', 'secondary') DEFAULT 'primary',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        const newContact = {
            linkedId: null,
            linkPrecedence: "primary",
            email: emailCheck ? email : null,
            phoneNumber: phoneNumberCheck ? phoneNumber.toString() : null
        };

        const output = {
            primaryContactId: null,
            emails: new Set(),
            phoneNumbers: new Set(),
            secondaryContactIds: []
        };

        let matches = [];

        // Fetch matches
        if (emailCheck && phoneNumberCheck) {
            const [rows] = await db.execute(
                `SELECT * FROM Contacts WHERE email = ? OR phoneNumber = ? ORDER BY createdAt ASC`,
                [email, phoneNumber]
            );
            matches = rows;
        } else if (emailCheck || phoneNumberCheck) {
            const condition = emailCheck ? "email = ?" : "phoneNumber = ?";
            const value = emailCheck ? email : phoneNumber.toString();

            const [oldestRow] = await db.execute(
                `SELECT * FROM Contacts WHERE ${condition} ORDER BY createdAt ASC LIMIT 1`,
                [value]
            );

            if (oldestRow.length > 0) {
                const primaryId = oldestRow[0].linkedId || oldestRow[0].id;
                const [related] = await db.execute(
                    `SELECT * FROM Contacts WHERE id = ? OR linkedId = ? ORDER BY createdAt ASC`,
                    [primaryId, primaryId]
                );
                matches = related;
            }
        }

        if (matches.length > 0) {
            const primary = matches[0];
            const idsToUpdate = [];

            newContact.linkedId = primary.id;
            newContact.linkPrecedence = "secondary";
            output.primaryContactId = primary.id;

            let emailFlag = false, phoneNumberFlag = false;

            for (const contact of matches) {
                if (contact.id !== primary.id) {
                    output.secondaryContactIds.push(contact.id);
                    if (contact.linkedId !== primary.id) {
                        idsToUpdate.push(contact.id);
                    }
                }

                if (contact.email) {
                    if (contact.email === email) emailFlag = true;
                    output.emails.add(contact.email);
                }

                if (contact.phoneNumber) {
                    if (contact.phoneNumber === phoneNumber.toString()) phoneNumberFlag = true;
                    output.phoneNumbers.add(contact.phoneNumber);
                }
            }

            // Update mismatched linkedIds
            if (idsToUpdate.length > 0) {
                const placeholders = idsToUpdate.map(() => "?").join(", ");
                await db.execute(
                    `UPDATE Contacts SET linkedId = ?, linkPrecedence = 'secondary' WHERE id IN (${placeholders})`,
                    [primary.id, ...idsToUpdate]
                );
            }

            // Insert new contact if needed
            const shouldInsert =
                (emailCheck && phoneNumberCheck && !(emailFlag && phoneNumberFlag)) ||
                (emailCheck && !emailFlag) ||
                (phoneNumberCheck && !phoneNumberFlag);

            if (shouldInsert) {
                const [insertResult] = await db.execute(
                    `INSERT INTO Contacts (phoneNumber, email, linkedId, linkPrecedence) VALUES (?, ?, ?, ?)`,
                    [newContact.phoneNumber, newContact.email, newContact.linkedId, newContact.linkPrecedence]
                );
                output.secondaryContactIds.push(insertResult.insertId);
            }
        } else {
            // Insert brand new primary contact
            const [insertResult] = await db.execute(
                `INSERT INTO Contacts (phoneNumber, email, linkPrecedence) VALUES (?, ?, ?)`,
                [newContact.phoneNumber, newContact.email, newContact.linkPrecedence]
            );
            output.primaryContactId = insertResult.insertId;
        }

        if (emailCheck) output.emails.add(email);
        if (phoneNumberCheck) output.phoneNumbers.add(phoneNumber.toString());

        res.status(200).json({
            contact: {
                primaryContactId: output.primaryContactId,
                emails: [...output.emails],
                phoneNumbers: [...output.phoneNumbers],
                secondaryContactIds: output.secondaryContactIds
            }
        });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({ error: error.message });
    } finally {
        next();
    }
};

module.exports = identify;
