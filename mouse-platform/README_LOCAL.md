# Mouse Platform - Local Development

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

### 1. King Mouse Avatar
- Click the crown icon in the bottom right corner
- Chat with King Mouse to orchestrate your AI workforce
- Deploy employees, check status, run security scans

### 2. Screen Replay (Fully Working)
- Click the monitor icon in King Mouse chat or the "Replay" quick action
- Record employee screens
- View and playback recordings
- Training and debugging tool

### 3. Employee Marketplace
- Deploy AI employees: Sales, Support, Developer, Analyst
- Start/pause/delete employees
- Track tasks, hours, efficiency
- Work hours integration

### 4. Work Hours System
- Purchase work hours
- Track usage per employee
- Cost breakdown
- Real-time balance updates

### 5. Security Features
- Anti-clone guardrails
- Rate limiting
- Audit logging
- Security event monitoring
- Auto-scans every 5 minutes

### 6. ROI Tracking
- Time saved metrics
- Money saved calculations
- Efficiency tracking

## Demo Credentials

Use these to test different roles:

- **Admin**: admin@mouse.ai / admin123
- **Sales**: sales@mouse.ai / sales123
- **Reseller**: reseller@mouse.ai / reseller123
- **Customer**: customer@mouse.ai / customer123

## Project Structure

```
app/
├── components/
│   ├── KingMouseAvatar.tsx    # Chat widget & orchestration
│   └── EmployeeMarketplace.tsx # Employee management
├── context/
│   ├── WorkHoursContext.tsx    # Work hours state
│   └── SecurityContext.tsx     # Security state
├── dashboard/
│   ├── layout.tsx              # Dashboard layout with sidebar
│   ├── page.tsx                # Dashboard redirect
│   ├── admin/                  # Admin portal
│   ├── sales/                  # Sales portal
│   ├── reseller/               # Reseller portal
│   └── customer/               # Customer portal
├── login/
│   └── page.tsx                # Single login page
├── page.tsx                    # Landing page
├── layout.tsx                  # Root layout with providers
└── globals.css                 # Styles
```

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Lucide Icons

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables (Optional)

Create `.env.local` for production features:

```
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_STRIPE_KEY=
```

## Notes

- All features work locally without external APIs
- Demo data is stored in component state
- Refreshing the page resets demo data
- Screen replay uses simulated recordings
