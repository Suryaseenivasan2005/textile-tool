# Login Credentials

## Default Admin User

**Mobile Number**: `9688257055`  
**Password**: `Karthick@123`  
**Name**: Admin User

---

## How to Use

### Local Development
1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Navigate to: `http://localhost:5173/login`

4. Enter credentials:
   - Mobile: `9688257055`
   - Password: `Karthick@123`

---

### Production (Vercel)
1. Navigate to your deployed frontend URL
2. Go to the login page
3. Enter the same credentials:
   - Mobile: `9688257055`
   - Password: `Karthick@123`

---

## Resetting Password

If you need to reset or change the password, update the `backend/src/seed.ts` file and run:

```bash
cd backend
npm run seed
```

This will update the user in the database with the new password.

---

## Security Notes

⚠️ **Important**: 
- Change the default password in production
- Do not commit `.env` files with sensitive data
- Keep this credentials file secure and do not commit it to version control
- Consider adding this file to `.gitignore`

---

## Database Information

- **Database**: MongoDB Atlas
- **Connection**: Configured in `backend/.env`
- **User Collection**: `users`
- **Password**: Hashed using bcrypt (salt rounds: 10)

---

## Seeded On
Last seeded: 2026-01-20

## Status
✅ User successfully created/updated in database
