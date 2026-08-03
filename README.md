# RPL-Resto-Unikom

## Structure

```text
RestaurantManagementSystem/
├── backend/
├── frontend/          
├── .gitignore
└── README.md
```

---

## Setup

### Backend

```bash
cd be

cp .env.example .env   # Configure database connection

npm install

npx prisma generate

npx prisma db push
# or
# npx prisma migrate dev

npm run dev
```

### Frontend

```bash
cd fe

npm install

npm run dev
```

---



### Authentication

- JWT-based Authentication
- Role-Based Access Control (RBAC)
- Secure Password Hashing with Bcrypt
