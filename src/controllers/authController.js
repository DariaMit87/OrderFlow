const passport = require('../config/passport');

function getLogin(req, res) {
  if (req.isAuthenticated()) return res.redirect('/dashboard');
  res.render('login', { title: 'Login - OrderFlow' });
}

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

function logout(req, res, next) {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.redirect('/login');
    });
  });
}

module.exports = { getLogin, postLogin, logout };
