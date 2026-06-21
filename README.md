# 🏋️ GymSpot — Find & Book Your Perfect Gym

> **OYO-style gym booking platform** — Browse verified gyms, book for 1 day to 1 year, manage listings, and track revenue.

![GymSpot](https://img.shields.io/badge/GymSpot-Gym%20Booking%20Platform-c8f04b?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=for-the-badge&logo=tailwindcss)

---

## 💡 What is GymSpot?

GymSpot solves a simple problem — most local gyms have no online presence and users have to visit physically before deciding to join. GymSpot gives every gym an instant online profile with photos, pricing, and reviews. Users can discover and book gyms from anywhere with flexible plans ranging from a single day to a full year — no long-term commitments forced.

---

## ✨ Features

### 🏃 For Users
- Browse and search verified gyms by name or city
- Real-time search and filter — sort by Top Rated, Newest, Price
- View gym detail page with photo gallery, amenities, and reviews
- Book with flexible plans — **Day / Month / Year**
- Auto price calculation based on selected dates
- View and cancel bookings from personal dashboard
- Leave star reviews after a confirmed visit

### 🏢 For Gym Owners
- Add gym listings with a 3-step form and drag & drop photo upload
- Analytics dashboard — Total Gyms, Bookings, Revenue, Avg Rating
- Revenue bar chart for last 6 months
- Bookings donut chart by status (Confirmed / Pending / Cancelled)
- Confirm or cancel user bookings
- View gyms with verified/pending status badges

### 🛡️ For Admins
- Platform-wide stats — Total Gyms, Users, Bookings, Revenue
- Approve or reject gym listings
- View all registered users with role badges

### 🔐 Auth
- Signup as User or Gym Owner
- Role-based redirect after login
- Forgot password and secure email reset flow

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 18 + Vite** | Frontend framework — fast builds and hot reload |
| **TypeScript** | Type safety across the entire codebase |
| **Tailwind CSS** | Utility-first styling — no custom CSS needed |
| **React Router v6** | Client-side page navigation |
| **Supabase** | PostgreSQL database, Auth, and file Storage |
| **Row Level Security** | Database-level access control per user role |
| **Recharts** | Revenue and bookings analytics charts |
| **React Query** | Data fetching, caching, and loading states |
| **Bebas Neue + DM Sans** | Bold gym-energy headings + clean body text |

---

## 🗄️ Database Schema

```
profiles     → id, name, email, role, created_at
gyms         → id, owner_id, name, city, price_per_day/month/year, is_verified
gym_images   → id, gym_id, url, is_primary
bookings     → id, user_id, gym_id, start_date, end_date, duration_type, total_price, status
reviews      → id, user_id, gym_id, rating, comment
```

A database trigger (`handle_new_user`) automatically creates a profile row every time a new user signs up, storing their name and role from signup metadata.

---

## 👤 User Roles

| Role | What They Can Do |
|---|---|
| **User** | Browse gyms, book, manage bookings, leave reviews |
| **Owner** | List gyms, upload photos, manage bookings, view analytics |
| **Admin** | Approve/reject gyms, view all users and platform stats |

Routes are protected by a `ProtectedRoute` component that checks role from the database and redirects unauthorized access. RLS policies enforce the same rules at the database level.

---

## 🎨 Design System

| Token | Value |
|---|---|
| Background | `#0a0a0a` — Near black |
| Surface | `#111111` — Dark cards |
| Primary | `#c8f04b` — Electric Lime |
| Text | `#f5f5f5` — Off white |
| Muted | `#888888` — Grey |
| Heading Font | Bebas Neue |
| Body Font | DM Sans |

---

## 📁 Project Structure

```
src/
├── pages/
│   ├── Landing.tsx
│   ├── auth/              # Login, Signup, ForgotPassword, ResetPassword
│   ├── owner/             # Dashboard, MyGyms, AddGym, Bookings, Profile
│   ├── admin/             # Dashboard, ManageGyms, Users
│   └── user/              # Gyms, GymDetail, Bookings, Profile
├── contexts/
│   └── AuthContext.tsx    # Global auth state — user, session, role
├── components/
│   └── ProtectedRoute.tsx # Role-based route guard
└── integrations/
    └── supabase/
        └── client.ts      # Supabase client setup
```

---

## 📸 Screenshots

> Landing Page · Browse Gyms · Gym Detail · Owner Dashboard · Admin Panel

---

<div align="center">

Made with 💪 in India

**GymSpot** — Find. Book. Train.

</div>