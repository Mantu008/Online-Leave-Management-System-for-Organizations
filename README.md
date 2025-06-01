# 🗓️ Online Leave Management System (MERN Stack)

A web-based leave application and approval system for organizations. This system allows employees to apply for leave, and managers to review, approve, or reject requests. It features real-time notifications, automatic holiday blocking, and a user-friendly dashboard for each role.

---

## 📌 Key Features

### 👨‍💼 For Employees:
- Register and log in securely
- Apply for leave (select start & end dates, add reason)
- View personal leave history and application status
- View upcoming holidays
- Receive notifications when leave is approved/rejected

### 👩‍💼 For Managers:
- Login with manager privileges
- View list of all employee leave requests
- Approve or reject requests
- View team availability calendar

### 🔒 System-wide:
- Role-based access control
- JWT-based authentication
- MongoDB for data storage
- Socket.io or polling for real-time notifications
- Holiday-based auto-blocking (cannot apply on public holidays)

---

## 🛠️ Tech Stack

| Layer        | Tech Used                        |
|--------------|----------------------------------|
| Frontend     | React.js, Axios, React Router    |
| Backend      | Node.js, Express.js              |
| Database     | MongoDB, Mongoose                |
| Authentication | JWT                            |
| Styling      | Tailwind CSS / Bootstrap         |
| Real-time Notification | Socket.io (optional)   |

---

## 🧾 Database Schemas (Mongoose)

### 🔐 User Model
```js
{
  name: String,
  email: String,
  password: String, // Hashed
  role: 'employee' | 'manager',
  leaveBalance: Number
}
```

### 📄 LeaveRequest Model

```js
{
  employeeId: ObjectId,
  fromDate: Date,
  toDate: Date,
  reason: String,
  status: 'pending' | 'approved' | 'rejected',
  managerId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### 🎉 Holiday Model

```js
{
  date: Date,
  title: String
}
```

---

## 📂 Folder Structure

```
leave-management/
├── client/             # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── App.jsx
├── server/             # Node + Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── .env
├── README.md
└── package.json
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Mantu008/leave-management.git
cd leave-management
```

### 2. Install Dependencies

```bash
# Backend setup
cd server
npm install

# Frontend setup
cd ../client
npm install
```

### 3. Create `.env` File in `/server`

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

### 4. Run the App

```bash
# Start backend
cd server
npm run dev

# Start frontend
cd ../client
npm start
```

---

## 🔐 Authentication & Authorization

* Uses JWT for secure login sessions
* Role-based route access (employee vs manager)
* Protects sensitive routes using middleware

---

## ⚡ Optional Features

* Socket.io integration for real-time notifications
* Email notification service using Nodemailer
* Admin role to manage users and holidays
* Download leave history as PDF

---

## 📸 Screenshots

> Add screenshots of:

* Login Page
* Leave Application Form
* Manager Dashboard
* Notification Popup

---

## 📈 Future Enhancements

* Multi-language support
* Attendance integration
* Export reports to Excel
* Admin approval workflow

---

## 🤝 Contribution Guidelines

1. Fork this repo
2. Create your feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

---

## 💬 Contact

**Developer:** Mantu
**Email:** [mantukumar87586299@gmail.com](mailto:mantukumar87586299@gmail.com)
**GitHub:** [github.com/Mantu008](https://github.com/Mantu008)

---

