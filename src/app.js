require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('./config/passport');
const path = require('path');

const authRoutes      = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const waiterRoutes    = require('./routes/waiterRoutes');
const kitchenRoutes   = require('./routes/kitchenRoutes');

const app = express();

// Use Pug as the HTML templating engine, with views stored in src/views
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serve static CSS, JS, and image files from the public folder
app.use(express.static(path.join(__dirname, '..', 'public')));

// Parse URL-encoded form submissions (extended enables nested objects like items[1][qty])
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Store user sessions server-side; the session ID is kept in a browser cookie
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 8 * 60 * 60 * 1000 }, // sessions expire after 8 hours
}));

// Initialise Passport and restore any existing login session from the cookie
app.use(passport.initialize());
app.use(passport.session());

// Enable one-time flash messages that survive a single redirect
app.use(flash());

// Expose the current user and any flash messages to every Pug template
app.use((req, res, next) => {
  res.locals.user    = req.user || null;
  res.locals.success = req.flash('success');
  res.locals.error   = req.flash('error');
  next();
});

// Mount routes
app.get('/', (req, res) => res.redirect('/dashboard'));
app.use('/dashboard', dashboardRoutes);
app.use(authRoutes);
app.use('/waiter', waiterRoutes);
app.use('/kitchen', kitchenRoutes);

// Return a 404 page for any unmatched URL
app.use((req, res) => {
  res.status(404).render('error', { title: 'Not Found', message: 'Page not found.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  const message = process.env.NODE_ENV === 'production'
    ? 'Something went wrong. Please try again.'
    : err.message;
  res.status(500).render('error', { title: 'Server Error', message });
});

module.exports = app;
