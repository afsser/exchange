# Currency Converter

A modern, responsive currency converter built with Next.js 15 and the App Router, featuring real-time exchange rates and a clean, accessible interface.

## Deployed on
https://api-currex.vercel.app/

## 🛠️ Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React 19** - Latest React with modern hooks
- **API Routes** - Server-side API handling
- **Dev Container** - Consistent development environment

## 🐳 Development Environment

This project is configured to run and was developed in a **Dev Container** on Debian GNU/Linux 12 (bookworm), ensuring consistent development across different machines and platforms.

## 🚀 Key Features

- **Real-time Exchange Rates**: Powered by the ExchangeRate API
- **Modern React Patterns**: Hooks, TypeScript interfaces, and proper state management
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode Support**: Automatic theme detection and switching
- **Input Validation**: Smart amount limiting and error handling
- **Loading States**: Smooth UX with loading indicators and animations

## 🏗️ Architecture Highlights

- **App Router**: Leverages Next.js 15's latest routing system
- **Server Components**: Optimized performance with RSC
- **API Routes**: Clean separation of concerns with `/api/convert` endpoint
- **Type Safety**: Full TypeScript integration with proper interfaces
- **Error Boundaries**: Graceful error handling and user feedback

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
src/
  app/
    api/
      convert/
        route.ts      # Currency conversion API endpoint
    page.tsx          # Main application page
    layout.tsx        # Root layout with metadata
    globals.css       # Global styles and Tailwind
```

## 🎯 Core Concepts Demonstrated

- **Modern React**: Functional components with hooks
- **API Integration**: External API consumption with error handling
- **Responsive Design**: Mobile-first CSS with Tailwind
- **State Management**: Local state with React hooks
- **Type Safety**: TypeScript interfaces and proper typing
- **Performance**: Optimized with Next.js App Router
- **UX Best Practices**: Loading states, validation, and feedback

## 🌐 API Integration

Uses the [ExchangeRate-API](https://api.exchangerate-api.com/) for real-time exchange rates, supporting major currencies including USD, EUR, GBP, BRL, JPY, AUD, CAD, CHF, and CNY.

## 📱 Responsive Features

- Mobile-optimized interface
- Dark/light mode support
- Smooth animations and transitions
- Accessible form controls
- Real-time validation feedback

---

Built with ❤️ using modern web technologies and best practices.
