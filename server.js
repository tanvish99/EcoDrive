const express = require('express')
const app = express()
var router = express.Router();
var assert = require('assert');
var total_emission = 0;
//var router = express.Router();

// var em_i = "sachin";
//alert(globalVariable.x);

//const morgan = require('morgan')
//var distance = require('./index.js');
//var departure_time = require('./index.js')
//var origins = ['Mumbai MH'];

// var destinations = ['New York NY', 'Montreal', '41.8337329,-87.7321554', 'Honolulu'];
//var destinations = ['Bangalore KA'];
//var mode = '';
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static(__dirname));    // var origins = [bodyParser.create_origin];
    // var destinations = [bodyParser.create_destination];
    // var moode = [bodyParser.create_mode];
    //app.use(morgan('short'))
var url1 = process.env.MONGODB_URI || 'mongodb://localhost:27017/user-data';
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
//mongoose.connect(url1);

// var locationSchema = new mongoose.Schema({
//  create_origin: String,
//  create_destination: String,
//  create_mode: String,
//  create_type: String
// });

// var User = mongoose.model("User", locationSchema);

// var distanceSchema = new mongoose.Schema({
//     create_origin: String,
//     create_destination: String,
//     create_mode: String,
//     create_type: String,
//     distance: String,
//     emission: String,
//     //em_car: String,
//   //  em_bus: String
// });
//
// var User1 = mongoose.model("User1", distanceSchema);

//var distanceSc
// app.post("/addname", (req, res) => {
//  var myData = new User(req.body);
//  myData.save()
//  .then(item => {
//  res.send("item saved to database");
//  })
//  .catch(err => {
//  res.status(400).send("unable to save to database");
//  });
// });

app.post('/user', (req, res) => {
    console.log("Trying to create a new user...")
    console.log("How do we get the form data???")

    console.log("origin: " + req.body.create_origin)
    console.log("Destination: " + req.body.create_destination)
    console.log("Mode: " + req.body.create_mode)
    var origins = [req.body.create_origin];
    var destinations = [req.body.create_destination];
    var m = req.body.create_mode;
    var moode = m.toLowerCase();
    var type = req.body.create_type
    var distance = require('./index.js');
    var em_bike = 0;
    //var total_emission = 0;
    //console.log(typeof(em_bike));
    var em_car = 0;
    var em_bus = 0;
    distance.key('AIzaSyCLa9iUQf41ANzURC7i9_pyWa5dAphrirs');
    distance.units('imperial');
    if (moode == 'driving') {
        distance.mode(moode);

        distance.traffic_model('optimistic');

        distance.departure_time(Date.now());

        distance.matrix(origins, destinations, onMatrix);

    } else if (moode == 'transit') {
        distance.mode(moode);
        if(type=='bus'){
          distance.transit_mode('bus');
        }
        else if (type=='train') {
          distance.transit_mode('train');
        }
        distance.transit_routing_preference('fewer_transfers');

        distance.matrix(origins, destinations, onMatrix);

    } else {
        console.log("error");
    }

    function onMatrix(err, distances) {
        if (err) {
            // request errors
            return console.log(err);
        }
        if (distances.error_message) {
            // API errors
            return console.log(distances.error_message);
        }
        if (!distances) {
            return console.log('no distances');
        }
        if (distances.status == 'OK') {
            for (var i = 0; i < origins.length; i++) {
                var results = distances.rows[i].elements;
                for (var j = 0; j < results.length; j++) {
                    var element = results[j];
                    //var duration = element.duration.text;
                    var origin = distances.origin_addresses[i];
                    var destination = distances.destination_addresses[j]
                    if (distances.rows[0].elements[j].status == 'OK') {
                        var distance = distances.rows[i].elements[j].distance.text;
                        var integer = parseInt(distance, 10) * 1.60934;
                        if (type == 'bike') {
                            em_bike = integer * 0.11978 / 1000;
                            console.log("Carbon emission for bike is:" + em_bike + " tonne")
                        } else if (type == 'car') {
                            em_car = integer * 0.20335 / 1000;
                            console.log("Carbon emission for car is" + em_car + " tonne");
                        } else if (type == 'bus') {
                            em_bus = integer * 0.07 / 1000;
                            console.log("Carbon emission for bus is" + em_bus + " tonne")
                        }
                        console.log('Distance from ' + origin + ' to ' + destination + ' is ' + integer);
                        var emission = em_car + em_bike + em_bus;
                        mongoose.connect(url1, function(err, db) {
                        if (err) throw err;
                        var distanceSchema = {
                            create_origin: req.body.create_origin,
                            create_destination: req.body.create_destination,
                            create_mode: req.body.create_mode,
                            create_type: req.body.create_type,
                            distance: integer,
                            emission: emission
                        };
                        db.collection('user1').insertOne(distanceSchema, function(err, result) {
                        //assert.equal(null, err);
                        console.log('Item inserted');
                        //db.close();
                        });
                          db.close();
                        });
                    } else {
                        console.log(destination + ' is not reachable by land from ' + origin);
                    }
                }

            }

        }
}
res.redirect('/maps.html');
});


router.get('/get-data', function(req, res, next) {
  var resultArray = [];
  mongoose.connect(url1, function(err, db) {
  //  assert.equal(null, err);
    var cursor = db.collection('user1').aggregate([
       {
        $group:
         {
                _id: null,
                totalValue: {$sum: "$emission"}
              }
          }
      ]
      );
    cursor.forEach(function(doc, err) {
      //assert.equal(null, err);
      resultArray.push(doc);
  //var clac = resultArray.em_b
    }, function() {
      db.close();
      console.log(resultArray.totalValue);
      //document.write(resultArray);
      //var engines = require('consolidate');
      // app.set('views', __dirname + '/views');
      // app.set('view engine', 'pug');
      res.render('canvas', {items: resultArray});
    });
  });
});

app.get("/", (req, res) => {
    console.log("Responding to root route")
    app.set('views', 'views');
    app.set('view engine', 'pug');
    res.render("canvas")
})

// localhost:3003
app.listen(process.env.PORT || 3000, () => {
    console.log("Server is up and listening on 3000...")
})

// distance.mode('driving');
//
// distance.traffic_model('optimistic');
//
// distance.departure_time(Date.now());
//
// distance.matrix(origins, destinations, onMatrix);
