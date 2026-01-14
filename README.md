GigFlow – Frontend

GigFlow is a mini freelance marketplace platform built as part of the ServiceHive Full Stack Development Internship Assignment.

This repository contains the frontend application, developed using React.js.
It communicates with a deployed backend API and demonstrates authentication, protected routes, and role-based user flows.

🔗 Live Project Links

Frontend (Netlify):
https://glowing-flan-20b600.netlify.app

Backend (Render):
https://gigflow-backend-p324.onrender.com

🧠 Project Overview

GigFlow allows users to:

Register and log in as users

Browse available gigs

View gig details

Place bids on gigs (authenticated users)

Maintain login state using cookies and context

The frontend is built with scalability and clean state management in mind.

🛠 Tech Stack

React.js (Vite)

Axios

React Context API

React Router DOM

CSS / Tailwind (if applicable)

📁 Folder Structure
src/
├── components/
│   ├── Navbar.jsx
│   ├── ProtectedRoute.jsx
│
├── context/
│   ├── AuthContext.jsx
│
├── pages/
│   ├── Home.jsx
│   ├── Register.jsx
│   ├── Login.jsx
│   ├── GigDetails.jsx
│
├── services/
│   ├── api.js
│
├── App.jsx
├── main.jsx

🔐 Authentication Flow

Authentication is handled using HTTP-only cookies

User session is restored on page refresh using /api/auth/me

Global auth state is managed using React Context API

Protected routes prevent unauthorized access

🌐 API Integration

The frontend communicates with the backend using Axios.

Example base configuration:

axios.defaults.baseURL = "https://gigflow-backend-p324.onrender.com";
axios.defaults.withCredentials = true;


All protected requests automatically include cookies for authentication.

⚙️ Setup Instructions (Local Development)
1️⃣ Clone the Repository
git clone <frontend-repo-url>
cd frontend

2️⃣ Install Dependencies
npm install

3️⃣ Run the Development Server
npm run dev


The application will run at:

http://localhost:5173

🔧 Environment Variables

Create a .env file in the root directory.

Example:

VITE_API_URL=https://gigflow-backend-p324.onrender.com


⚠️ Do not commit .env files.
Always use .env.example for reference.

✨ Key Features Implemented

User Registration & Login

Persistent Authentication (Cookies)

Protected Routes

Gig Listing Page

Gig Details Page

Bid Placement (Authenticated)

Centralized API handling

Clean and modular structure

🎥 Demo Video

A 2-minute Loom / screen recording demonstrates:

User registration

Login & authentication

Browsing gigs

Protected routes

Bidding workflow

Video link - https://www.loom.com/share/3bed382ae7db47b89d960e7fc6e6bae7

📌 Notes

Backend is deployed on Render

Frontend is deployed on Netlify

CORS and cookie-based authentication are fully configured

Designed following production-ready best practices

📄 License

This project is developed solely for the ServiceHive Internship Assignment and is intended for evaluation purposes only.
