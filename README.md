### NovelVerse

A Digital Platform for Creative Writers and Readers

🧭 Project Overview

NovelVerse is a modern platform designed to provide writers with a dedicated space to publish and manage their stories, and readers with an engaging, seamless experience to explore authentic literary content. It bridges the gap between emerging authors and readers seeking original stories.

🏗 System Architecture
	•	Frontend: Next.js + TypeScript
	•	Backend API: Node.js + Express
	•	Database: PostgreSQL (Aiven SQL)
	•	Authentication: JWT-based secure authentication
	•	Hosting:
	•	Frontend → Vercel
	•	Backend → Render
	•	Database → Aiven SQL

⸻

📐 System Design

Frontend (Next.js + TypeScript)
	•	Server-side rendering for SEO-optimized story pages
	•	Dynamic routing for books, authors, and dashboard views
	•	Data fetching via getServerSideProps and API routes
	•	Pagination for stories and comments
	•	Real-time search and filtering (genre, rating, author)
	•	Built with Tailwind CSS
	•	Zustand for state management
	•	Axios for API integration

Backend (Node.js + Express)
	•	Modular REST APIs
	•	CRUD operations for stories
	•	Secure JWT authentication and bcrypt password hashing
	•	Request validation using Express-Validator
	•	Sequelize ORM for SQL operations
	•	Optimized queries for pagination, filters, and search

Database (Aiven SQL - PostgreSQL)
	•	Relational schema for Users, Stories, Likes, and Comments
	•	Indexed fields for fast search and sorting
	•	Supports relational joins for dashboards and user data

⸻

🔑 Key Features

Authentication & Authorization
	•	Secure JWT login/signup
	•	Role-based access: Author, Reader, Admin

Story Management
	•	Create, update, delete, and read stories
	•	Paginated story viewing
	•	Like, comment, and user engagement features

Profile System
	•	User profiles showcasing uploaded stories, followers, and favorites

Dashboard
	•	Author dashboard to manage published content

Search & Filters
	•	Filter stories by genre, popularity, or author

Hosting
	•	Frontend → Vercel
	•	Backend → Render
	•	Database → Aiven SQL

⸻

🧰 Tech Stack

Layer	Technologies
Frontend	Next.js (TypeScript), Tailwind CSS, Axios, Zustand
Backend	Node.js, Express.js
Database	PostgreSQL (Aiven SQL)
Authentication	JWT, bcrypt
Hosting	Vercel (Frontend), Render (Backend), Aiven SQL


⸻

📡 API Overview

Endpoint	Method	Description	Access
/api/auth/signup	POST	Register a new user	Public
/api/auth/login	POST	Authenticate user	Public
/api/books	GET	Get all stories	Authenticated
/api/books/:id	GET	Get story by ID	Authenticated
/api/books	POST	Create story	Author only
/api/updateBooks/:id	PUT	Update story	Author only
/api/deleteBooks/:id	DELETE	Delete story	Author/Admin


⸻

🚀 Deployment
	•	Frontend deployed on Vercel
	•	Backend deployed on Render
	•	Database on Aiven PostgreSQL
	•	Environment variables configured via .env

⸻

🔮 Future Enhancements
	•	AI-powered writing assistant
	•	Story recommendation engine
	•	Subscription/monetization model
	•	Notifications & follower feed
	•	Collaborative writing features

⸻

📚 Book Categories Featured
	•	Self-Help
	•	Business & Finance
	•	Fiction & Literature
	•	Science & Technology
	•	Philosophy & Spirituality
	•	Fantasy & Adventure

⸻

📬 Contact - junaidsamishaik@gmail.com
