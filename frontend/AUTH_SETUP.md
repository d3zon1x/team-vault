# TeamVault Frontend - Auth System

A polished, modern SaaS authentication frontend for TeamVault built with React, TypeScript, Vite, and Tailwind CSS.

## Features Implemented

### Pages
- ✅ **Landing Page** (`/`) - Modern SaaS hero with feature cards
- ✅ **Login** (`/login`) - Email/password auth with forgot password link
- ✅ **Register** (`/register`) - Sign up with email validation and password requirements
- ✅ **Verify Email** (`/verify-email`) - Email verification flow with loading/success/error states
- ✅ **Forgot Password** (`/forgot-password`) - Request password reset link
- ✅ **Reset Password** (`/reset-password`) - Create new password with token verification
- ✅ **Dashboard** (`/dashboard`) - Protected route showing user info and placeholder cards
- ✅ **Change Password** (`/change-password`) - Protected route for password management

### Technical Features
- ✅ **Protected Routes** - ProtectedRoute component with auth guard
- ✅ **Auth Context** - Centralized auth state management
- ✅ **API Client** - Axios-based with automatic token refresh
- ✅ **Token Refresh Flow** - Automatic retry on 401 with token refresh
- ✅ **Form Validation** - React Hook Form + Zod for robust validation
- ✅ **Toast Notifications** - Sonner for user feedback
- ✅ **Responsive Design** - Mobile-first Tailwind CSS
- ✅ **Dark SaaS Theme** - Modern gradient backgrounds and smooth animations
- ✅ **TypeScript** - Full type safety throughout

## Tech Stack

```
Frontend:
- React 19.2.6
- TypeScript 6.0.2
- Vite 8.0.12
- Tailwind CSS 4.3.1
- React Router DOM 7.18.0
- Axios 1.18.0
- React Hook Form 7.52.1
- Zod 3.23.10
- Lucide React 0.396.0 (Icons)
- Sonner 1.5.1 (Toasts)
```

## Setup & Installation

### Prerequisites
- Node.js 20.19+ or 22.12+
- npm or yarn
- Backend API running at http://localhost:8000/api

### Installation Steps

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. App will be available at http://localhost:5173
```

### Environment Configuration

The API base URL is hardcoded to `http://localhost:8000/api` in `src/lib/apiClient.ts`. To change it, update:

```typescript
const API_BASE_URL = 'http://localhost:8000/api';
```

## Authentication Flow

### Login Flow
1. User enters email and password on `/login`
2. Frontend sends credentials to `POST /auth/login`
3. Backend returns `access_token` and `refresh_token`
4. Tokens stored in localStorage
5. User redirected to `/dashboard`

### Token Refresh
- Access tokens are automatically attached to all requests via interceptor
- If API returns 401, axios interceptor:
  1. Calls `POST /auth/refresh` with refresh_token
  2. Gets new access_token
  3. Retries original request
  4. On failure, clears tokens and redirects to login

### Registration Flow
1. User fills email, username, password on `/register`
2. Frontend sends to `POST /auth/register`
3. Backend returns success message
4. User shown verification page
5. User checks email and clicks verification link
6. Link redirects to `/verify-email?token=XXX`
7. Frontend calls `GET /auth/verify-email?token=XXX`
8. On success, user can log in

### Password Reset Flow
1. User enters email on `/forgot-password`
2. Backend sends reset link
3. User clicks link in email → `/reset-password?token=XXX`
4. User enters new password
5. Frontend sends to `POST /auth/reset-password`
6. User redirected to login on success

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── ProtectedRoute.tsx          # Auth guard component
│   ├── context/
│   │   └── AuthContext.tsx             # Auth state & logic
│   ├── lib/
│   │   ├── apiClient.ts                # Axios + interceptors
│   │   ├── authStorage.ts              # localStorage helper
│   │   └── validation.ts               # Zod schemas
│   ├── pages/
│   │   ├── LandingPage.tsx             # /
│   │   ├── LoginPage.tsx               # /login
│   │   ├── RegisterPage.tsx            # /register
│   │   ├── VerifyEmailPage.tsx         # /verify-email
│   │   ├── ForgotPasswordPage.tsx      # /forgot-password
│   │   ├── ResetPasswordPage.tsx       # /reset-password
│   │   ├── DashboardPage.tsx           # /dashboard
│   │   └── ChangePasswordPage.tsx      # /change-password
│   ├── types/
│   │   └── auth.ts                     # TypeScript interfaces
│   ├── App.tsx                         # Main router
│   ├── main.tsx                        # Entry point
│   ├── index.css                       # Tailwind directives
│   └── App.css                         # App styles (minimal)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

