// Author: Weichen Xu
// mongod --config /usr/local/etc/mongod.conf
// Load modules
var http = require('http'),
	express = require('express'),
	path = require('path'),
	MongoClient = require('mongodb').MongoClient,
	Server = require('mongodb').Server,
	CollectionDriver = require('./collectionDriver').CollectionDriver,
  FileDriver = require('./fileDriver').FileDriver,
  assert = require('assert'),
  bodyParser = require('body-parser');
// Init express and set default port
var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser.json());
// Set up mongo DB server
var url = 'mongodb://localhost:27017/MyDatabase';
var collectionDriver, fileDriver;
 
var mongoClient = new MongoClient(); //B
mongoClient.connect(url,function(err, db) { //C
  if (err) {
      console.error("Error! Exiting... Must start MongoDB first");
      process.exit(1); //D
  }
  collectionDriver = new CollectionDriver(db); //F
  fileDriver = new FileDriver(db);
});
// Set the public folder
app.use(express.static(path.join(__dirname, 'public')));
// Route handler
/*
app.get('/', function (req, res){
	res.send('<html><body>Hello World</body></html>');
});
*/
app.post('/files', function(req,res) {fileDriver.handleUploadRequest(req,res);});
app.get('/files/:id', function(req, res) {fileDriver.handleGet(req,res);});


app.get('/:collection', function(req, res) { //A
   var params = req.params; //B
   var query = req.query.query;
   if(query){
      query = JSON.parse(query);
      CollectionDriver.query()
   }
   else{

   }
   /*
   collectionDriver.findAll(req.params.collection, function(error, objs) { //C
    	  if (error) { res.send(400, error); } //D
	      else { 
	          if (req.accepts('html')) { //E
    	          res.render('data',{objects: objs, collection: req.params.collection}); //F
              } else {
	          res.set('Content-Type','application/json'); //G
                  console.log(req.params.collection+" size: "+objs.length+"\n");
                  res.send(200, objs); //H
              }
         }
   	});
*/
});
function returnCollectionResults(req, res){
  return function(err, objs){
    if(err) res.status(400).send(err);
    else{
      if(req.accept('html')){
        res.render('data',{objects:objs, collection:req.params.collection});
      }      
      else{
        res.set("Content-Type","application/json");
        res.status(200).send(objs);
      }
    }
  };
};
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
app.post('/:collection', function(req, res) { //A
    var object = req.body;
    var collection = req.params.collection;
    collectionDriver.save(collection, object, function(err,docs) {
          if (err) { res.send(400, err); } 
          else { res.send(201, docs); } //B
     });
});
app.put('/:collection/:entity', function(req, res) { //A
    var params = req.params;
    var entity = params.entity;
    var collection = params.collection;
    if (entity) {
       collectionDriver.update(collection, req.body, entity, function(error, objs) { //B
          if (error) { 
            assert.equal(null, error);
            res.send(400, error); 
          }
          else { res.send(200, objs); } //C
       });
   } else {
       var error = { "message" : "Cannot PUT a whole collection" };
       res.send(400, error);
   }
});
app.delete('/:collection/:entity', function(req, res) { //A
    var params = req.params;
    var entity = params.entity;
    var collection = params.collection;
    if (entity) {
       collectionDriver.delete(collection, entity, function(error, objs) { //B
          if (error) { res.send(400, error); }
          else { res.send(200, objs); } //C 200 b/c includes the original doc
       });
   } else {
       var error = { "message" : "Cannot DELETE a whole collection" };
       res.send(400, error);
   }
});
app.use(function (req,res) { //1
    res.render('404', {url:req.url}); //2
});
http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});