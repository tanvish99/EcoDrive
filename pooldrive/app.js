var compression = require('compression');
var express = require('express');
var http = require('http');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var socketIO = require('socket.io');

var app = express();
var router = express.Router();
var assert = require('assert');
var total_emission = 0;

app.use(compression());
app.set('view engine', 'jade'); //vaibhav
// view engine setup
app.set('views', __dirname + '/app_server/views');
app.set('view engine', 'ejs');
app.set('view cache', true);

// app.use("/public", express.static(__dirname + '/public'));
app.use(express.static(__dirname));
require('dotenv').config();
const path = require('path');
var favicon = require('serve-favicon');
var passport = require('passport');
var flash = require('connect-flash');
var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
var url1 = process.env.MONGODB_URI || 'mongodb://localhost:27017/user-data' ;

var mongoose = require("mongoose");
// mongoose.Promise = global.Promise;

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
        if (type == 'bus') {
            distance.transit_mode('bus');
        } else if (type == 'train') {
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
        var cursor = db.collection('user1').aggregate([{
            $group: {
                _id: null,
                totalValue: { $sum: "$emission" }
            }
        }]);
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
            res.render('canvas', { items: resultArray });
        });
    });
});

// app.get("/", (req, res) => {
//     console.log("Responding to root route")
//     app.set('views', 'views');
//     app.set('view engine', 'pug');
//     res.render("canvas")
// })

//var configDB = require('./config/db');
// var url = 'mongodb://localhost:27017/tavish';
var url = process.env.MONGODB_URI || 'mongodb://localhost:27017/tavish';

// var mongoose = require('mongoose');

mongoose.connect(url);
app.use(logger('dev'));
app.use(bodyParser.json());

app.use(cookieParser());

// required for passport
require('./config/passport').setupPassport(passport);
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

require('./routes')(app, passport);

app.post('/alrt', (req, res) => {
    var v_l = req.body.vul;
    if (v_l == 'yes') {
        res.redirect('/profile');
    } else {
        res.redirect('/dashboard');
    }
    // console.log("yoooo");
    // res.redirect('profile');

});

app.use(express.static(__dirname + '/View'));
//Store all HTML files in view folder.
app.use(express.static(__dirname + '/Script'));
//Store all JS and CSS in Scripts folder.
router.get('/try', function(req, res) {
    res.sendFile(path.join(__dirname + '/activity.html'));
    //__dirname : It will resolve to your project folder.
});

// router.get('/try1', function(req, res) {
//     res.sendFile(path.join(__dirname + '/community.jade'));
//     //__dirname : It will resolve to your project folder.
// });




// app.listen(app.get('port'), function() {
//   console.log('Server started: http://localhost:' + app.get('port') + '/');
// });
// app.listen(process.env.PORT|| 3003, () => {
//   console.log("Server is up and listening on 3003...")
// })


app.get('/community', function(req, res) {
    res.render('community.jade', { option: 'value' });
});

app.get('/admin', function(req, res){
	user.find({}, function(err, docs){
		if(err) res.json(err);
		else    res.render('index.jade', {users: docs});
	});
});


var Schema = new mongoose.Schema({
	_id    : String,
    firstName: String,
    lastName: String
});

var user = mongoose.model('users', Schema);

app.get('/view', function(req, res){
	user.find({}, function(err, docs){
		if(err) res.json(err);
		else    res.render('dis.jade', {users: docs});
	});
});


// mongoose.connect('mongodb://localhost/tavish');
// var db = mongoose.connection;

// // ar routes = require('./routes/index');
// // var users = require('./routes/users');

// // Init App
// var app = express();
// const server = http.createServer(app);
// const io= socketIO(server);



// require('./socket/friend')(io);
// // View Engine
// app.set('views', path.join(__dirname, 'views'));
// app.engine('handlebars', exphbs({
//   helpers: {
//     ifIn: function(elem, list, options) {
//       if(list.indexOf(elem) > -1) {
//         return options.fn(this);
//       }
//       return options.inverse(this);
//     }
//   },
//   defaultLayout:'layout'
// }));
// app.set('view engine', 'handlebars');


// // BodyParser Middleware
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());

// // Set Static Folder
// app.use(express.static(path.join(__dirname, 'public')));

// // Express Session
// app.use(session({
//     secret: 'secret',
//     saveUninitialized: true,
//     resave: true
// }));

// // Passport init
// app.use(passport.initialize());
// app.use(passport.session());

// // Express Validator
// app.use(expressValidator({
//   errorFormatter: function(param, msg, value) {
//       var namespace = param.split('.')
//       , root    = namespace.shift()
//       , formParam = root;

//     while(namespace.length) {
//       formParam += '[' + namespace.shift() + ']';
//     }
//     return {
//       param : formParam,
//       msg   : msg,
//       value : value
//     };
//   }
// }));

// // Connect Flash
// app.use(flash());

// // Global Vars
// app.use(function (req, res, next) {
//   res.locals.success_msg = req.flash('success_msg');
//   res.locals.error_msg = req.flash('error_msg');
//   res.locals.error = req.flash('error');
//   res.locals.user = req.user || null;
//   next();
// });



// app.use('/', routes);
// app.use('/users', users);




var Schema1 = new mongoose.Schema({
    _id : String,
	from    : String,
	location: String,
    date   : Date,
    Vehicle: String,
    seat:  String,
    price:  String
});


var plans = mongoose.model('plans', Schema1);

app.post('/new', function(req, res){
	new plans({
        _id    :  req.body.token,
		from    : req.body.from,
		location: req.body.location,
        date   : req.body.date,
        Vehicle: req.body.Vehicle,
        seat:  req.body.seat,
        price:  req.body.price
	}).save(function(err, doc){
		if(err) res.json(err);
		else     res.redirect('/plantrip.html');
	});
});

//join.jade

app.get('/join', function(req, res) {

    plans.find({}, function(err, docs){
        if(err) res.json(err);
        else    res.render('join.jade', {plans: docs});
    });
    });







app.use('/', router);
app.listen(process.env.PORT || 3003, function() {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

module.exports = app;
