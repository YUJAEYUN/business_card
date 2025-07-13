# Digital Business Card

A modern web application for creating and sharing beautiful digital business cards with flip animations, built with Next.js and Supabase.

## Features

- 🎨 **Beautiful Card Flip Animations** - Smooth 3D flip animations using Framer Motion
- 📱 **Mobile Responsive** - Optimized for all devices and screen sizes
- 🔐 **Social Authentication** - Sign in with Google, GitHub (Kakao and Naver ready)
- 📤 **Easy Upload** - Drag & drop or click to upload business card images
- 🔗 **Shareable URLs** - Each card gets a unique URL for easy sharing
- 📱 **QR Code Generation** - Generate and download QR codes for your cards
- 🎯 **Real-time Preview** - See your card as you create it
- 💾 **Cloud Storage** - Secure image storage with Supabase
- 📊 **Dashboard** - Manage all your cards in one place

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Animation**: Framer Motion
- **Backend**: Supabase (Database, Auth, Storage)
- **QR Codes**: qrcode.react
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd digital-business-card
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Set up Supabase:

   - Create a new Supabase project
   - Run the SQL migration in `supabase/migrations/001_initial_schema.sql`
   - Configure authentication providers in Supabase dashboard
   - Set up storage bucket named "business-cards"

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages
│   ├── card/[id]/         # Dynamic card viewer pages
│   ├── create/            # Card creation page
│   └── dashboard/         # User dashboard
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── BusinessCard/     # Card-related components
│   ├── Dashboard/        # Dashboard components
│   ├── QRCode/          # QR code components
│   ├── Share/           # Sharing components
│   └── Upload/          # File upload components
├── contexts/             # React contexts
├── lib/                 # Utility functions and configurations
└── supabase/           # Database migrations and config
```

## Features Overview

### Card Creation

- Upload front and back images of your business card
- Choose between horizontal and vertical orientations
- Real-time preview with flip animation
- Image compression and optimization

### Card Viewing

- Unique URL for each card
- Interactive flip animation (click/tap to flip)
- Mobile-optimized touch interactions
- Social sharing options

### Dashboard

- View all your created cards
- Copy sharing URLs
- Generate and download QR codes
- Delete cards
- Usage statistics

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [Tailwind CSS](https://tailwindcss.com/) for styling
