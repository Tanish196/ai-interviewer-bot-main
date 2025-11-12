# AI Interviewer Bot

A full-stack web application that provides AI-powered interview practice with real-time feedback, score tracking, and resume analysis.

## Features

- **AI-Powered Interviews**: Generate domain-specific interview questions using Google Gemini
- **Voice Recording**: Record your answers using speech-to-text (AssemblyAI)
- **Detailed Feedback**: Get comprehensive analysis with scores across multiple criteria
- **Progress Tracking**: Monitor your improvement over time with visual charts
- **Resume Analysis**: AI-powered resume review with actionable suggestions
- **Secure Authentication**: JWT-based user authentication

## Architecture

```
ai-interviewer/
├── backend/          # Express.js API server
│   ├── config/       # Database configuration
│   ├── controllers/  # Request handlers
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API routes
│   ├── middlewares/  # Auth & error handling
│   └── utils/        # Helper functions (Gemini, AssemblyAI)
│
└── frontend/         # React application
    ├── src/
    │   ├── components/  # React components
    │   ├── pages/       # Page components
    │   ├── services/    # API services (Axios)
    │   └── styles/      # CSS files
    └── public/          # Static assets
```

## Prerequisites

- Node.js >= 18.x
- MongoDB (local or Atlas)
- Google Gemini API Key
- AssemblyAI API Key (for voice transcription)

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (use `.env.example` as template):
```bash
cp .env.example .env
```

4. Update `.env` with your credentials:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
PORT=3000
```

5. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update `.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

5. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

1. **Sign Up**: Create a new account
2. **Sign In**: Login with your credentials
3. **Start Interview**: 
   - Enter the number of questions
   - Specify the domain (e.g., Software Engineering)
   - Answer questions via text or voice
4. **View Feedback**: Get detailed scores and suggestions
5. **Track Progress**: View your improvement over time
6. **Check Resume**: Upload and analyze your resume

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **AI Integration**: 
  - Google Gemini (interview questions & feedback)
  - AssemblyAI (voice transcription)

### Frontend
- **Framework**: React 19
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Charts**: Chart.js
- **Styling**: CSS3 (preserving original styles)
- **Build Tool**: Vite

## Project Structure

### Backend Structure
```
backend/
├── config/
│   └── db.js                    # MongoDB connection
├── controllers/
│   ├── authController.js        # Signup/signin logic
│   ├── interviewController.js   # Interview Q&A handling
│   ├── scoreController.js       # Score calculation & history
│   ├── resumeController.js      # Resume analysis
│   └── profileController.js     # Profile image & transcription
├── models/
│   ├── User.js                  # User schema
│   ├── Session.js               # Interview session schemas
│   └── Interview.js             # Image storage schema
├── routes/
│   ├── authRoutes.js
│   ├── interviewRoutes.js
│   ├── scoreRoutes.js
│   ├── resumeRoutes.js
│   └── profileRoutes.js
├── middlewares/
│   └── authMiddleware.js        # JWT verification
├── utils/
│   ├── geminiClient.js          # Gemini AI integration
│   ├── assemblyClient.js        # AssemblyAI integration
│   └── errorHandler.js          # Error handling utilities
└── server.refactored.js         # Main server file
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── SignIn.jsx
│   │   │   ├── SignUp.jsx
│   │   │   └── Auth.css
│   │   ├── Dashboard/
│   │   │   ├── Home.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Dashboard.css
│   │   ├── Interview/
│   │   │   ├── InterviewStart.jsx
│   │   │   ├── InterviewProgress.jsx
│   │   │   ├── InterviewResult.jsx
│   │   │   └── Interview.css
│   │   ├── Resume/
│   │   │   ├── ResumeCheck.jsx
│   │   │   └── Resume.css
│   │   └── Shared/
│   │       ├── Loader.jsx
│   │       └── Shared.css
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Interview.jsx
│   │   ├── Progress.jsx
│   │   ├── Resume.jsx
│   │   └── Feedback.jsx
│   ├── services/
│   │   ├── api.js               # Axios instance
│   │   └── auth.js              # API service functions
│   ├── App.jsx                  # Main app component
│   └── index.css                # Global styles
└── public/                      # Static assets
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - User login

### Interview
- `POST /api/interview` - Generate interview question
- `POST /api/addanswer` - Submit answer
- `POST /api/home` - Reset interview session

### Scoring
- `POST /api/score` - Calculate score and feedback
- `POST /api/checkscore` - Get score history

### Resume
- `POST /api/checkresume` - Analyze resume

### Profile
- `POST /api/getimage` - Get profile image
- `POST /api/addimage` - Upload profile image
- `POST /api/transcribe` - Transcribe audio to text

## Security Features

- Password hashing (ready to implement bcrypt)
- JWT token authentication
- Protected routes
- CORS configuration
- Input validation

## Deployment

Recommended setup for this repo:

- Frontend: Vercel (static site from `frontend/` built by Vite)
- Backend: Render (Node web service from `backend/`)

### Frontend → Vercel

1. In the Vercel dashboard, create a new project and point it to this repository.
2. In "Project Settings → Environment Variables", add `VITE_API_URL` set to your Render backend URL (e.g. `https://ai-interviewer-backend.onrender.com/api`).
3. Vercel will detect the frontend directory; set the Root Directory to `frontend` if asked.
4. Build & Output Settings (Vercel usually autodetects):
  - Build Command: `npm run build`
  - Output Directory: `dist`
5. Deploy. The `frontend/vercel.json` file is included to ensure the SPA rewrites to `index.html`.

### Backend → Render

1. Create a new Web Service on Render and connect your repository.
2. Set the Root Directory to `backend` (so Render runs commands inside `backend/`).
3. Build Command: `npm install`
4. Start Command: `npm start` (the `start` script runs `node server.js`)
5. Add environment variables in Render's dashboard (Secrets):
  - `MONGO_URI` (or `mongourl` if you prefer)
  - `JWT_SECRET` (or `jsonpassword`)
  - `GEMINI_API_KEY` (or `gemini_key`)
  - `ASSEMBLYAI_API_KEY` (or `apiKey`)
  - `FRONTEND_URL` — set to your Vercel app URL (e.g. `https://your-frontend.vercel.app`) so the backend can restrict CORS
6. Deploy. Render will provide a stable URL for your backend (e.g. `https://ai-interviewer-backend.onrender.com`).

### CORS and environment integration

The backend reads `FRONTEND_URL` (see `backend/.env.example`) and uses it as the allowed origin for CORS. Set that to your Vercel frontend URL in production to restrict cross-origin access.

### Notes

- Do not commit secrets to the repository. Use the hosting provider's environment/secret management.
- After backend is deployed, update `VITE_API_URL` in Vercel to point to `https://<your-render-backend>/api` and redeploy the frontend.
- The `frontend/vercel.json` file enforces an SPA rewrite to `index.html` so client-side routing works on Vercel.

## Migration from Old Structure

This project was refactored from static HTML/CSS/JS to a modern full-stack architecture:

- **Backend**: Monolithic `server.js` → MVC pattern with routes, controllers, models
- **Frontend**: Static HTML files → React components with routing
- **Styling**: All original CSS files preserved in component folders
- **API Layer**: Direct fetch calls → Axios service layer with interceptors

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- Google Gemini for AI-powered content generation
- AssemblyAI for speech-to-text functionality
- React and Express.js communities

---

**Note**: Remember to never commit your `.env` files to version control!