var express = require('express');
var router = express.Router();

var login_tpl = "";
var loginCheck = function (req, res, next) {
  login_tpl = "";
  if(req.session.login_ok =='yes')
    login_tpl += "<div> login : " + req.session.login_id + "</div>";
  next();
};
router.use(loginCheck);


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
    clientID:'?',
    clientSecret: '?',
    callbackURL: "http://localhost:8080/auth/facebook/callback",
    auth_type: "reauthenticate",
    profileFields: ['id', 'emails', 'name', 'gender', 'displayName']
  },
  function (accessToken, refreshToken, profile, done){
    GLOBAL.profile = profile;
    console.log(profile);
    //req.session.user = profile;
    done(null, profile);
  }
));


// router.use(passport.initialize());
// router.use(passport.session());

/****************************************/

var NaverStrategy = require('passport-naver').Strategy;
// passport.serializeUser(function(user, done) {
//     done(null, user);
// });
//
// passport.deserializeUser(function(obj, done) {
//     done(null, obj);
// });

passport.use(new NaverStrategy({
    clientID: '?',
    clientSecret: '?',
    callbackURL: "http://localhost:8080/auth/naver/callback",
    svcType: 0  // optional. see http://gamedev.naver.com/index.php/%EC%98%A8%EB%9D%BC%EC%9D%B8%EA%B2%8C%EC%9E%84:OAuth_2.0_API
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
        console.log("profile=");
        console.log(profile);
        // data to be saved in DB
        user = {
            name: profile.displayName,
            email: profile.emails[0].value,
            username: profile.displayName,
            provider: 'naver',
            naver: profile._json
        };
        GLOBAL.profile = user;
        //req.session.user = user;
        //console.log("user=");
        //console.log(user);
        return done(null, profile);
    });
}));

router.get('/facebook',
  passport.authenticate('facebook',{
    scope: ['email']
  })
);

router.get('/facebook/callback',
  passport.authenticate('facebook',{
    successRedirect: '/log/inSuccess',
    failureRedirect: '/log/inFail'
  }), function(req, res) {
      res.redirect('/');
    }
);

// Setting the naver oauth routes
router.get('/naver',
  passport.authenticate('naver', {
    scope: ['email']
  }, function(req, res) {
        console.log('/auth/naver failed, stopped');
      })
);
// creates an account if no account of the new user
router.get('/naver/callback',
    passport.authenticate('naver', {
        successRedirect: '/log/in_success',
        failureRedirect: '/log/in_fail'
    }, function(req, res) {
        res.redirect('/');
      })
);


module.exports = router;
