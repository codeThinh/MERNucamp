const router = require("express").Router();

router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.use("/campsites", require("./campsiteRouter"));
router.use("/promotions", require("./promotionRouter"));
router.use("/partners", require("./partnerRouter"));
router.use("/users", require("./users"));
router.use("/imageUpload", require("./uploadRouter"));
router.use("/favorites", require("./favoriteRouter"));

module.exports = router;
