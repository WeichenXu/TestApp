// Author: Weichen Xu
// mongod --config /usr/local/etc/mongod.conf
// Load modules
var http = require('http'),
	express = require('express');
	path = require('path');
	MongoClient = require('mongodb').MongoClient;
	Server = require('mongodb').Server;
	CollectionDriver = require('./collectionDriver').CollectionDriver;
// Init express and set default port
var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// Set up mongo DB server
var mongoHost = 'localHost'; //A
var mongoPort = 27017; 
var collectionDriver;
 
var mongoClient = new MongoClient(new Server(mongoHost, mongoPort)); //B
mongoClient.open(function(err, mongoClient) { //C
  if (!mongoClient) {
      console.error("Error! Exiting... Must start MongoDB first");
      process.exit(1); //D
  }
  var db = mongoClient.db("MyDatabase");  //E
  collectionDriver = new CollectionDriver(db); //F
});
// Set the public folder
app.use(express.static(path.join(__dirname, 'public')));
// Route handler
/*
app.get('/', function (req, res){
	res.send('<html><body>Hello World</body></html>');
});
*/
app.get('/:collection', function(req, res) { //A
   var params = req.params; //B
   collectionDriver.findAll(req.params.collection, function(error, objs) { //C
    	  if (error) { res.send(400, error); } //D
	      else { 
	          if (req.accepts('html')) { //E
    	          res.render('data',{objects: objs, collection: req.params.collection}); //F
              } else {
	          res.set('Content-Type','application/json'); //G
                  res.send(200, objs); //H
              }
         }
   	});
});
/*
app.get('/:a?/:b?/:c?', function (req,res) {
	res.send(req.params.a + ' ' + req.params.b + ' ' + req.params.c);
});
*/
app.get('/:collection/:entity', function(req, res) { //I
   var params = req.params;
   var entity = params.entity;
   var collection = params.collection;
   if (entity) {
       collectionDriver.get(collection, entity, function(error, objs) { //J
          if (error) { res.send(400, error); }
          else { res.send(200, objs); } //K
       });
   } else {
      res.send(400, {error: 'bad url', url: req.url});
   }
});
app.use(function (req,res) { //1
    res.render('404', {url:req.url}); //2
});
http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});