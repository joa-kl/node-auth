const User = require('../models/User');
const jwt = require('jsonwebtoken');

const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: '' };

    // if (err.message === 'incorrect email') {
    //     errors.email = 'that email is not registered'
    // }

    // if (err.message === 'incorrect password') {
    //     errors.password = 'that password is incorrect'
    // }

    if (err.message === 'Incorrect email and/or password') {
        errors.email = err.message;
        errors.password = err.message;
        return errors;
    };

    if (err.code === 11000) {
        errors.email = "That email is already registered";
        return errors;
    }

    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
           errors[properties.path] = properties.message;
        });
    }

    return errors;
}

const maxAge = 3 * 24 * 60 * 60;


const createToken = (id) => {
    //net ninja secret is a secret
    return jwt.sign({ id }, 'net ninja secret', {
        expiresIn: maxAge
    })
}

const signup_get = (req, res) => {
    res.render('signup');
}

const login_get = (req, res) => {

    res.render('login');
}

const signup_post = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.create({ email, password });
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(201).json({ user: user._id });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

const login_post = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ user: user._id });
    }
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({errors});
    }

    // console.log(email, password);
    // res.send('user login');
}


module.exports = {
    signup_get,
    login_get,
    signup_post,
    login_post
}