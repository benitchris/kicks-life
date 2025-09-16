# E-commerce Store

A modern e-commerce application built with Next.js, React, and Supabase.

## Features

- 🛍️ Product catalog with categories and search
- 🛒 Shopping cart functionality
- 💳 Checkout process with promo codes
- 👨‍💼 Admin dashboard for managing products, orders, and promotions
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS and shadcn/ui components

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **Icons**: Lucide React
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   pnpm install
   \`\`\`

3. Set up environment variables:
   - The project is configured with Supabase integration
   - Environment variables are automatically provided in the v0 environment

4. Run the development server:
   \`\`\`bash
   pnpm dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Admin Access

Access the admin panel at `/admin` to manage:
- Products (add, edit, delete)
- Orders (view, update status)
- Promo codes (create, manage)

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
└── scripts/              # Database scripts
\`\`\`

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
