const express = require("express");
const User = require("../model/users.model");
const config = require("../config");
const jwt = require("jsonwebtoken");
const middleware = require("../middleware");
const router = express.Router();

router.route("/register").post((req,res) => {
    console.log("Inside the register");
    const user = new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
    });
    user.save().then(() => {
        console.log("User Registered");
        res.status(200).json("OK");
    }).catch((error) => {
        res.status(403).json({ msg: error });
    });
});

router.route("/update/:username").patch(middleware.checkToken, (req,res) => {
    User.findOneAndUpdate(
        { username: req.params.username },
        { $set: { password: req.body.password } },
        (error, result) => {
            if (error) return res.status(500).json({ msg: error });
            const msg = {
                msg: "password successfully updated",
                username: req.params.username,
            };
            return res.json(msg);
        }
    );
});

router.route("/delete/:username").delete(middleware.checkToken, (req, res) => {
    User.findOneAndDelete(
        {username: req.params.username},
        (error, result) => {
            if (error) return res.status(500).json({msg: error});
            const msg = {
                msg: "Username Deleted",
                username: req.params.username,
            };
            return res.json(msg);
        }
    );
});

router.route("/:username").get(middleware.checkToken, (req, res) => {
    User.findOne(
        {username: req.params.username},
        (error, result) => {
            if (error) res.status(500).json({msg: error});
            res.json({
                data: result,
                username: req.params.username,
            });
        }
    );
});

router.route("/login").post((req, res) => {
    User.findOne(
        {username: req.body.username},
        (error, result) => {
            if(error) return res.status(500).json({msg: error});
            if(result===null) {
                return res.status(403).json("Either Username Incorrect");
            }
            if(result.password===req.body.password) {
                //Here we implement the JWT token functionality.
                let token = jwt.sign({username: req.body.username}, config.key, {
                    expiresIn: "24h", //expire in 24 hours
                });
                res.json({
                    token: token,
                    msg: "success",
                });
            }
            else {
                res.status(403).json("Password Is Incorrect");
            }
        }
    );
});

module.exports = router;
