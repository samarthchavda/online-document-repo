
# Online Document Repository

A MERN stack-based online document repository for managing, uploading, and assigning PDF documents between students and faculty.

## Features

- 🧑‍🏫 Faculty can assign tasks and PDF documents to students.
- 📚 Students can upload their responses to the assigned tasks.
- ✅ Faculty can approve or reject student submissions.
- 🔐 Secure login/signup using JWT authentication.
- 📂 File uploads supported via drag and drop.

## Technologies Used

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **File Upload**: Multer

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/samarthchavda/online-document-repo.git
cd online-document-repo
```

2. **Install Backend Dependencies**

```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**

```bash
cd ../frontend
npm install
```

4. **Run the Application**

- Start Backend

```bash
cd ../backend
node server.js
```

- Start Frontend

```bash
cd ../frontend
npm start
```

## Folder Structure

```
online-document-repo/
├── backend/
│   ├── server.js
│   └── uploads/
├── frontend/
│   ├── src/
│   └── public/
└── README.md
```

## Contributing

Contributions are welcome!

1. Fork this repository.
2. Create a new branch: `git checkout -b feature-name`.
3. Make your changes and commit: `git commit -m 'Add feature'`.
4. Push to the branch: `git push origin feature-name`.
5. Submit a pull request.

## License

This project is licensed under the MIT License.

## Contact

Created by [Samarth Chavda](https://github.com/samarthchavda)
