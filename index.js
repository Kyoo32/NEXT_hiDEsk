var express =require('express');
var session = require('express-session');

var app = express();

app.use(session({
  secret : "secret",
  resave : false,
  saveUninitialized : true
}));

var bodyparser = require('body-parser').urlencoded({extended : true});
app.use(bodyparser);
app.use('/styles', express.static(__dirname + '/styles'));
app.use('/upload', express.static(__dirname + '/upload'));


var handlebars = require('express-handlebars').create({defaultlayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 8080);

app.get('/', function(req, res){
  res.render('indexDesk');
});
app.get('/viewDesk', function(req,res){
  res.render('indexDesk', {nickName : req.session.login_id});
});
app.get('/showSignUp', function(req, res){
  res.render('signup');
});
app.get('/showSignin', function(req, res){
    if(req.session.login_ok =='yes'){
          res.redirect('/userhome');
        } else {
          res.render('signin');
        }
});
app.post('/validateLogin', function(req,res){
  req.session.login_ok = 'yes';
  req.session.login_id = req.body.inputEmail;
  res.redirect('/userhome');
});
app.get('/userhome', function(req, res){
  res.render('userHome',{user_name : req.session.login_id} )
});


app.get('/logout', function(req, res){
  req.session.destroy();
  res.redirect('/');
});
app.listen(app.get('port'), function(){
  console.log('Express started on http://locathost' + app.get('port') + ': press Ctrl + C to terminate');
});
