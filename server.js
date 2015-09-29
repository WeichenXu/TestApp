// Author: Weichen Xu
// mongod --config /usr/local/etc/mongod.conf
// Load modules
var http = require('http'),
	express = require('express');
	path = require('path');
// Init express and set default port
var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// Set the public folder
app.use(express.static(path.join(__dirname, 'public')));
// Route handler
app.get('/', function (req, res){
	res.send('<html><body>Hello World</body></html>');
});
/*
app.get('/:a?/:b?/:c?', function (req,res) {
	res.send(req.params.a + ' ' + req.params.b + ' ' + req.params.c);
});
*/
app.use(function (req,res) { //1
    res.render('404', {url:req.url}); //2
});
http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});