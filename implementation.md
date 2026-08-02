Restaurant Management System - Implementation Plan
Project Overview

Build a modern full-stack Restaurant Management System.

The application digitizes the entire restaurant operational workflow, starting from table management, ordering, kitchen processing, food delivery, payment, and revenue reporting.

The implementation must strictly follow the business process documentation that has been designed previously.

The project uses a modern client-server architecture with separated frontend and backend.

Tech Stack
Frontend
ReactJS (Vite)
TailwindCSS
React Router DOM
Axios
TanStack Query
React Hook Form
Zod
React Hot Toast
Framer Motion
Lucide React
React Icons
clsx
dayjs
Data Visualization
Recharts
Export Report
SheetJS (xlsx)
file-saver

Backend
ExpressJS
Prisma ORM v6
MySQL
JWT Authentication
Bcrypt
Multer
Express Validator
CORS
Dotenv

Backend

src
│
├── config
├── controllers
├── middleware
├── prisma
├── routes
├── services
├── validations
├── utils
├── app.js
└── index.js

Frontend

src
│
├── assets
├── components
├── context
├── hooks
├── layouts
├── pages
├── routes
├── services
├── utils
└── main.jsx

Coding Rules

The generated project must follow these rules.

Do NOT use Object Oriented Programming.
Use Functional Programming.
Use React Functional Components only.
Separate Controller, Service, Middleware and Route.
Use Prisma ORM only.
Do not write raw SQL unless absolutely necessary.
Use TanStack Query for server state.
Use Axios for API communication.
Use React Hook Form with Zod validation.
Use Express Validator on backend.
Keep every component reusable.
Follow REST API conventions.
Keep code modular.
Use environment variables.
Production-ready folder structure.

UI Rules

The UI has already been designed.

Important Rules

Follow the provided UI exactly.
Do not redesign layouts.
Keep spacing consistent.
Keep typography consistent.
Keep colors consistent.
Keep responsive behavior.
Reuse existing UI components.
Only create missing components if they do not exist.

Design Style

Modern
Clean
Premium Dashboard
Rounded Corner
White Background
Orange Accent
Soft Shadow
Smooth Animation

Primary Color
#F8F3E9
Secondary Color
#C9A96E

User Roles

The application contains five roles.

Customer

Customer does not create an account.

Customer only

Scan QR Code
Input Name
Input Table Number

After validation

Customer enters menu page.

Customer permissions

View Menu
Create Order
Additional Order
View Order Status

Waiter

Permissions

View Table Status
Assign Table
Update Table Status
Receive Kitchen Notification
Deliver Food

Chef

Permissions

View Orders
Process Orders
Update Order Status
Manage Menu
Manage Available Portions

Cashier

Permissions

View Orders
Process Payments
Select Payment Method
Print Receipt
Generate Reports

Manager

Permissions

Dashboard
Revenue Reports
Analytics
Export Reports

Business Process

The implementation must follow this sequence.

1.

Customer arrives.

↓

Waiter checks available table.

↓

Customer is seated.

2.

Customer scans QR Code.

↓

Input

Name
Table Number

↓

View Menu.

↓

Create Order.

3.

Kitchen receives order.

↓

Chef prepares food.

↓

Order completed.

↓

Notification sent to waiter.

4.

Waiter delivers food.

↓

Table status changes to

Dining.

5.

Customer may create additional order.

↓

Kitchen repeats process.

6.

Customer pays at cashier.

↓

Cashier validates payment.

↓

Table becomes Available.

7.

Cashier generates reports.

↓

Manager views reports.

Menu Management

Chef manages

Menu Name
Description
Category
Price
Photo
Available Portion

When portion reaches
0

Status automatically becomes
Unavailable

Otherwise
Available

Table Management

Table Status
Available
Ordering
Dining
Status changes automatically following business process.

Order Management

Each order consists of

Header

Order Number
Customer Name
Table
Date

Detail

Menu
Quantity
Notes
Price

Support

Additional Orders

Payment

Payment Methods

Cash
QRIS
Debit

After successful payment

Transaction stored
Table becomes Available
Reports

Manager can view

Daily Revenue
Weekly Revenue
Monthly Revenue
Yearly Revenue

Charts

Revenue Trend
Best Selling Menu
Orders by Status
Orders by Payment Method

Export

Excel

Database

Use Prisma ORM.

Main Models

meja
-id_meja
-nama_meja
-kapasitas
-status_meja

Pesanan
-id_pesanan
-id_meja
-nama_pelanggan
-tanggal_pesanan
-status_pesanan

detailPesanan
-id_detail
-jumlah
-subtotal
-id_pesanan
-id_menu

Menu
-id_menu
-nama_menu
-deskripsi
-kategori
-harga
-jumlah_porsi
-gambar
-status_menu

Pembayaran
-id_pembayaran
-tanggal_pembayaran
-metode_pembayaran
-total_pembayara
-id_pesanan

Pegawai
-id_pegawai
-nama_pegawai
-username
-password
-role (chef, pelayan, kasir, manager) 
-id_pembayara

Relationships must follow the ERD that has already been designed.

Backend API

Authentication

