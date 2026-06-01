# IPOTrack — Real-time Indian IPO Tracker

<div align="center">
  <img src="frontend/public/logo.png" alt="IPOTrack" width="120" height="120" />
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

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture & Approach](#-architecture--approach)
- [Tech Stack](#-tech-stack)
- [Local Setup (Quick Start)](#-local-setup-quick-start)
- [Deployment](#-deployment)
- [License](#-license)

---

## 🏗️ Architecture & Approach

This project is built using a **Split Hosting Architecture** to overcome serverless limitations. Web scraping with headless Chrome (Puppeteer) requires persistent memory and longer execution times than what free serverless platforms (like Vercel) allow.

To solve this, we split the application into two optimized environments:

1. **The Backend (Railway.app):** A continuous Node.js/Express server. It runs background cron jobs every hour that launch a hidden Google Chrome browser. It scrapes live IPO data from Chittorgarh and Investorgain, processes it, and stores it in lightning-fast RAM (In-Memory Cache).
2. **The Frontend (Vercel):** A blazing fast React Single Page Application (SPA). Because all the heavy scraping is already done by the backend, the frontend receives the data instantly via API calls. 

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
- **Railway.app** — Backend Node.js server with continuous memory
- **Vercel** — Fast frontend CDN and hosting
- **Environment Variables** — Cross-origin configuration

---

## 💻 Local Setup (Quick Start)

Because of the built-in Vite proxy and automated root scripts, running this app locally on your laptop is incredibly simple. You don't need to configure any environment variables or set up Chrome!

**Step 1: Clone the repository**
```bash
git clone https://github.com/URAYUSHJAIN/IPOTrack.git
cd IPOTrack
```

**Step 2: Install all dependencies**
```bash
npm run install-all
```
*(This automatically installs everything for the root, frontend, and backend folders at once. It also automatically downloads the required headless Chrome browser).*

**Step 3: Start both servers**
```bash
npm run dev
```
*(This starts the backend on port 3000 and the frontend on port 5173 simultaneously. The frontend automatically proxies `/api` requests to the backend).*

**Step 4: Open in Browser**
Go to `http://localhost:5173` in your browser. The first load may take ~15 seconds as the scraper initializes, but subsequent loads will be instant.

---

## 🚀 Deployment

This app requires **Split Hosting** (Railway + Vercel):

1. **Backend:** Deploy the root repository to **Railway.app**. Set the "Root Directory" in Railway settings to `/backend`. Generate a public service domain (e.g., `https://ipotrack-production.up.railway.app`).
2. **Frontend:** Deploy the root repository to **Vercel.com**. Set the "Root Directory" to `frontend`. Add an environment variable named `VITE_API_URL` and paste your Railway public domain into it.

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) file for details.

**Made with ❤️ by urayushjain**
