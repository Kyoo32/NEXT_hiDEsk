var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimt : 10,
  port: 3306,
  
  multipleStatements: true
});
//console.log('log');

var bodyparser = require('body-parser').urlencoded({extended : true});
router.use(bodyparser);

router.post('/validate', function(req,res){
  console.log(req.body);
  var userInputEmail = req.body.inputEmail;
  var userInputPw = req.body.loginPassword;

  //else if(loginCheck(userIputEmail, userInputPw)){}
  var queryString = 'call sp_validateLogin("' + userInputEmail + '");'

  pool.query(queryString, function(err, rows, fields) {
      if (err) throw err;
      console.log('!!!' +rows[0].length);
      var exist = rows[0].length;

      if(exist > 0){
        req.session.login_ok = 'yes';
        req.session.login_id = userInputEmail;
        console.log("validaet log by " + userInputEmail);
        res.redirect('/randomDesk');
      } else{
        res.render('signin', {result : "no such user"});
      }

    });
});

router.post('/signup', function(req,res){
  console.log(req.body);
  var userInputEmail = req.body.inputEmail;
  var userInputPw = req.body.loginPassword;
  //else if(loginCheck(userIputEmail, userInputPw)){}
  var queryString = 'call sp_validateLogin("' + userInputEmail + '");'

  pool.query(queryString, function(err, rows, fields) {
      if (err) throw err;
      console.log('!!!' +rows[0].length);
      var exist = rows[0].length;

      if(exist == 0){

        var insertString = 'insert into nextPerson (email, password) values("' + userInputEmail + '" , "' + userInputPw  +'" );';
        pool.query(insertString, function(err, results){
          if(err) throw err;
          console.log(results);
        });
        req.session.login_ok = 'yes';
        req.session.login_id = userInputEmail;
        console.log("validaet log by " + userInputEmail);
        res.redirect('/randomDesk');
      } else{
        res.render('signup', {result : "such user already exists"});
      }
    });
});

router.get('/inSuccess', ensureAuthenticated, function (req, res){
  req.session.login_ok = 'yes';
  req.session.login_id = req.user.emails[0].value;
  console.log("log by " + req.session.login_id);
  res.redirect('/randomDesk');
});

router.get('/inFail', function(req, res){
  console.log('login fail');
  res.redirect('/');
});

router.get('/out', function(req, res){
  //console.log("??");
  req.session.destroy();
  req.logout();
  console.log('login out');
  GLOBAL.profile = null;
  res.redirect('/');
});

function ensureAuthenticated(req, res, next){
  console.log("USER ::");
  console.log(GLOBAL.profile);

  if(req.isAuthenticated()){
    console.log('login ensure');
    return next();
  }
  else {
    console.log('not ensure login');
  }
  res.redirect('/');
}


module.exports = router;