POST /auth/login

Menu

GET /menu

POST /menu

PUT /menu/:id

DELETE /menu/:id

Tables

GET /tables

PUT /tables/:id

Orders

GET /orders

POST /orders

PUT /orders/:id

GET /orders/:id

Payments

POST /payments

GET /payments

Reports

GET /reports/daily

GET /reports/weekly

GET /reports/monthly

GET /reports/yearly

Frontend Pages

Authentication

Login

Customer

QR Login
Menu
Cart
Order Status

Waiter

Dashboard
Tables
Notifications

Chef

Dashboard
Kitchen Orders
Menu Management

Cashier

Dashboard
Payments
Reports

Manager

Dashboard
Analytics
Reports
Components

Reusable Components

Button
Input
TextArea
Select
Badge
Modal
Drawer
Table
Pagination
Breadcrumb
Sidebar
Navbar
Card
Chart
Toast
Skeleton
Empty State
Confirm Dialog
Authentication

Employee

Username
Password

JWT Authentication

Role Based Access

Customer

No Authentication.

Only

Name
Table Number

after QR Scan.

Implementation Order

Phase 1

Project Initialization

Phase 2

Prisma Database

Phase 3

Authentication

Phase 4

Employee Management

Phase 5

Table Management

Phase 6

Menu Management

Phase 7

Customer Ordering

Phase 8

Kitchen Module

Phase 9

Payment Module

Phase 10

Reports

Phase 11

Dashboard

Phase 12

Testing

Phase 13

Deployment

Final Goal

Generate a complete Restaurant Management System using

ReactJS
TailwindCSS
ExpressJS
Prisma ORM v6
MySQL
JWT Authentication
Clean Architecture
Responsive Design
Modern Dashboard
Excel Export
Recharts
TanStack Query
React Hook Form
Zod
Production Ready Code

Follow the existing UI exactly.

Follow the business process exactly.

Keep all code modular, reusable, scalable, and maintainable.

# Backend Coding Convention

The backend must follow a consistent functional programming style.

## General Rules

- Do NOT use Object Oriented Programming.
- Do NOT use class-based controllers.
- Every controller must be a standalone async function.
- Every controller must use try...catch.
- Every controller must return JSON responses.
- Use async/await.
- Use Prisma ORM directly.
- Authentication uses JWT middleware.
- Password hashing uses bcrypt.
- Validation uses express-validator.
- Upload uses Multer.
- Never use raw SQL unless absolutely necessary.

---

## Controller Style

Every controller must follow this structure.

```javascript
async function controllerName(req, res) {
    authenticateToken(req, res, async () => {

        if (!authenticateToken) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        try {

            // Prisma Query

            return res.status(200).json(result)

        } catch (error) {

            return res.status(500).json({
                message: error.message
            })

        }

    })
}
```

---

## Controller File Naming

```
auth.controller.js

menu.controller.js

table.controller.js

order.controller.js

payment.controller.js

report.controller.js
```

---

## Route Style

```javascript
router.get("/", getMenus)

router.get("/:id", getMenuById)

router.post("/", createMenu)

router.put("/:id", updateMenu)

router.delete("/:id", deleteMenu)
```

---

## Service Layer

Business logic should remain simple.

If logic becomes complex, move reusable logic into services.

Controller is responsible for

- Request
- Response
- Calling Prisma
- Returning HTTP Status

---

## Response Format

Success

```json
{
    "success": true,
    "message": "Menu created successfully",
    "data": {}
}
```

Error

```json
{
    "success": false,
    "message": "Validation Error"
}
```

---

## Prisma Query Style

Always use select instead of returning every field.

Example

```javascript
const menus = await prisma.menu.findMany({
    select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        status: true
    }
})
```

Never expose unnecessary fields.

## Performance

- Lazy Loading Pages
- Code Splitting
- TanStack Query Caching
- Optimized API Calls
- Optimized Component Rendering

## Security

- Password Hashing (bcrypt)
- JWT Authentication
- Protected API
- Input Validation
- CORS Configuration

## Authentication

- JWT Authentication
- Protected Routes
- Role-based Authorization
- Auto Logout when Token Expired
- Persistent Login using Local Storage
- Axios Interceptor

## Forms

- React Hook Form
- Zod Validation
- Client-side Validation
- Server-side Validation
- Disable Button while Submitting
- Input Error Message
- Reset Form after Success

# Additional Requirements

## General

- Fully Responsive (Mobile, Tablet, Desktop)
- Clean Architecture
- Modular Folder Structure
- Reusable Components
- Reusable Hooks
- Reusable API Services
- Environment Variables
- Production Ready Code
- ESLint Configuration
- Consistent Code Style

---

## UI / UX

- Modern Dashboard UI
- Responsive Sidebar
- Mobile Drawer Navigation
- Responsive Data Table
- Sticky Table Header
- Search
- Pagination
- Sorting
- Filtering
- Confirmation Modal
- Toast Notification
- Loading Spinner
- Skeleton Loading
- Empty State
- Error State
- Success State
- Badge Status Color
- Hover Animation
- Smooth Page Transition
- Breadcrumb Navigation