var express =require('express');
var session = require('express-session');
var formidable = require('formidable');
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

app.post('/validateLogin', function(req,res){
  req.session.login_ok = 'yes';
  req.session.login_id = req.body.inputEmail;
  res.redirect('/randomDesk');
});

app.get('/randomDesk',function(req, res){
  res.render('randomDesk');
});
app.get('/myPage', function(req, res){
  res.render('userHome',{user_name : req.session.login_id} )
});
app.get('/postNewDesk', function(req, res){
  res.render('postNewDesk');
});

app.get('/logout', function(req, res){
  req.session.destroy();
  res.redirect('/');
});

app.get('/postNewDesk', function(req, res){
  res.render('postNewDesk');
});

app.post('/upload_do', function(req, res){
  var form = new formidable.IncomingForm();
  form.uploadDir = __dirname + '/upload';
  form.keepExtenstions = true;

  form.parse(req, function(err, fields, files){
    console.log(files + files );
  });
  form.on('fileBegin', function(name, file) {

      file.path = __dirname + '/upload/' + file.name;
   });

   form.on('progress', function(bytesReceived, bytesExpected) {
     console.log(form.bytesReceived);
    });

   form.on('end', function(){
     res.redirect(303, '/upload_ok');
   });

});


app.get('/upload_ok', function(req, res){
  res.send('loginOk');
});

app.get('/upload_not', function(req, res){
  res.send('loginNot');
});

app.use(function(req, res){
  res.type('text/plain');
  res.status('404');
  res.send('404 - Not Found');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('text/plain');
  res.status('500');
  res.send('500 - Server Error');
});


app.listen(app.get('port'), function(){
  console.log('Express started on http://locathost' + app.get('port') + ': press Ctrl + C to terminate');
});
