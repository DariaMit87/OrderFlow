const passport = require('../config/passport');

// Renders the login page, or redirects to dashboard if the user is already logged in
function getLogin(req, res) {
  if (req.isAuthenticated()) return res.redirect('/dashboard');
  res.render('login', { title: 'Login - OrderFlow' });
}

// Authenticates the submitted username and password using Passport
function postLogin(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.flash('error', info.message || 'Login failed.');
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect('/dashboard');
    });
  })(req, res, next);
}

// Ends the session and redirects the user back to the login page
function logout(req, res, next) {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.redirect('/login');
    });
  });
}

module.exports = { getLogin, postLogin, logout };
