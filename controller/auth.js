const flash = require('connect-flash');
const express = require('express');
const User = require('../db/User');
const localStrat = require('passport-local');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { nanoid }=require('nanoid');
const nodemailer=require('nodemailer');
const {cloudinary} = require('../cloudinary')
const transporter=nodemailer.createTransport(
    {
        service: 'gmail',
        auth: {
            user: process.env.email,
            pass: process.env.email_password,
        }
    }
    );
    
    
    require('dotenv').config();
    
    
    module.exports.login=(req, res, next) => {
        const curUser=req.user;
        console.log(curUser);
        if (req.session.returnTo) {
            res.redirect(req.session.returnTo);
            return;
        }
        req.flash('success', 'Welcome Back!');
        res.redirect('/');
        
    }
    
    module.exports.logout = (req,res)=>{
        req.logout(err=>{
            if (err){ 
                return next(err); 
            }
            req.flash('success','Logged Out Successfully!');
            res.redirect('/');
        })
    };
    
    module.exports.registeremployer = async (req, res, next) => {
        
        try {
            const user=new User(
                {
                    email: req.body.email,
                    FirstName: req.body.FirstName,
                    LastName: req.body.LastName,
                    Company : req.body.Company,
                    role : "Employer"
                }
                );
                
                const regUser=await User.register(user, req.body.password);
                
                console.log(regUser);
                
                req.logIn(regUser, (err) => {
                    if (err) {
                        console.log(err);
                        req.flash('error', err.message);
                        res.redirect('/login');
                    }
                    req.flash('success','Successfully Registered!');
                    if (req.session.returnTo) {
                        res.redirect(req.session.returnTo);
                        return;
                    }
                    res.redirect('/');
                });
            }    
            catch (err) {
                console.log(err);
                req.flash('error', err.message);
                res.redirect('/registeremployer');
            }
            
        }
        module.exports.verify=async (req, res, next) => {
            console.log(req.body);
            let user=new User(
                {
                    email: req.body.email,
                    FirstName: req.body.FirstName,
                    LastName: req.body.LastName,
                    College : req.body.College,
                    Graduation : req.body.Graduation
                }
                );
                console.log(req.session);
                
                if ((Number)(req.session.code)==(Number)(req.body.code)) {
                    user=await User.register(user, req.body.password);
                    req.logIn(user, (err) => {
                        if (err) {
                            console.log(err);
                            req.flash('error', err.message);
                            res.redirect('/login');
                        }
                    });
                    const resetEmail={
                        to: user.email,
                        from: process.env.email,
                        subject: 'Account Has Been Successfully Verified',
                        text: `
                        Account Has Been Successfully Created At Job-Shala.
                        `,
                    }
                    
                    transporter.sendMail(resetEmail, (err, info) => {
                        if (err) {
                            console.log(err);
                            res.send('Error While Sending Mail');
                        }
                        else {
                            console.log(info.response);
                            req.flash('success', 'Successfully Registered!');
                            res.redirect('/');
                        }
                    })
                }
                else {
                    req.flash('error', 'Code Does not match!');
                    res.render('users/verify', { curUser : req.body });
                }
                
            }
            
            
            module.exports.registerstudent = async (req, res, next) => {
                try {
                    console.log(req.body);
                    const token=Math.floor(Math.random()*900000+100000);
                    req.session.code=token;
                    const registerEmail={
                        from: process.env.email,
                        to: req.body.email,
                        subject: "Email Verfication",
                        text: `
                        CODE: ${token}
                        If you did not request this, please ignore this email.
                        `,
                    }
                    transporter.sendMail(registerEmail, (err, info) => {
                        if (err) {
                            console.log(err);
                            res.send('Error While Sending Mail');
                        }
                        else {
                            console.log(info.response);
                            // req.flash('success', 'Verification mail sent Successfully!');
                            res.render('users/verify', { curUser : req.body });
                        }
                    })
                    
                }    
                catch (err) {
                    console.log(err);
                    req.flash('error', err.message);
                    res.redirect('/login');
                }
                
            }
            
            module.exports.renderProfilePage = async(req,res)=>{
                const {id} = req.params;
                const user = await User.findById(id);
                console.log(user);
                if(!user){
                    req.flash('error','Cannot find that user!');
                    return res.redirect('/'); //Necessary to redirect
                }
                res.render('profile/student',{user});
            };
            
            module.exports.updateProfile = async(req,res)=>{
                const {id} = req.params;
                console.log(req.body);
                const user = await User.findByIdAndUpdate(id,{...req.body},{new:true});
                const imgs = req.files.map(f=>({url : f.path, filename : f.filename}));
                user.images.push(...imgs);
                console.log(user.images);
                // const imgs = req.files.map(f=>({url : f.path, filename : f.filename}));
                // user.images.push(...imgs);
                await user.save();
                req.flash('success','Successfully updated profile')
                res.redirect('/');
            };
            
            
            