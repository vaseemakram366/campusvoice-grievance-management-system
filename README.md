# CampusVoice – Campus Grievance Management System

A full-stack web application designed to simplify and digitize the campus grievance management process. CampusVoice enables students to submit grievances, officers to manage and resolve complaints, and administrators to monitor the overall grievance resolution workflow through dedicated role-based dashboards.

<p align="center">
  <strong>Turning campus complaints into accountable resolutions.</strong>
</p>

---

## 🌐 Live Application

**Live Demo:** https://campusvoice-grievance-management-sy.vercel.app/

**Backend API:** https://campusvoice-grievance-management-system.onrender.com/

**GitHub Repository:** https://github.com/vaseemakram366/campusvoice-grievance-management-system

---

## 📌 Overview

Traditional campus grievance processes can involve manual paperwork, delayed communication, and limited transparency.

CampusVoice addresses these challenges by providing a centralized digital platform where students can raise concerns and track their progress, officers can manage assigned grievances, and administrators can oversee departments and grievance resolution activities.

The application implements role-based access control and real-time notifications to improve communication and accountability.

## ✨ Key Features

### 👨‍🎓 Complainant Module
- Submit campus grievances.
- Select grievance categories and priorities.
- Track grievance status.
- View grievance updates and history.
- Receive real-time notifications.

### 🧑‍💼 Officer Module
- Access assigned grievances.
- Review grievance details.
- Update grievance status.
- Add remarks and resolution updates.
- Maintain grievance progress history.

### 🛡️ Admin Module
- Manage departments.
- Create department officer accounts.
- Monitor overall grievance statistics.
- View pending grievances by department.
- Analyze grievance resolution time through reports.

### ⚙️ System Features
- JWT-based authentication.
- Role-based authorization.
- Password hashing using bcrypt.
- Access and refresh token authentication.
- Refresh token rotation.
- Real-time communication using Socket.IO.
- RESTful API architecture.
- MongoDB database integration.
- Protected frontend routes.
- Centralized API service and token refresh handling.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript |
| Styling | CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt |
| Real-time Communication | Socket.IO |
| API Architecture | REST API |
| Frontend State Management | React Context API |
| Frontend Routing | React Router |
| Deployment – Frontend | Vercel |
| Deployment – Backend | Render |
| Version Control | Git, GitHub |

---

## 🏗️ System Architecture

```text
                 CAMPUSVOICE
                      |
          +-----------+-----------+
          |                       |
      Frontend                 Backend
       React                  Node.js
        Vite                  Express
          |                       |
          |                 REST API
          |                       |
          +-----------------------+
                                  |
                    +-------------+-------------+
                    |             |             |
                 MongoDB       JWT Auth      Socket.IO
                    |             |             |
                    +-------------+-------------+
                                  |
                         Role-Based Access
                                  |
                +----------------+----------------+
                |                |                |
            Complainant        Officer           Admin
```

---

## 📂 Project Structure

```text
CampusVoice/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── sockets/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── index.html
│   ├── vercel.json
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

Follow these instructions to run CampusVoice locally.

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- MongoDB Atlas account or a MongoDB instance
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/vaseemakram366/campusvoice-grievance-management-system.git

cd campusvoice-grievance-management-system
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_ACCESS_SECRET=your_access_token_secret

JWT_REFRESH_SECRET=your_refresh_token_secret

FRONTEND_URL=http://localhost:5173
```

Start the backend server:

```bash
npm run dev
```

The backend will run at:

`http://localhost:5000`

### 3. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api

VITE_SOCKET_URL=http://localhost:5000
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will run at:

`http://localhost:5173`

---

## 🔐 Environment Variables

### Backend

| Variable | Description |
|---|---|
| `PORT` | Backend server port |
| `MONGO_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Access token signing secret |
| `JWT_REFRESH_SECRET` | Refresh token signing secret |
| `FRONTEND_URL` | Allowed frontend origin(s) for CORS |

### Frontend

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend REST API base URL |
| `VITE_SOCKET_URL` | Backend Socket.IO server URL |

**Security Note:** Never commit `.env` files, database credentials, or JWT secrets to GitHub. Use environment variables in your deployment platform.

---

## 🔄 Application Workflow

1. A student registers and logs into CampusVoice.
2. The student submits a grievance with its title, description, category, and priority.
3. The system processes the grievance and assigns it according to the configured department and officer assignment logic.
4. The assigned officer reviews the grievance.
5. The officer updates its status and adds remarks.
6. The complainant receives updates and can track the grievance.
7. Administrators monitor grievance activity and resolution statistics.

---

## 🔒 Security Implementation

CampusVoice incorporates several authentication and authorization mechanisms:

- Password hashing using bcrypt.
- JWT-based access authentication.
- Refresh token rotation.
- Protected API endpoints.
- Role-based authorization middleware.
- Input validation and error handling.
- CORS configuration for frontend-backend communication.

---

## 📊 Project Objectives

- Digitize campus grievance management.
- Improve transparency in complaint handling.
- Reduce manual administrative processes.
- Enable faster communication between students and officers.
- Provide administrators with useful grievance analytics.
- Establish accountability through grievance status tracking and history.

---

## 🔮 Future Enhancements

- Email and SMS notifications.
- File and image attachments for grievances.
- Advanced grievance analytics.
- AI-powered grievance classification.
- Automated priority recommendations.
- Student feedback and satisfaction tracking.

---

## 👨‍💻 Author

**Vaseem Akram**

B.Tech – Computer Science and Engineering

GitHub: [@vaseemakram366](https://github.com/vaseemakram366)

---

## 📄 License

This project is developed as an academic capstone project.

A formal open-source license has not yet been specified.

---

<p align="center">
  <strong>CampusVoice – Making Campus Grievance Management Transparent, Organized, and Accountable.</strong>
</p>
