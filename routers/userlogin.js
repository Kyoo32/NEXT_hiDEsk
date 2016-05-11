var express = require('express');
var app = express();
var router = express.Router();


console.log('log');
router.get('/login_success', ensureAuthenticated, function (req, res){
  req.session.login_ok = 'yes';
  req.session.login_id = req.user.emails[0].value;
  res.redirect('/randomDesk');
});

router.get('/login_fail', function(req, res){
  console.log('login fail');
  res.redirect('/');
});

router.get('/logout', function(req, res){
  req.session.destroy();
  req.logout();
  console.log('login out');
  res.redirect('/');
});



function ensureAuthenticated(req, res, next){
  console.log("USER ::");
  console.log(req.user);

  if(req.isAuthenticated()){
    console.log('login ensure');
    return next();
  }
  else {
    console.log('not ensure login');
    res.redirect('/');
  }
}



module.exports = app;
