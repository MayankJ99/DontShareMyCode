var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/about', function(req, res) {
    res.render('about', { title: 'Express' });
});

router.get("/code/:id", (req, res) => {
    console.log(req.session)
    if (!req.session.nickname) {
        return res.redirect(`/code/${req.params.id}/nickname`);
    }
    res.render("code", { nickname: req.session.nickname });
});

router.get("/code/:id/nickname", (req, res) => {
    if (req.session.nickname) {
        return res.redirect(`/code/${req.params.id}`);
    }
    res.render("chooseNickname", { id: req.params.id });
});

router.post("/code/:id/nickname", (req, res) => {
    req.session.nickname = req.body.nickname;
    return res.redirect(`/code/${req.params.id}`);
});

router.post("/generateRoomURL", (req, res) => {
    if(req.session.nickname){
      req.session.nickname = undefined
    }
    var text = "";
    var possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 10; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return res.redirect(`/code/${text}`);
});

module.exports = router;
