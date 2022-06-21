const router = require("express").Router();

router.use("/campsites", require("./campsiteRouter"));
router.use("/promotions", require("./promotionRouter"));
router.use("/partners", require("./partnerRouter"));

module.exports = router;
