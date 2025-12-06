# Deployment Guide for Kotwal (Node.js + Python NER)

This document provides step-by-step instructions for deploying the Kotwal project, including Node.js backend, Python NER service, environment variables, and required dependencies.

---

## 1. Prerequisites
- Node.js (v16 or higher recommended)
- Python 3.8+
- PostgreSQL database (cloud or local)
- Netlify (for static hosting/testing; note: Netlify does not natively run Node.js servers, so use for static frontend or serverless functions only)

---

## 2. Clone the Repository
```sh
git clone <your-repo-url>
cd kotwal
```

---

## 3. Install Node.js Dependencies
```sh
npm install
```

### Required NPM Libraries
- express
- sequelize
- pg
- pg-hstore
- jsonwebtoken
- bcryptjs
- dotenv
- cors
- body-parser
- (add any other libraries used in your code)

---

## 4. Python NER Service Setup
1. Create a Python virtual environment:
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install required Python packages:
   ```sh
   pip install spacy
   python -m spacy download en_core_web_sm
   # Add any other required packages
   ```
3. Run your NER service (if using Flask or FastAPI, start the server):
   ```sh
   python ner_service.py
   ```

---

## 5. Environment Variables
Create a `.env` file in the root directory with the following variables:
```
PORT=3000
DATABASE_URL=postgres://<user>:<password>@<host>:<port>/<dbname>
JWT_SECRET=your_jwt_secret
PYTHON_NER_URL=http://localhost:5000/ner  # Or wherever your NER service runs
# Add any other required variables
```

---

## 6. Database Setup
- Ensure your PostgreSQL database is running and accessible.
- Run Sequelize migrations (if any) or let the app auto-create tables.

---

## 7. Running the Node.js Server
```sh
npm start
# or
node src/app.js
```

---

## 8. Netlify Deployment Notes
- Netlify is best for static frontends or serverless functions.
- For backend Node.js APIs, use platforms like Heroku, Vercel, AWS, or DigitalOcean.
- If you must use Netlify, consider deploying the backend as serverless functions or use a proxy to your running Node.js server.

---

## 9. Testing
- Use Postman to test API endpoints (see test cases in documentation).
- Verify database changes after each operation.

---

## 10. Troubleshooting
- Ensure all environment variables are set.
- Check logs for errors.
- Make sure both Node.js and Python NER services are running and accessible.

---

For any issues, check the README or contact the maintainer.
