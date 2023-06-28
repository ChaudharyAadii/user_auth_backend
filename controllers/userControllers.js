const users = require('../models/userSchema');
const userotp = require('../models/userOtp');
const nodemailer = require('nodemailer');
const { response } = require('express');

// email config

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})


exports.userregister = async (req, res) => {
    const { fname, email, password } = req.body;

    if (!fname || !email || !password) {
        res.status(400).json({ error: "Please enter all input data" })
    }
    try {
        const preuser = await users.findOne({ email: email })

        if (preuser) {
            res.status(400).json({ error: "This user already exist in our database" });
        } else {
            const userregister = new users({
                fname, email, password
            });

            // passsword hashing will be performed here in the schema page

            const storeData = await userregister.save();
            res.status(200).json(storeData);
        }
    } catch (error) {
        res.status(400).json({ error: "Invalid details", error })
    }
}




// FOR LOGIN

// user send otp function

exports.userOtpSend = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({ error: "Please enter your email" });
    }

    try {
        const preuser = await users.findOne({ email: email });

        if (preuser) {
            const OTP = Math.floor(100000 + Math.random() * 900000);

            // if user comes again for login then we have to just change the otp rather than changing the whole entry for thet email
            const existEmail = await userotp.findOne({ email: email })

            if (existEmail) {
                const updateData = await userotp.findByIdAndUpdate({ _id: existEmail._id }, {
                    otp: OTP
                }, { new: true })

                await updateData.save();

                // for seding email

                const mailOptions = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: "Sending email for OTP verfifcation",
                    text: `OTP:- ${OTP}`
                }

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log("error", error);
                        res.status(400).json({ error: "Email not sent..!!" })
                    } else {
                        console.log("Email sent", info.response);
                        res.status(200).json({ message: "Email sent successfully." })

                    }
                })
            }
            else {
                const saveOtpData = new userotp({
                    email, otp: OTP
                });
                await saveOtpData.save();

                // for seding email

                const mailOptions = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: "Sending email for OTP verfifcation",
                    text: `OTP:- ${OTP}`
                }

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log("error", error);
                        res.status(400).json({ error: "Email not sent..!!" })
                    } else {
                        console.log("Email sent", info.response);
                        res.status(200).json({ message: "Email sent successfully." })

                    }
                })

            }


        } else {
            res.status(400).json({ error: "This user does not exist in our database" });
        }
    } catch (error) {
        res.status(400).json({ error: "Invalid details", error })
    }
}

// for otp page

exports.userLogin = async (req, res) => {
    const {email, otp} = req.body;

    if(!otp || !email){
        res.status(400).json({error: "Please enter your OTP and email"})
    }

    try {
        const otpVerification = await userotp.findOne({email:email})

        if(otpVerification.otp === otp){
            const preuser = await users.findOne({email: email});

            // token generate

            const token = await preuser.generateAuthToken();
            console.log(token);
            res.status(200).json({message: "User login successfully done", userToken: token});

        } else {
            res.status(400).json({error: "Invalid OTP"});
        }
    } catch (error) {
        res.status(400).json({ error: "Invalid details", error });
    }
}