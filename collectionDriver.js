var ObejectID = require('mongodb').ObjectID;
// Construction Method
CollectionDriver = function(db) {
  this.db = db;
};
// Define a class method
CollectionDriver.prototype.getCollection = function(collectionName, callback) {
  // Fetch the collection and return the obj
  this.db.collection(collectionName, function(error, the_collection) {
    if( error ) callback(error);
    else callback(null, the_collection);
  });
};
// .find() returns all founded objects
CollectionDriver.prototype.findAll = function(collectionName, callback) {
    this.getCollection(collectionName, function(error, the_collection) { //A
      if( error ) callback(error);
      else {
        the_collection.find().toArray(function(error, results) { //B
          if( error ) callback(error);
          else {
            console.log(results);
            callback(null, results);
          }
        });
      }
    });
};

CollectionDriver.prototype.get = function(collectionName, id, callback) { //A
    this.getCollection(collectionName, function(error, the_collection) {
        if (error) callback(error);
        else {
            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$"); //B
            if (!checkForHexRegExp.test(id)) callback({error: "invalid id"});
            else the_collection.findOne({'_id':ObjectID(id)}, function(error,doc) { //C
                if (error) callback(error);
                else callback(null, doc);
            });
        }
    });
};
//save new object
CollectionDriver.prototype.save = function(collectionName, obj, callback) {
    this.getCollection(collectionName, function(error, the_collection) { //A
      if( error ) callback(error)
      else {
        obj.created_at = new Date(); //B
        the_collection.insertOne(obj, function() { //C
          callback(null, obj);
          //console.log(obj);
        });
      }
    });
};

exports.CollectionDriver = CollectionDriver;