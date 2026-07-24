# Indian Estate

A full-stack real-estate marketplace where users can sign up (email/password or Google), create property listings with images, and search listings by type, amenities, price range, and more.

**Stack:** MongoDB · Express · React (Vite) · Node — with Redux Toolkit, Tailwind CSS, Firebase (Google OAuth only), and JWT cookie auth. Listing and avatar images are stored in MongoDB and served by the API — no paid storage service required.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   npm install --prefix client
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env` and fill in `MONGO` and `JWT_SECRET`.
   - Copy `client/.env.example` to `client/.env` and fill in `VITE_FIREBASE_API_KEY`.

3. Run the app in development (two terminals):

   ```bash
   npm run dev            # API server on http://localhost:3000
   npm run dev --prefix client   # Vite dev server on http://localhost:5173
   ```

   The Vite dev server proxies `/api` requests to the API server.

## Production build

```bash
npm run build   # installs deps and builds the client into client/dist
npm start       # serves the API and the built client
```

## API overview

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | — | Create an account |
| POST | `/api/auth/signin` | — | Sign in, sets `access_token` cookie |
| POST | `/api/auth/google` | — | Sign in/up with Google |
| GET | `/api/auth/signout` | — | Clear the auth cookie |
| GET | `/api/auth/validate` | ✓ | Check whether the auth cookie is still valid |
| POST | `/api/user/update/:id` | ✓ | Update own profile |
| DELETE | `/api/user/delete/:id` | ✓ | Delete own account (and its listings) |
| GET | `/api/user/listings/:id` | ✓ | List own listings |
| GET | `/api/user/:id` | ✓ | Get a user's public info |
| POST | `/api/image/upload` | ✓ | Upload an image (raw body, `image/*`, max 2 MB) |
| GET | `/api/image/:id` | — | Serve a stored image |
| POST | `/api/listing/create` | ✓ | Create a listing |
| POST | `/api/listing/update/:id` | ✓ | Update own listing |
| DELETE | `/api/listing/delete/:id` | ✓ | Delete own listing |
| GET | `/api/listing/get/:id` | — | Get one listing |
| GET | `/api/listing/get` | — | Search listings (`searchTerm`, `type`, `offer`, `furnished`, `parking`, `minPrice`, `maxPrice`, `sort`, `order`, `limit`, `startIndex`) |
