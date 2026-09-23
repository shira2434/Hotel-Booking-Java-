# 🏨 Grand Hotel - Hotel Management System

A full hotel management system built with React (Frontend) and Java Spring Boot (Backend).

## Project Structure

```
our project/
├── firstproject/       # Backend - Java Spring Boot
└── hotel-client/       # Frontend - React (JavaScript)
```

## Technologies

**Frontend (React):**
- React 19 (JavaScript)
- Axios - server communication
- React Scripts

**Backend (Java):**
- Java + Spring Boot
- Spring Data JPA
- H2 Database (file-based)
- ModelMapper
- BCrypt - password encryption

## Running the Project

### Backend (Java)

```bash
cd firstproject
.\mvnw spring-boot:run
```

Server runs on: `http://localhost:8080`

H2 Console: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:file:./myDB`

### Frontend (React)

```bash
cd hotel-client
npm install
npm start
```

App opens on: `http://localhost:3000`

## Features

| Page | Description |
|---|---|
| 📊 Dashboard | Statistics, room images, occupancy charts |
| 📋 Bookings | Add, cancel, extend, room upgrade, VIP |
| 📅 Calendar | Monthly occupancy view |
| 🛏️ Rooms | Room management, availability by dates |
| 🧹 Housekeeping | Room cleaning status management |
| 👥 Customers | Customer management, VIP tiers |
| 📈 Reports | Charts, monthly report, CSV export |

## Business Logic (Backend)

- **Seasonal Pricing** - Summer/Winter +40%, mid-season +20%, spring +10%
- **VIP Tiers** - BRONZE / SILVER / GOLD with automatic discounts
- **Cancellation Policy** - 100% refund above 7 days, 50% between 3-7, 0% under 3
- **Auto Room Upgrade** - Single → Double → Suite
- **Validations** - Minimum one night, maximum 5 active bookings per customer

## API Endpoints

| Resource | Base URL |
|---|---|
| Rooms | `/rooms` |
| Customers | `/customers` |
| Bookings | `/bookings` |
| Stats | `/bookings/stats` |
| Monthly Report | `/bookings/report/monthly` |
| Top Customers | `/bookings/topCustomers` |

## Deployment

- **Frontend**: [Netlify](https://shira-hotel-booking.netlify.app)
- **Backend**: [Render](https://hotel-booking-java.onrender.com)
