# BookNest - Student Book Marketplace & Rental Platform

BookNest is a production-grade, multi-page web platform designed for college campus students to browse, buy, rent, and sell academic textbooks, while providing college administration with a comprehensive back-office management suite.

---

## 🌟 Key Features

### 🎓 Student Marketplace
- **Home & Search Discovery**: Full-text textbook search, discipline shortcuts, featured textbook recommendations, semester rental showcase.
- **Advanced Browse & Filter**: Real-time filtering by Academic Department, Subject, Semester (Sem 1–8), Book Condition, Price Range, and Availability (Buy vs Rent).
- **Textbook Details & Gallery**: Multi-image textbook view, syllabus specs, dual buy/rent pricing cards, seller verified status.
- **Smart Shopping Cart**: Dual Buy / Rent item breakdown, dynamic quantity adjustments, delivery calculation.
- **Seamless Campus Checkout**: Choice between Central Campus Library pickup or Hostel room delivery with payment simulation.
- **Student Order Tracking**: Live order fulfillment milestones (`Placed` → `Confirmed` → `Processing` → `Ready for Pickup` → `Completed`).
- **Semester Rental Tracker**: Countdown timers, return due dates, and one-click library return check-in.
- **Peer-to-Peer Selling**: Sell used textbooks with native device photo uploader (`<input type="file">`), syllabus description, and listing moderation status.
- **Student Profile Management**: Academic discipline details, college year, and profile avatar upload.

---

### 🛡️ Campus Administration Portal (`/admin`)
- **Executive KPI Dashboard**: Platform sales revenue, catalog volume, active rentals count, pending student listings moderation.
- **Books Catalog & Inventory Management**: Live catalog table, instant stock level adjustments, in-page edit modal with photo change and book specifications.
- **Customer Orders Management**: Detailed customer info (student name, college, email, phone, hostel/library delivery location), itemized books ordered, status transition selector, and printable receipt invoice.
- **Semester Rentals Tracking**: Due date monitoring, overdue calculation, return check-in with automatic stock restoration.
- **Student Listings Moderation**: Review peer-to-peer textbook submissions and Approve or Reject with feedback reason.
- **Subject Categories Manager**: Create, modify, and delete department categories.
- **Dynamic Reports & SVG Charts**: Monthly sales and category distribution analytics calculated directly from transactions.
- **Campus Platform Settings**: Semester rental durations, late return fines, and factory demo data reset.

---

## 🚀 Demo Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Student** | `alex.student@college.edu` | `Student@1234` | Full student marketplace, cart, orders, rentals, listings |
| **Admin** | `admin@booknest.edu` | `Admin@1234` | Full access to `/admin` dashboard, catalog, orders, moderation |

*Tip: On the Login page (`login.html`), click "Fill Student Demo" or "Fill Admin Demo" for instant login.*

---

## 🛠️ Technology Stack
- **Frontend**: Semantic HTML5, Modular CSS3 Design Tokens, Pure Vanilla JavaScript (ES6+)
- **Icons & Graphics**: 100% Crisp SVG Vector Graphics (Zero Emojis)
- **Backend & Data**: Firebase Auth, Cloud Firestore, Firebase Storage + Unified Persistent Data Store Layer (IndexedDB / LocalStorage)
- **Deployment**: Ready for Netlify, Vercel, or Firebase Hosting.

---

## 📦 Deployment on Netlify
1. Push this repository to GitHub.
2. Link your repository in [Netlify](https://app.netlify.com).
3. Set publish directory to `.` (root).
4. Deploy! `netlify.toml` handles routing automatically.
