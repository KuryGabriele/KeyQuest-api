const express = require("express");
const router = express.Router();

router.post("/register", (req, res) => {
    const { username, hash } = req.body;

    req.database.query("INSERT INTO users (username, hash) VALUES (?, ?)", [username, hash], (err, result, fields) => {
        if (err) console.error(err);
        if (err) return res.status(406).send({ message: "Username or email already exists." });
        
        if (result && result.affectedRows > 0) {
            return res.status(200).json({ message: "Account created successfully!" });
        }

        res.status(406).json({ message: "Username already exists" });
    });
});

router.post("/login", (req, res) => {
    const { username, hash } = req.body;

    req.database.query(`
        SELECT id, username FROM users
        WHERE hash = ? AND username = ?
    `, [hash, username], (err, result, fields) => {
        if (err) console.error(err);
        if (err) return res.status(400).send({ message: "You messed up the request." });
        // send wrong credentials if no user was found
        if (!result) return res.status(401).send({ message: "Wrong credentials." });

        if (result && result.length > 0) {
            //remove any old tokens
            req.authenticator.revokeTokenFromUser(result[0].id);
            //generate a new token
            const [token, tokenExpire] = req.authenticator.generateJWTToken(result[0].id);
            //send the token to user
            return res.status(200).json({
                id: result[0].id,
                username: result[0].username,
                token,
                tokenExpire
            });
        }

        res.status(406).json({ message: "Username does not exist or password is incorrect." });
    });
});

module.exports = router;