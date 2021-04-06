var nodemailer = require('nodemailer');
const User = require('../app_server/model/user');

// Twilio Credentials
const accountSid = 'AC463dff75318aed8e777916c9cd7eccbe';
const authToken = '2e07be99892b8899416a941f7f56616d';

// require the Twilio module and create a REST client
const client = require('twilio')(accountSid, authToken);


function sendRiderSMS(rideReq, rider, driver, meetingPoint) {
    var notificationMessage = ' Driver name: ' + driver.firstName + 'Mobile Number: 9449014585 ,licence plate number: KA 22 EC 2277 PickUp: ' + meetingPoint + ', ' + 'Destination' + rideReq.area + ' Date: ' + rideReq.date + ', ' + ' time: ' + rideReq.time + ' - Eco Drive';
    client.messages
        .create({
            to: '+91' + rider.mobileNum,
            from: '+13104319918',
            body: notificationMessage,
        })
        .then((message) => console.log(message.sid));
}

function sendDriverSMS(rideReq, driver, rider, meetingPoint) {
    var notificationMessage =  'Rider Name ' + rider.firstName + ' Mobile Number: 9008485852, licence plate number :KA 22 EC 2277  PickUp ' + meetingPoint + ', ' + ' Destination ' + rideReq.area + ' Date: ' + rideReq.date + ', ' + ' time: ' + rideReq.time + '- Eco Drive';
    client.messages
        .create({
            to: '+91' + driver.mobileNum,
            from: '+13104319918',
            body: notificationMessage,
        })
        .then((message) => console.log(message.sid));
}

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'retardorocks21@gmail.com',
        pass: 'Amit@12345'
    }
});

function sendRiderEmail(rideReq, rider, driver, meetingPoint) {
    var content = 'Hey ' + rider.firstName + ' , you will meet ' + driver.firstName + ' ' + driver.lastName + ' at ' + meetingPoint + ', '
        + rideReq.area + ' on ' +
        rideReq.date + ', ' + rideReq.time + (driver.gender === 'Male' ? '. His' : '. Her') + ' mobile number is : 9449014585' +
        driver.mobileNum + '. Please be on time! - Eco Drive';
    var mailOptions = {
        from: 'retardorocks21@gmail.com',
        to: rider.email,
        subject: 'Good news, you\'ve been matched!',
        text: content
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

function  sendDriverEmail(rideReq, driver, rider, meetingPoint) {
    var content = 'Hey ' + driver.firstName + ', you will meet ' + rider.firstName + ' ' + rider.lastName + ' at ' + meetingPoint + ', '
        + rideReq.area + ' on ' +
        rideReq.date + ', ' + rideReq.time + (rider.gender === 'Male' ? '. His' : '. Her') + ' mobile number is 9008457927' +
        rider.mobileNum + '. Please be on time! - Eco Drive';

    var mailOptions = {
        from: 'retardorocks21@gmail.com',
        to: driver.email,
        subject: 'Congratulations, you\'ve been matched!',
        text: content
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

function notifyMatchByEmail(riderReq, driverReq, meetingPoint) {

    User.findOne({_id: riderReq.userId}, function (err, rider) {
        if(err) {
            return;
        }
        User.findOne({_id: driverReq.userId}, function (err, driver) {
            if(err) {
                return;
            }
            sendRiderEmail(riderReq, rider, driver, meetingPoint);
            sendDriverEmail(riderReq, driver, rider, meetingPoint);

            sendRiderSMS(riderReq, rider, driver, meetingPoint);
            sendDriverSMS(riderReq, driver, rider, meetingPoint);
        });
    });
}

module.exports = {
    notifyMatchByEmail: notifyMatchByEmail
};