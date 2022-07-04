const upload = require("../../config/fileHandler");

const route = require("express").Router();
// const cloudinary = require("cloudinary").v2;

route.post("/posthouse", upload.array("houseimage", 5), async (req, res) => {
  res.send("hello wolr");
  //   cloudinary.uploader.upload("", {})(
  //     "https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
  //     { public_id: "olympic_flag" },
  //     function (error, result) {
  //       console.log(result);
  //     }
  //   );
});
route.get("/house" ,async ( req, res)=>{
    
})
module.exports = route;
