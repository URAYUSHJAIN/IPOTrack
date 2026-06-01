# IPOTrack — Real-time Indian IPO Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-333?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-v18+-blue?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-v5+-purple?logo=vite)](https://vitejs.dev)

<div align="center">
  <img src="frontend/public/logo.svg" alt="IPOTrack" width="120" height="120" />
  <p><strong>Track Indian IPOs in real-time</strong></p>
  <p>Monitor upcoming, open, and listed IPO data with live GMP tracking, subscription charts, and investment calculations.</p>
</div>

---

## 🚀 Features

### Core IPO Tracking
- **📊 Dashboard** — Real-time overview of open IPOs with subscription status
- **🗓️ Upcoming IPOs** — Upcoming IPO listings with dates and price bands
- **📅 Calendar View** — Month-view IPO calendar with modal details
- **📈 GMP Tracker** — Live Gray Market Premium tracking with historical trends
- **📋 Past IPOs** — Listed IPO performance with profit/loss filtering

### Advanced Features
- **💰 Investment Calculator** — Floating FAB calculator for IPO investment scenarios
- **📊 Subscription Charts** — Day-wise subscription data visualization
- **⚡ Real-time Updates** — In-memory caching with TTL-based background refresh
- **📱 Responsive Design** — Mobile-first UI with Tailwind CSS
- **🎨 Dark-first Theme** — Modern dark theme with green accent color (#00C853)

### Data Sources
- **Chittorgarh.com** — Puppeteer-based web scraping for IPO data
- **Investorgain.com** — GMP and listing data aggregation
- **Automated Refresh** — Cron-based data sync every 30 minutes

---

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)

---

## 🏗️ Architecture

### System Overview

```mermaid
graph TB
    Client["🌐 React Client<br/>Vite + Tailwind CSS"]
    API["🔌 Express.js API<br/>Port 3000"]
    Cache["💾 In-Memory Cache<br/>TTL Refresh"]
    Cron["⏰ Node Cron<br/>Background Jobs"]
    
    Scraper1["🕷️ Puppeteer Scraper<br/>Chittorgarh IPO Data"]
    Scraper2["🕷️ Puppeteer Scraper<br/>Investorgain GMP"]
    
    ChittorURL["chittorgarh.com<br/>Upcoming/Open/Listed"]
    InvestorURL["investorgain.com<br/>GMP Tracker"]
    
    Client -->|API Requests| API
    API -->|Query Cache| Cache
    Cache -->|Data| Client
    
    Cron -->|Refresh Every 30m| Scraper1
    Cron -->|Refresh Every 30m| Scraper2
    
    Scraper1 -->|Fetch| ChittorURL
    Scraper2 -->|Fetch| InvestorURL
    
    Scraper1 -->|Update| Cache
    Scraper2 -->|Update| Cache
```

### Data Flow & Caching

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Cache
    participant Cron
    participant Scraper
    participant Website
    
    Cron->>Scraper: Refresh data (30m interval)
    Scraper->>Website: Fetch HTML via Puppeteer
    Website-->>Scraper: HTML Response
    Scraper->>Cache: Store {data, timestamp}
    
    Client->>API: GET /api/ipo/upcoming
    API->>Cache: Query cache
    alt Cache Fresh <30m
        Cache-->>API: Return cached data
    else Cache Stale >30m
        API-->>Client: Return with stale=true flag
    end
    API-->>Client: JSON Response {data, stale}
    Client->>Client: Render UI + Stale Banner
```

### Frontend Component Architecture

```mermaid
graph TD
    App["App.jsx<br/>Router + Layout"]
    Navbar["Navbar.jsx<br/>Logo + Navigation<br/>Desktop & Mobile"]
    
    Dashboard["📊 Dashboard.jsx<br/>Open IPOs Overview"]
    Upcoming["🗓️ Upcoming.jsx<br/>Sortable IPO Table"]
    Calendar["📅 Calendar.jsx<br/>Month-View + Modal"]
    GMP["📈 GMPTracker.jsx<br/>Line Chart + Table"]
    PastIPOs["📋 PastIPOs.jsx<br/>Profit/Loss Filter"]
    
    IPOCard["IPOCard.jsx<br/>Subscription Bar"]
    IPOTable["IPOTable.jsx<br/>Sortable Columns"]
    Calculator["💰 InvestmentCalculator.jsx<br/>Floating FAB"]
    SubChart["📊 SubscriptionChart.jsx<br/>Bar Chart"]
    
    App --> Navbar
    App --> Dashboard
    App --> Upcoming
    App --> Calendar
    App --> GMP
    App --> PastIPOs
    
    Dashboard --> IPOCard
    Dashboard --> SubChart
    Dashboard --> Calculator
    
    Upcoming --> IPOTable
    Upcoming --> Calculator
    
    PastIPOs --> IPOTable
    PastIPOs --> Calculator
    
    GMP --> SubChart
    GMP --> Calculator
    
    Calendar --> Calculator
    
    style Navbar fill:#00C853,color:#fff
    style App fill:#00C853,color:#fff
