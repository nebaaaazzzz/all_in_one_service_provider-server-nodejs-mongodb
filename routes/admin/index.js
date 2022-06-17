const route = require("express").Router();
const User = require("./../../models/User");
route.get("/users", (req, res) => {
  res.send();
});
route.get("/user/:id", async (req, res) => {
  const user = await User.findById(req.body.id);
  if (user) {
    res.send({
      success: true,
      data: user,
    });
  } else {
    res.send({
      sucess: true,
      error: new Error("user not found"),
    });
  }
});
route.patch("/user-udate/:id",async ( req , res)=>{
    
})
route.delete("/user/:id", async (req, res) => {
    const doc = await User.findOneAndDelete(req.params.id);
    if(doc){
        res.send({
            success : true 
        })
    }
    else{   
        res.send({
            success: false , 
            error : new Error("user not found")
        })
    }
});
route.post('/add-user',(req , res)=>{
    if (!validator.equals(req.body.password, req.body.confirmpassword)) {
        return res.status(400).send({
          success: false,
          error: {
            statusCode: new ErrorHandler("Password missmatch", 400).statuscode,
            message: new ErrorHandler("Password missmatch", 400).message,
          },
        });
      } else {
        if (req.body.phno) {
          const phoneNumber = phonevalidate.parsePhoneNumber(req.body.phno);
          // {
          //   country,
          //   number,
          //   nationalNumber,
          //   countryCallingCode
          // }
          if (phoneNumber.isValid()) {
            const randString = generateRandStr({
              length: 6,
              charset: "numeric",
            });
            await User.create({
              firstname: req.body.firstname,
              randString,
              lastname: req.body.lastname,
              sex: req.body.sex,
              phone: {
                number: phoneNumber.number,
                country: phoneNumber.country,
              },
              password: req.body.password,
            });
            sendText(req.body.phno, "code" + randString);
            res.status(201).send({
              success: true,
            });
          } else {
            return res.status(400).send({
              success: false,
              error: {
                statusCode: new ErrorHandler("invalid phonenumber", 400).statuscode,
                message: new ErrorHandler("invalid phonenumber", 400).message,
              },
            });
          }
        } else if (req.body.email) {
          const randString = generateRandStr({
            length: 6,
            charset: "numeric",
          });
          require("./../../config/mail")(req.body.email, "code " + randString);
          const doc = await User.create({
            firstname: req.body.firstname,
            randStirng,
            lastname: req.body.lastname,
            sex: req.body.sex,
            email: req.body.email,
            password: req.body.password,
          });
          res.status(201).send({
            success: true,
          });
        }
      }
    });
    route.post("/validate", async (req, res) => {
      if (req.user.randString === req.body.randString) {
        const doc = await User.findByIdAndUpdate(req.user.id, {
          verified: true,
          randString: "",
        });
        res.send({
          success: true,
          data: {
            doc,
            token: jwt.sign(
              {
                isAdmin: doc.isAdmin,
                sub: user.id,
                exp: Date.now() + 15 * 24 * 60 * 60 * 60,
              },
              process.env.SECRETE
            ),
          },
        });
      } else {
        res.send(400, {
          success: false,
          error: new Error("invalid conf number"),
        });
      }
})
module.exports = route;
