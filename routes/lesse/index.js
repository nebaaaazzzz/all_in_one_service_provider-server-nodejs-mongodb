const route = require("express").Router();
const House = require("../../models/House");
route.get("/", async (req, res, next) => {
  const query = req.query;
  const houseQuery = House.find();
  const page = query.page > 0 ? query.page : 1;
  const size = 10;
  houseQuery
    .skip((page - 1) * size)
    .limit(10)
    .where({ price: { $gte: 21, $lte: 65 } })
    .where({ placetype: "full" })
    .where({ bedrooms: 3 })
    .where({ bathroom: 3 })
    .where({ propertype: "hotel" }) /*house ,apartment ,guesthouse ,hotel */
    .where({
      amenalities: "wifi kitchen washer dryer air-conditioning heating tv",
    }); /*essential -wifi kitchen washer dryer air-conditioning heating tv*/
  /*features -pool hottube parking gym smoking-allowed heating tv*/
  /*who is comming -adults(13>) children(2-12) infant(<2) pets*/
  /*where - city */
});
module.exports = route;
