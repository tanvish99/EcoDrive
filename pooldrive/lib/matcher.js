const pendingRide = require('../app_server/model/rideRequest');
const notifier = require('./notifier');
const User = require('../app_server/model/user');
const Ride = require('../app_server/model/ride');
var http = require('http');
var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017/tavish";
// var url =  process.env.MONGODB_URI;
var loc;
// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("tavish");
//   dbo.collection("pendingrides").findOne({}, function(err, result) {
//     if (err) throw err;
//    loc =  result.area;
//    //console.log(loc);
//    //localStorage.setItem("loct",result.area);
//     db.close();
//   });
// });
console.log(loc);
//console.log(localStorage.getItem("loct");)
function getMeetingPoint(pointsA, pointsB) {
    if(typeof pointsA === 'string') {
        return pointsA;
    }
    if(typeof pointsB === 'string') {
        return pointsB;
    }
    pointsA.sort();
    pointsB.sort();
    for(var i = 0, j = 0; i < pointsA.length; i++) {
           while(j < pointsB.length && pointsB[j] < pointsA[i]) {
               j++;
           }
           if(j < pointsB.length && pointsB[j] === pointsA[i]) {
               return pointsA[i];
           }
    }
    throw "Impossible";
}

function matchQuery (ride, callback) {
    var query = {
        userId: {$ne: ride.userId},
        userType: ride.userType === 'Driver' ? 'Rider' : 'Driver',
        area: ride.area,
        points: typeof ride.points === 'string' ? {$in: [ride.points]} : {$in: ride.points},
        date: ride.date,
        time: ride.time,
        genderPreference: {$in: [ride.gender, "No Pref."]},
        gender: ride.genderPreference === "No Pref." ?  {$in: [ "Male", "Female"]} : ride.genderPreference
    };
    pendingRide.findOne(query).exec(function (err, partnerRide) {
            if(!partnerRide) { //Didn't find a match, we'll add this request for now so that it can be matched later
                pendingRide.addRide(ride);
                callback(false);
            } else {
                var meetingPoint = getMeetingPoint(ride.points, partnerRide.points);
                notifier.notifyMatchByEmail(ride, partnerRide, meetingPoint);
                Ride.addRide(ride, partnerRide, meetingPoint, User.addRideReference);
                 pendingRide.addRide(ride);   //to add driver
                partnerRide.remove();
                callback(true);
//                 MongoClient.connect(url, function(err, db) {
//                 if (err) throw err;
//                 var dbo = db.db("tavish");
//                 var myquery = {area:ride.area};
//                 dbo.collection("pendingrides").deleteMany(myquery, function(err, obj) {
//                 if (err) throw err;

//                 console.log(" documents deleted");
//                 db.close();
//   });
// });
            }

        });
}

module.exports = {
    matchQuery: matchQuery
};