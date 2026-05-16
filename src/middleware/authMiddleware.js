function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

function ensureRole(role) {
  return (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === role) return next();
    if (!req.isAuthenticated()) return res.redirect('/login');
    res.status(403).render('error', { title: 'Access Denied', message: 'You do not have permission to view this page.' });
  };
}

function ensureAnyRole(roles) {
  return (req, res, next) => {
    if (req.isAuthenticated() && roles.includes(req.user.role)) return next();
    if (!req.isAuthenticated()) return res.redirect('/login');
    res.status(403).render('error', { title: 'Access Denied', message: 'You do not have permission to view this page.' });
  };
}

module.exports = { ensureAuthenticated, ensureRole, ensureAnyRole };