## How to Test the Auth Flow

### Prerequisites
Make sure the backend is running at `http://localhost:8000/api`

### Test Scenarios

#### 1. **Landing Page**
```
1. Navigate to http://localhost:5173/
2. Verify hero section with features
3. Click "Get started" → should go to /register
4. Click "Sign in" → should go to /login
```

#### 2. **Register & Email Verification**
```
1. Go to http://localhost:5173/register
2. Fill in:
   - Email: testuser@example.com
   - Username: testuser123
   - Password: TestPassword123
   - Confirm Password: TestPassword123
3. Click "Create account"
4. Should see verification message
5. Check backend for verification email (or check backend logs)
6. Copy verification token from email
7. Go to http://localhost:5173/verify-email?token=<TOKEN>
8. Should see success message
9. Can now log in
```

#### 3. **Login**
```
1. Go to http://localhost:5173/login
2. Enter verified user credentials
3. Click "Sign in"
4. Should redirect to /dashboard
5. Should show user info
```

#### 4. **Dashboard (Protected Route)**
```
1. When logged in, go to /dashboard
2. Should see user information
3. Should see placeholder cards for future features
4. Click "Logout" button
5. Should redirect to /login
```

#### 5. **Forgot Password**
```
1. Go to http://localhost:5173/forgot-password
2. Enter email from registered account
3. Click "Send reset link"
4. Should see success message
5. Check backend for reset email
6. Copy reset token
7. Go to http://localhost:5173/reset-password?token=<TOKEN>
8. Enter new password
9. Click "Reset password"
10. Should redirect to login with new password
```

#### 6. **Change Password (Protected)**
```
1. Log in first
2. Go to http://localhost:5173/change-password
3. Enter:
   - Current password
   - New password
   - Confirm new password
4. Click "Change password"
5. Should see success message
```

#### 7. **Protected Routes**
```
1. Log out (or clear localStorage)
2. Try to access /dashboard directly
3. Should redirect to /login
4. Try to access /change-password directly
5. Should redirect to /login
```

### Test Error Handling

#### Invalid Login
```
1. Go to /login
2. Enter wrong credentials
3. Should show error toast with backend message
```

#### Expired Token Simulation
```
1. Log in
2. Open DevTools Console
3. Run: localStorage.removeItem('auth_tokens')
4. Try to access /dashboard
5. Should redirect to /login
```

#### Network Errors
```
1. Stop the backend server
2. Try to log in
3. Should show error toast
4. Start backend again - should work normally
```

## Validation Rules

### Login
- Email: Valid email format
- Password: Min 8 characters

### Register
- Email: Valid email format
- Username: 3-50 chars, alphanumeric + underscore/hyphen
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
- Confirm Password: Must match password

### Password Reset/Change
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
- Must be different from current password (change password only)

## Build for Production

```bash
# Build
npm run build

# Output will be in dist/

# Preview build
npm run preview
```

## Docker

The existing Dockerfile should work with this frontend setup:

```bash
docker build -t teamvault-frontend .
docker run -p 5173:5173 teamvault-frontend
```

## Environment Variables

Currently, no environment variables are required. To make the API URL configurable:

1. Create `.env.local` in project root
2. Add: `VITE_API_URL=http://localhost:8000/api`
3. Update `apiClient.ts`:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
   ```

## Known Limitations

- Google OAuth button is visually ready but not functional (placeholder)
- File uploads not yet implemented
- Workspace/page functionality placeholder only
- No persistent session across browser closes (tokens cleared with session)

## Future Enhancements

- Add Google OAuth integration
- Implement workspace creation/management
- Add page editor with markdown
- Implement real-time collaboration
- Add search functionality
- Implement role-based access UI
- Add email notification preferences
- Add user profile editing

## Debugging

### Check Auth State
Open DevTools Console and run:
```javascript
JSON.parse(localStorage.getItem('auth_tokens'))
JSON.parse(localStorage.getItem('auth_user'))
```

### Check API Requests
1. Open DevTools Network tab
2. Perform auth actions
3. Check request/response bodies
4. Check headers for Authorization: Bearer <token>

### Common Issues

**Issue**: Stuck on login
- Clear localStorage: `localStorage.clear()`
- Check if backend is running

**Issue**: Token refresh not working
- Check refresh_token exists in localStorage
- Check backend refresh endpoint is working

**Issue**: Validation errors not clearing
- This is expected - form keeps errors until valid
- Scroll down to see all error messages

## Support

For issues or questions about the frontend implementation, check:
1. Browser console for errors
2. Network tab for API responses
3. Backend logs for server-side issues
4. This README for configuration help
