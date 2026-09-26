export const config = {
  puerto: process.env.PORT ?? 3000,
  db: process.env.DATABASE_URL,
  sessionSecret: process.env.SESSION_SECRET,
  jwtSecret: process.env.JWT_SECRET,
};