```

### Backend API & Scraper Architecture

```mermaid
graph LR
    Express["Express.js<br/>server.js"]
    Routes["ipoRoutes.js<br/>5 Endpoints"]
    
    Upcoming["upcomingIPO.js<br/>Chittorgarh Scraper"]
    Open["openIPO.js<br/>Open + GMP Merge"]
    Listed["listedIPO.js<br/>Listed Performance"]
    GMP["gmpScraper.js<br/>GMP Tracker"]
    SubDetail["subscriptionDetail.js<br/>Day-wise Data"]
    
    Cache["Cache Layer<br/>memCache.js<br/>TTL=1800s"]
    Browser["Puppeteer Singleton<br/>browser.js<br/>Headless Chrome"]
    
    Express --> Routes
    Routes --> Upcoming
    Routes --> Open
    Routes --> Listed
    Routes --> GMP
    Routes --> SubDetail
    
    Upcoming --> Cache
    Open --> Cache
    Listed --> Cache
    GMP --> Cache
    
    Upcoming --> Browser
    Open --> Browser
    Listed --> Browser
    GMP --> Browser
    SubDetail --> Browser
    
    style Express fill:#FF6B6B,color:#fff
    style Routes fill:#FF6B6B,color:#fff
    style Cache fill:#4ECDC4,color:#fff
    style Browser fill:#FFE66D,color:#333
```

### Puppeteer Scraper Workflow

```mermaid
graph TD
    A["🌐 Launch Browser<br/>newPage()"]
    B["🚫 Intercept Requests<br/>Block images/fonts/media"]
    C["🔗 Navigate to URL<br/>goto url"]
    D["⏳ Wait for Content<br/>waitForSelector table"]
    E["🕷️ Parse HTML<br/>document.querySelectorAll"]
    F["🔄 Dynamic Headers<br/>Flexible column detection"]
    G["🧹 Normalize Data<br/>Type casting & cleanup"]
    H["🎯 Filter Valid Rows<br/>Remove null/empty"]
    I["📦 Return JSON<br/>Send to client"]
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    
    style A fill:#FFE66D,color:#333
    style D fill:#95E1D3,color:#333
    style I fill:#00C853,color:#fff
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** — Component-based UI library
- **Vite 5** — Lightning-fast build tool & dev server
- **Tailwind CSS 3** — Utility-first CSS framework
- **React Router v6** — Client-side routing
- **Axios** — Promise-based HTTP client
- **Chart.js** — Interactive data visualization
- **date-fns** — Modern date utilities

### Backend
- **Node.js 20+** — JavaScript runtime
- **Express.js 4** — Minimal web framework
- **Puppeteer** — Headless browser automation
- **node-cron** — Cron-based job scheduler
- **CORS** — Cross-origin resource sharing middleware

### Deployment
- **Vercel** — Full-stack serverless hosting
- **Environment Variables** — Runtime configuration
- **Build Optimization** — Code splitting & minification

---


---

## 💻 Development

### Local Development Setup

```bash
# Install all dependencies
npm install --prefix frontend
npm install --prefix backend

# Terminal 1: Backend dev server (auto-reload with nodemon)
cd backend
npm run dev

# Terminal 2: Frontend dev server with HMR
cd frontend
npm run dev

# Open http://localhost:5173 in browser
```

### Building for Production

```bash
# Build frontend (outputs to frontend/dist/)
cd frontend
npm run build

# Backend is ready as-is for Vercel deployment
# Just ensure package.json includes all dependencies
```

### Testing API Endpoints

**Using curl:**
```bash
curl http://localhost:3000/api/ipo/upcoming
curl http://localhost:3000/api/ipo/open
curl http://localhost:3000/api/ipo/listed
curl http://localhost:3000/api/ipo/gmp
```

**Using VS Code REST Client:**

Create `test.http` in the root:
```http
### Upcoming IPOs
GET http://localhost:3000/api/ipo/upcoming

### Open IPOs
GET http://localhost:3000/api/ipo/open

### Listed IPOs
GET http://localhost:3000/api/ipo/listed

### GMP Data
GET http://localhost:3000/api/ipo/gmp
```

---

Common issues:
- Missing dependencies → Run `npm install --prefix backend`
- Build script errors → Check `backend/package.json` scripts
- Environment variables → Add to Vercel dashboard
- Port conflicts → Ensure no hardcoded ports in backend

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) file for details.



**Made with ❤️ by the urayushjain Team**


