// Redirects the user to their role-specific dashboard after login
function getDashboard(req, res) {
  if (req.user.role === 'WAITER') return res.redirect('/waiter');
  if (req.user.role === 'COOK')   return res.redirect('/kitchen');
  res.redirect('/login');
}

module.exports = { getDashboard };
