const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('better-sqlite3')('./server.db');
const saltRounds = 10;

/* Check session */
router.post('/status', (req, res) => {
    if (req.session.username) {
        res.json({status: 'ok', username: req.session.username})
    } else {
        res.json({status: 'no session'})
    }
});

/* Login */
router.post('/login', (req, res) => {
    const _username = req.body.username;
    const _password = req.body.password;
    const row = db.prepare('SELECT * FROM users WHERE username=?').get(_username);
    if (row) {
        bcrypt.compare(_password, row.password, function(err, result) {
            if (err) {
                console.log('Error comparing hash and password');
                res.send({status: 'error'});
            }
            if (result) {
                console.log('Logging in...');
                req.session.username = row.username;
                const _now = new Date().toUTCString();
                const updateLastLogin = db.prepare('UPDATE users SET lastlogin=? WHERE username=?')
                updateLastLogin.run(_now, _username);
                res.send({status: 'ok'});
            } else {
                console.log('Invalid password')
                res.send({status: 'error'});
            }
            
        });
    } else {
        console.log('Account with email does not exist.');
        res.json({status: 'error'});
    }
});

/* Register */

router.post('/register', (req, res) => {
    const _username = req.body.username;
    const _email = req.body.email;
    bcrypt.genSalt(saltRounds, (err, salt) => {
        bcrypt.hash(req.body.password, salt, function(err, hash) {
            if (err) {
                console.log('Error hashing password');
                res.send({status: 'error'})
            }
            const _now = new Date().toUTCString();
            const insert = db.prepare('INSERT OR IGNORE INTO users(username, email, password, created, lastlogin)  VALUES (?, ?, ?, ?, ?)');
            const result = insert.run(_username, _email, hash, _now, _now);
            if (result.changes === 0) {
                console.log('Account already exists');
                res.send({status: 'error'})
            } else {
                req.session.username = _username;
                console.log('Account created');
                res.send({status: 'ok'});
            }
        });
    });
});


/* Logout */
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log('Error logging out user');
            res.send({status: 'Error logging our user'});
        } else {
            console.log('Logging out user');
            res.send({status: 'ok'});
        }
    });
});

module.exports = router