# Bitespeed Backend Task: Identity Reconciliation

## 📌 Overview

This project is a backend service built using **Node.js**, **Express.js**, and **MySQL** for the **Bitespeed Backend Task: Identity Reconciliation**.  
It provides a single API endpoint to identify a user based on their `email` and/or `phone number`, and intelligently manages primary and secondary identities.

---

## 🏗️ Tech Stack

- **Node.js**
- **Express.js**
- **MySQL (mysql2/promise)**
- **Postman (for API testing)**

---

## 📌 How to Test the API in Postman

1. Open **Postman**.
2. Select **GET** method.
3. Paste the hosted API URL:  
   ```
   https://bitespeed-backend-task-identity-e4hd.onrender.com/identify
   ```
4. Go to the **Body** section, select **raw**, and choose **JSON** format.
5. Enter the following JSON request body:
   ```json
   {
       "email": "mcfly@hillvalley.edu",
       "phoneNumber": "123456"
   }
   ```
6. Click **Send**.
7. You will get the following response:
   ```json
   {
       "contact": {
           "primaryContactId": 1,
           "emails": [
               "lorraine@hillvalley.edu",
               "mcfly@hillvalley.edu"
           ],
           "phoneNumbers": [
               "123456"
           ],
           "secondaryContactIds": [
               23
           ]
       }
   }
   ```

---
