# RCA Dashboard Frontend

A modern, responsive web application for monitoring and analyzing AI model performance with real-time Root Cause Analysis (RCA) capabilities.

## Features

- 🎨 Modern UI with animations and transitions
- 📱 Responsive design for all screen sizes
- 🎯 Drag-and-drop color picker
- 📧 Team member invitation system
- 🎨 Customizable color schemes
- 🔒 Role-based access control
- 🔄 Real-time updates
- 📊 Integration with monitoring tools

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion
- React Hook Form
- Zod
- Radix UI
- React DnD

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd rca-dashboard-frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory and add your environment variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`.

## Deployment

### Vercel Deployment

1. Push your code to a GitHub repository.

2. Go to [Vercel](https://vercel.com) and sign in with your GitHub account.

3. Click "New Project" and select your repository.

4. Configure the project settings:
   - Framework Preset: Next.js
   - Root Directory: frontend
   - Build Command: `npm run build` or `yarn build`
   - Output Directory: .next
   - Install Command: `npm install` or `yarn install`

5. Add your environment variables in the Vercel dashboard.

6. Click "Deploy"

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL of your backend API |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL for real-time updates |
| `NEXT_PUBLIC_AUTH_URL` | Authentication service URL |

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # UI components
│   └── onboarding/       # Onboarding components
├── lib/                  # Utility functions
└── types/               # TypeScript types
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 