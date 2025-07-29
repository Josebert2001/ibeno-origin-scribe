# Ibeno Origin Scribe

<div align="center">
  <img src="public/logo.png" alt="Ibeno Origin Scribe Logo" width="200"/>
</div>

A modern certificate generation and verification system for authenticating Ibeno community membership and origin.

## About

Ibeno Origin Scribe is a web application designed to streamline the process of generating, managing, and verifying certificates of origin for members of the Ibeno community. The system provides a secure and efficient way to issue digital certificates with QR code verification.

## Features

- **Digital Certificate Generation**: Automated creation of certificates with unique QR codes
- **Admin Dashboard**: Manage and monitor certificate issuance
- **Secure Authentication**: Protected access for administrative functions
- **QR Code Verification**: Easy verification of certificate authenticity
- **Supabase Integration**: Robust backend for data management and storage

## Technology Stack

- **Frontend**:
  - React with TypeScript
  - Vite for build tooling
  - shadcn-ui components
  - Tailwind CSS for styling

- **Backend**:
  - Supabase for database and authentication
  - Serverless functions for certificate generation
  - QR code generation service

## Getting Started

1. **Prerequisites**
   - Node.js (Latest LTS version)
   - npm or bun package manager

2. **Installation**
   ```sh
   # Clone the repository
   git clone https://github.com/Josebert3001/ibeno-origin-scribe.git

   # Navigate to project directory
   cd ibeno-origin-scribe

   # Install dependencies
   npm install
   # or
   bun install

   # Start the development server
   npm run dev
   # or
   bun run dev
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Configure your Supabase credentials

## Project Structure

- `/src` - Source code
  - `/components` - React components
  - `/pages` - Application pages
  - `/integrations` - External service integrations
  - `/utils` - Utility functions
- `/public` - Static assets
- `/supabase` - Database migrations and functions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any queries regarding this project, please open an issue in the GitHub repository.
