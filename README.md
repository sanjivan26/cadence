# Cadence

**Cadence** is a daily puzzle platform where users can play a collection of music-inspired games, maintain streaks, and revisit previous puzzles through an archive.

## Features

* Daily puzzles
* User accounts and authentication
* Current and best streak tracking
* Puzzle attempt and score tracking
* Puzzle history
* Puzzle archive
* Dark, Spotify-inspired interface

## Games

### PixAlbum

Identify an album from progressively revealed images.

The image is revealed through multiple stages as the player makes incorrect attempts.

## Tech Stack

**Frontend**

* React
* TypeScript
* Vite
* CSS

**Backend**

* Python
* FastAPI
* SQLAlchemy
* SQLite/PostgreSQL

**Authentication**

* JWT

## Project Structure

```text
cadence/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   └── ...
│
└── backend/
    ├── app/
    │   ├── api/
    │   ├── models/
    │   ├── schemas/
    │   └── ...
    └── ...
```

## Running Locally

### Backend

```bash
cd backend

python -m venv .venv
```

Activate the virtual environment:

**Windows**

```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the API:

```bash
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on the Vite development server.

## Current Status

Cadence is currently under active development.

**Implemented:**

* Authentication
* Daily puzzle system
* PixAlbum
* Attempts and scoring
* Streak tracking
* Puzzle history
* Puzzle archive
* Responsive dark UI

**Planned:**

* Additional daily music games
* SoundCheck
* More archive functionality
* Improved statistics and player progression

---

Made for learning, experimenting, and building something fun around music!
