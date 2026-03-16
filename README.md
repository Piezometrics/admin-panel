## Setup

### 1. Backend `.env`

Create a file at `fetch_grafana_users/.env`:

```
GRAFANA_URL=https://your-grafana-instance.com
PORT=8080
```

### 2. Run the backend

```bash
cd fetch_grafana_users
go run ./cmd/server
```

### 3. Run the frontend

```bash
cd piezometrics-front
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:8080`.

### 4. Login

Open the frontend in your browser and log in with your ADMIN Grafana credentials. The app uses Grafana's authentication system.
