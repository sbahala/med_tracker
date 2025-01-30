Med Tracker

This Smart Hospital System is an innovative digital platform designed to transform hospital operations. This comprehensive system enhances patient care and optimizes management processes by providing real-time access to essential information for all stakeholders - patients, doctors, and administrators.


🔗 Live Demo - https://medtracknew.web.app
   
🛠 Tech Stack
Frontend: React.js, HTML, CSS, JavaScript
Backend: Firebase Authentication, Firestore Database, Firebase Hosting
CI/CD: GitHub Actions, Firebase Hosting
Tools: Node.js, npm, Firebase CLI

🚀 Getting Started
📥 1️⃣ Clone the Repository

git clone https://github.com/YOUR_GITHUB_USERNAME/medtrack.git
cd medtrack
📌 2️⃣ Install Dependencies
Make sure you have Node.js installed. Then, install dependencies:
npm install
🔑 3️⃣ Set Up Firebase Configuration
Create a .env file in the root directory and add your Firebase credentials:

REACT_APP_API_KEY=your-api-key
REACT_APP_AUTH_DOMAIN=your-auth-domain
REACT_APP_PROJECT_ID=your-project-id
REACT_APP_STORAGE_BUCKET=your-storage-bucket
REACT_APP_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_APP_ID=your-app-id
You can find these values in your Firebase Console under Project Settings → General → Your Apps.

🏗 4️⃣ Build the Project
Before deploying, build the React project:
npm run build
💻 5️⃣ Run the Application Locally
To start the development server:

npm start
✅ Open http://localhost:3000/ in your browser.

📦 Deployment Guide
🔹 Firebase Hosting Deployment
1️⃣ Install Firebase CLI
npm install -g firebase-tools
2️⃣ Log in to Firebase
firebase login
3️⃣ Initialize Firebase Hosting (First-time Setup)
firebase init hosting
Select Firebase project: medtracknew
Public directory: build
Single-page app? → Yes
4️⃣ Deploy the Application
firebase deploy
✅ Your app is now live at https://medtracknew.web.app

