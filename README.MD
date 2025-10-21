Frontend: React(Vite)
Backend: Flask(Python) + SQLite

Prerequisites: 
Python 3.10 +
Node.js 18+ and npm

Steps: 

go to back end folder(demo\server)
py -m venv .venv
.venv\Scripts\activate(virtual environment)
pip install flask flask-cors
python seed.py
python app.py(or just start)

on sencond terminal
cd demo\web
npm i
npm run dev

now go browser http://localhost:5173/
api: http://127.0.0.1:4000/api/quiz

To stop: 
ctrl C to quit Flask and Vite