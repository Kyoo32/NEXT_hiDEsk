var express =require('express');
var session = require('express-session');
var app = express();
//
/***************facebook login ***************/
var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;
// serialize
// 인증 후 사용자 정보를 세션에 저장
passport.serializeUser(function(user, done){
  console.log('serialieze');
  done(null, user);
});

// desrialize
//인증후, 사용자 정보를 세션에서 읽어서 request.user에 저장
passport.deserializeUser(function (user, done){
  console.log('deserialize');
  done(null, user);
});

passport.use(
  new FacebookStrategy({
    clientID:'1567820353510162',
    clientSecret: '2f35c66fd2c3f91235a697015079acaa',
    callbackURL: "http://localhost:8080/auth/facebook/callback",
    auth_type: "reauthenticate",
    profileFields: ['id', 'emails', 'name', 'gender', 'displayName']
  },
  function (accessToken, refreshToken, profile, done){
    console.log(profile);
    done(null, profile);
  }
));

app.use(session({
  secret : "secret",
  resave : false,
  saveUninitialized : true
}));
app.use(passport.initialize());
app.use(passport.session());

var login_tpl = "";
var loginCheck = function (req, res, next) {
  login_tpl = "";
  if(req.session.login_ok =='yes')
    login_tpl += "<div> login : " + req.session.login_id + "</div>";
  next();
};
app.use(loginCheck);

/*****************************************/

var bodyparser = require('body-parser').urlencoded({extended : true});
app.use(bodyparser);
app.use('/styles', express.static(__dirname + '/styles'));
app.use('/upload', express.static(__dirname + '/upload'));

var handlebars = require('express-handlebars').create({defaultlayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 8080);

app.get('/', function(req, res){
  res.render('indexDesk', {login_status : login_tpl});
});
app.get('/randomDesk',function(req, res){
  res.render('randomDesk', {login_status : login_tpl});
});

// app.get('/viewDesk', function(req,res){
//   res.render('indexDesk', {nickName : req.session.login_id});
// });
app.get('/showSignUp', function(req, res){
  res.render('signup');
});
app.get('/showSignin', function(req, res){
    if(req.session.login_ok =='yes'){
          res.redirect('/randomDesk');
    } else {
      res.render('signin');
    }
});

app.get('/myPage', function(req, res){
  res.render('userHome', {user_name : req.session.login_id} )
});
app.get('/postNewDesk', function(req, res){
  res.render('postNewDesk');
});


app.post('/validateLogin', function(req,res){
  console.log(req.body);
  var userInputEmail = req.body.inputEmail;
  var userInputPw = req.body.login_pw;
  //else if(loginCheck(userIputEmail, userInputPw)){}
  req.session.login_ok = 'yes';
  req.session.login_id = userInputEmail;
  res.redirect('/randomDesk');
});

app.get('/auth/facebook',
  passport.authenticate('facebook',{
    scope: ['email']
  })
);

app.get('/auth/facebook/callback',
  passport.authenticate('facebook',{
    successRedirect: '/login_success',
    failureRedirect: '/login_fail'
  })
);
app.get('/login_success', ensureAuthenticated, function (req, res){
  req.session.login_ok = 'yes';
  req.session.login_id = req.user.emails[0].value;
  res.redirect('/randomDesk');
});

app.get('/login_fail', function(req, res){
  console.log('login fail');
  res.redirect('/');
});

app.get('/logout', function(req, res){
  req.session.destroy();
  req.logout();
  res.redirect('/');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://locathost' + app.get('port') + ': press Ctrl + C to terminate');
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
