# NetStar Inventory Management App - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is an Ionic Angular mobile application for inventory management at NetStar company in Ambato. The app manages equipment and materials with role-based access control.

## Architecture & Technologies
- **Framework**: Ionic 7 with Angular 18+ (Standalone Components)
- **Database**: SQLite with Capacitor for local storage
- **State Management**: Angular Services with RxJS
- **Authentication**: JWT-based with role-based access control
- **QR/Barcode Scanning**: Capacitor Camera plugin
- **UI Framework**: Ionic Components

## User Roles & Permissions
1. **Administrador (Administrator)**
   - Full CRUD access to materials, works, users
   - Complete reporting access
   - User management capabilities

2. **Encargado (Manager)**
   - Material delivery registration
   - Inventory monitoring
   - Low stock alerts
   - Material consultation

3. **Técnico (Technician)**
   - Material usage reporting by work
   - Material availability consultation
   - Limited read-only access

## Key Modules
- `auth/` - Authentication and role management
- `materials/` - Material CRUD and inventory management
- `works/` - Work project management
- `users/` - User management (admin only)
- `reports/` - Reporting and analytics
- `shared/` - Common components and services

## Code Style Guidelines
- Use Angular standalone components
- Implement lazy loading for all feature modules
- Use TypeScript strict mode
- Follow Ionic UI patterns and best practices
- Implement offline-first architecture with data synchronization
- Use reactive forms for all form inputs
- Implement proper error handling and user feedback

## Security Considerations
- Role-based guard implementations
- Secure local data storage
- Input validation and sanitization
- Session management with automatic logout

## Performance
- Implement virtual scrolling for large lists
- Use OnPush change detection strategy
- Optimize images and assets
- Implement proper caching strategies
