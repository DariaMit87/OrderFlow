# OrderFlow — Restaurant POS and Order Management System

A web-based Point of Sale and kitchen order management prototype built for **Tagliatelle**, a fictional Italian restaurant. Waiters take orders on a browser or tablet, send them to the kitchen, and cooks update the status of each dish in real time.

---

## Minimum System Requirements

| Component | Minimum |
|---|---|
| **OS** | Windows 10, macOS 11, or Ubuntu 20.04 |
| **Node.js** | v18.0.0 or higher |
| **npm** | v9.0.0 or higher |
| **PostgreSQL** | v13.0 or higher |
| **RAM** | 512 MB available |
| **Disk space** | 300 MB (includes node_modules) |
| **Browser** | Chrome 90+, Firefox 90+, Edge 90+, Safari 14+ |
| **Network** | Localhost only (no internet required to run) |

---

## Prerequisites

Before installing, make sure the following are installed on your machine:

1. **Node.js** — download from [https://nodejs.org](https://nodejs.org) (choose the LTS version)
2. **PostgreSQL** — download from [https://www.postgresql.org/download](https://www.postgresql.org/download)

To verify your installations, open a terminal and run:

```
node --version
npm --version
psql --version
```

---

## Installation

### 1. Clone or download the project

```
git clone https://github.com/DariaMit87/OrderFlow.git
cd OrderFlow
```

Or download the ZIP and extract it.

### 2. Install dependencies

```
npm install
```

This installs all required packages listed in `package.json`, including Express, Prisma, Passport, and Pug.

### 3. Configure the environment

Create a `.env` file in the root of the project:

```
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/orderflow"
SESSION_SECRET="any-long-random-string"
PORT=3000
```

Replace `yourpassword` with the password you set during PostgreSQL installation.

> The `.env` file is excluded from version control and must be created manually on each machine.

### 4. Set up the database

Run the Prisma migration to create all tables:

```
npx prisma migrate dev
```

When prompted, enter a migration name such as `init`.

### 5. Seed the database

Populate the database with test users, tables, and the menu:

```
node prisma/seed.js
```

Expected output:

```
Clearing existing data...
Seeding users...
Seeding tables...
Seeding menu...
Done! Database seeded successfully.
```

---

## Running the Application

### Development mode (with auto-restart on file changes)

```
npm run dev
```

### Production mode

```
npm start
```

The application will be available at:

```
http://localhost:3000
```

---

## Test Accounts

All accounts use the password: **`password123`**

| Username | Name | Role |
|---|---|---|
| `waiter1` | James Wilson | Waiter |
| `waiter2` | Emma Thompson | Waiter |
| `cook1` | Oliver Smith | Cook |
| `cook2` | Sarah Johnson | Cook |

---

## Application Workflow

1. Log in as a **waiter** → select a table → create an order → add menu items → submit order to kitchen
2. Log in as a **cook** → view incoming orders on the kitchen dashboard → click **Start Preparing** → click **Mark Ready**
3. Back as **waiter** → view order status → click **Mark Delivered** when items are collected

---

## Project Structure

```
OrderFlow/
├── prisma/
│   ├── schema.prisma       # Database schema and models
│   ├── seed.js             # Test data script
│   └── migrations/         # SQL migration history
├── src/
│   ├── app.js              # Express app setup and middleware
│   ├── server.js           # HTTP server entry point
│   ├── config/
│   │   ├── passport.js     # Authentication strategy
│   │   └── prisma.js       # Shared database client
│   ├── controllers/        # Business logic
│   ├── middleware/         # Authentication and role checks
│   ├── routes/             # URL route definitions
│   └── views/              # Pug HTML templates
├── public/
│   ├── css/styles.css      # Application stylesheet
│   └── js/                 # Client-side scripts
├── .env                    # Environment variables (not in version control)
├── .gitignore
└── package.json
```

---

## Stopping the Application

Press `Ctrl + C` in the terminal where the server is running.
