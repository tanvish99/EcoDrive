var router = require('express').Router();

router.get('/', function(req, res) {
    /* Logic to handle attempt of logging in of already logged in users to be added */
    /* Flash could have been populated if password was wrong in a previous attempt */
    res.render('al',);
});

// router.post('/', function(req, res){
// 	console.log("yoooo");
// 	res.redirect('dashboard',);

// });
module.exports = router;