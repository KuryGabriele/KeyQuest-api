const express = require("express");
const router = express.Router();

const {
    fullAuthenticationMiddleware,
    partialAuthenticationMiddleware
} = require("../classes/utils");

router.get("/", fullAuthenticationMiddleware, (req, res) => {
    const id = req.body.id;
    if (!id) return res.status(400).send({ message: "Missing id parameter." });

    req.database.query("SELECT * FROM users_scores as u, levels as l WHERE l.id=u.lId && u.uId=?", [id], (err, result, fields) => {
        if (err) console.error(err);
        if (err) return res.status(500).send({ message: "Something went wrong." });

        const plate = result[0];
        var jsonOut = [];
        result.forEach((plate) => {
            jsonOut.push({
                id: plate.id,
                displayName: plate.displayName,
                difficulty: plate.difficulty,
                bestScore: plate.score,
                notes: plate.notes
            });
        });
        
        return res.status(200).json(jsonOut);
    });
});

module.exports = router;