# NextJS Blog Platform

A modern, feature-rich blog platform built with Next.js 16 (App Router), TypeScript, and a comprehensive tech stack designed for content creators and developers. This platform provides a complete solution for creating, managing, and publishing content with modern web development practices.

## Features

### Core Functionality

- **Blog Management**: Full CRUD operations for blog posts with draft/published states
- **Rich Text Editor**: Built with TipTap for advanced content editing
- **User Authentication**: NextAuth.js with multiple providers support
- **File Upload**: Cloudinary integration for image uploads
- **Category Management**: Organize posts with custom categories
- **Progressive Loading**: Skeleton components and smooth transitions for optimal UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS + ShadCN UI + Framer Motion for animations
- **Database**: NeonDB (PostgreSQL) with Drizzle ORM
- **Authentication**: NextAuth.js with credential provider
- **Validation**: Zod for schema validation
- **File Upload**: Cloudinary for secure image uploads
- **Testing**: Jest + React Testing Library with comprehensive test coverage
- **Package Manager**: pnpm

### Security & Performance

- **Secure Authentication**: Credential-based authentication with bcrypt password hashing
- **SQL Injection Prevention**: Drizzle ORM parameterized queries
- **Data Validation**: Comprehensive Zod schema validation on both client and server
- **Rate Limiting**: Built-in protections against abuse
- **Progressive Web App**: Optimized for performance and offline capabilities

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm package manager
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/AbdulSamad94/Next.js16_Neon_NextAuth.git
   cd nextjs-16
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory with the following variables:

   ```env
   # Database
   DATABASE_URL="your_neon_db_connection_string"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your_secret_key"

   # Cloudinary
   CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
   CLOUDINARY_API_KEY="your_cloudinary_api_key"
   CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

   # GitHub OAuth (optional)
   GITHUB_ID="your_github_client_id"
   GITHUB_SECRET="your_github_client_secret"
   ```

4. **Run database migrations**

   ```bash
   pnpm generate
   pnpm push
   ```

5. **Run the development server**

   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application

## Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm test` - Run all tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm lint` - Lint the codebase
- `pnpm type-check` - Check TypeScript types

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes for auth, blogs, categories
│   ├── blog/              # Blog detail pages
│   ├── create/            # Blog creation page
│   ├── edit/              # Blog editing page
│   ├── login/             # Login page
│   └── signup/            # Signup page
├── components/            # Reusable React components
│   ├── blog/              # Blog-specific components
│   ├── ui/                # ShadCN UI components
│   └── shared/            # Shared UI components
├── lib/                   # Core libraries and utilities
│   ├── auth/              # Authentication logic
│   ├── db/                # Database configuration and schema
│   ├── validations/       # Zod validation schemas
│   └── types.ts           # TypeScript type definitions
├── public/                # Static assets
└── styles/                # Global styles
```

## Testing

The application includes comprehensive test coverage using Jest and React Testing Library:

- **Unit Tests**: Individual components and utility functions
- **Integration Tests**: API routes and database interactions
- **Component Tests**: UI components with mock data

To run tests with coverage:

```bash
pnpm test -- --coverage
```

## Contributing

We welcome contributions to make this blog platform even better! Here's how you can help:

### Getting Started

1. Fork the repository
2. Create a new branch for your feature: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests if applicable
5. Run the test suite: `pnpm test`
6. Commit your changes: `git commit -m 'feat: Add amazing feature'`
7. Push to your branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Development Guidelines

- Write TypeScript code with proper type annotations
- Follow the existing code style and conventions
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass before submitting a PR

### Code Standards

- Use descriptive names for variables, functions, and components
- Maintain consistent indentation (2 spaces for TypeScript/JavaScript)
- Write JSDoc comments for complex functions
- Keep components focused and modular
- Follow accessibility best practices

### Issues

We use GitHub issues to track bugs and feature requests. When creating an issue:

- Provide a clear title and description
- Include steps to reproduce for bugs
- Suggest possible solutions when possible
- Use appropriate labels

## Architecture

### Frontend

- **Next.js 16**: App Router for file-based routing and server components
- **TypeScript**: Strong typing throughout the application
- **Tailwind CSS**: Utility-first styling with custom configuration
- **ShadCN UI**: Pre-built accessible components
- **Framer Motion**: Smooth animations and transitions
- **React Hook Form**: Form handling with Zod validation

### Backend

- **Next.js API Routes**: Server-side endpoints for data operations
- **NextAuth.js**: Authentication middleware with various providers
- **Drizzle ORM**: Type-safe database queries with PostgreSQL
- **Zod**: Runtime validation and schema definition
- **Cloudinary**: Secure file upload and image optimization

### Database

- **NeonDB**: Serverless PostgreSQL database with branching
- **Drizzle Schema**: Type-safe database schema definition
- **Migrations**: Automated schema management

## Deployment

### Vercel (Recommended)

This application is optimized for deployment on Vercel:

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Add environment variables in the Vercel dashboard
4. Deploy automatically on every push to main branch

### Other Platforms

The application can also be deployed on any platform that supports Next.js 16, such as Netlify, AWS, or Google Cloud.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

- Check the existing [Issues](https://github.com/Next.js16_Neon_NextAuth/issues)
- Create a new issue with detailed information
- Review the documentation in this README
- Look at the code comments for specific implementation details

## Acknowledgements

- [Next.js](https://nextjs.org) for the excellent React framework
- [Tailwind CSS](https://tailwindcss.com) for the utility-first styling
- [ShadCN](https://ui.shadcn.com) for the accessible UI components
- [Drizzle ORM](https://orm.drizzle.team) for the type-safe database toolkit
- [NextAuth.js](https://next-auth.js.org) for the authentication solution
