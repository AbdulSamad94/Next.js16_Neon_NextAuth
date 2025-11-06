
# Project Overview

This is a blogging platform built with Next.js, TypeScript, and Drizzle ORM. It uses NextAuth.js for authentication with Google, GitHub, and credentials providers. The database schema includes tables for users, posts, categories, comments, likes, and follows. The frontend is built with React and uses components from Radix UI and custom components.

## Directory Structure

- **`/app`**: This directory contains the core application code, including pages, layouts, and API routes.
  - **`/app/api`**: This directory contains the API routes for the application.
    - **`/app/api/auth`**: This directory contains the authentication-related API routes, including the NextAuth.js route and a signup route.
    - **`/app/api/blogs`**: This directory contains the API routes for managing blogs.
    - **`/app/api/categories`**: This directory contains the API routes for managing categories.
  - **`/app/blog`**: This directory contains the page for displaying a single blog post.
  - **`/app/create`**: This directory contains the page for creating a new blog post.
  - **`/app/edit`**: This directory contains the page for editing an existing blog post.
  - **`/app/login`**: This directory contains the login page.
  - **`/app/settings`**: This directory contains the user settings page.
  - **`/app/signup`**: This directory contains the signup page.
- **`/components`**: This directory contains the reusable React components used throughout the application.
  - **`/components/blog`**: This directory contains the components related to blog posts, such as the blog card, blog content, and featured blog.
  - **`/components/shared`**: This directory contains the shared components, such as the empty state, error state, and loader.
  - **`/components/ui`**: This directory contains the UI components, such as the alert dialog, avatar, button, and card.
- **`/lib`**: This directory contains the library code, such as the database configuration, authentication configuration, and utility functions.
  - **`/lib/auth`**: This directory contains the authentication-related code, including the NextAuth.js configuration.
  - **`/lib/db`**: This directory contains the database-related code, including the Drizzle ORM configuration and schema.
  - **`/lib/validations`**: This directory contains the validation schemas for the application.
- **`/public`**: This directory contains the public assets, such as images and fonts.

## Key Technologies

- **Next.js**: A React framework for building server-side rendered and statically generated web applications.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
- **Drizzle ORM**: A TypeScript ORM for SQL databases.
- **NextAuth.js**: An authentication library for Next.js applications.
- **React**: A JavaScript library for building user interfaces.
- **Radix UI**: A collection of accessible and unstyled UI components.
- **Tailwind CSS**: A utility-first CSS framework.
- **PostgreSQL**: A powerful, open-source object-relational database system.

## Database Schema

The database schema is defined in the `/lib/db/schema/schema.ts` file. It includes the following tables:

- **`users`**: Stores user information, including their name, email, password hash, and role.
- **`posts`**: Stores blog post information, including the title, content, author, and status.
- **`categories`**: Stores blog post categories.
- **`postCategories`**: A junction table that links posts and categories.
- **`comments`**: Stores comments on blog posts.
- **`postLikes`**: Stores likes on blog posts.
- **`commentLikes`**: Stores likes on comments.
- **`follows`**: Stores user following relationships.

## Authentication

Authentication is handled by NextAuth.js. The configuration is in the `/lib/auth/auth.ts` file. It supports the following authentication providers:

- **Google**: Allows users to sign in with their Google account.
- **GitHub**: Allows users to sign in with their GitHub account.
- **Credentials**: Allows users to sign in with their email and password.

## API Routes

The API routes are defined in the `/app/api` directory. They provide the following functionality:

- **`/api/auth/...`**: Handles authentication-related requests, such as sign in, sign out, and sign up.
- **`/api/blogs`**: Handles requests for creating, reading, updating, and deleting blog posts.
- **`/api/categories`**: Handles requests for reading categories.
