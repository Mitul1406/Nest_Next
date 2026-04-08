# Smart Expense Tracker

A production-ready **REST API** built with **NestJS** that helps users track
personal expenses, set category-wise budgets, and generate detailed spending
reports. Built with clean architecture, JWT authentication, and real-time
budget alerts.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS |
| Language | TypeScript |
| Database | MySQL |
| ORM | TypeORM |
| Auth | JWT + Passport |
| Validation | class-validator + class-transformer |
| Docs | Swagger (OpenAPI) |
| Password | bcryptjs |

---

## Features

- JWT Authentication (Register, Login, Protected Routes)
- Expense CRUD with filters (category, date range, amount range)
- Pagination on expense listing
- Budget management per category per month
- Real-time budget alerts via Interceptor (warning at 80%, exceeded)
- Reports — Monthly, Yearly, Category Breakdown, Dashboard
- Global custom error filter with consistent error format
- CORS enabled
- Swagger UI at `/api/docs`

---
