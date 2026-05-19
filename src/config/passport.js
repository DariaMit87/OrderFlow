const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const prisma = require('./prisma');

// Looks up the user by username and verifies the hashed password
passport.use(new LocalStrategy(
  { usernameField: 'username' },
  async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user) return done(null, false, { message: 'Invalid username or password.' });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false, { message: 'Invalid username or password.' });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Stores only the user's ID in the session cookie to keep session data minimal
passport.serializeUser((user, done) => done(null, user.id));

// Finds the full user object from the database on every authenticated request
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
