# Getaway Hub Backend – Local Setup

This backend is a Django API used by the Getaway Hub frontend and the scraping API service.

## 1. Clone the repository

```bash
git clone https://github.com/AbdulrahmanChalya/TheDevArchitects.git
cd TheDevArchitects
```

2. Create and activate a virtual environment
```bash
Copy code
# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate

# Windows (PowerShell)
python -m venv .venv
.venv\Scripts\Activate.ps1
```

3. Install backend dependencies
```bash
Copy code
cd backend
pip install -r requirements.txt
```

4. Run the Django backend
   
```bash
Copy code
python manage.py runserver 8000

The backend will be available at:
http://localhost:8000
```
5. Run the scraping API (in a separate terminal)
Open a new terminal window/tab, then:

```bash
Copy code
cd TheDevArchitects/scraping_api
npm install      # if you haven’t installed dependencies yet
npm run dev
```
