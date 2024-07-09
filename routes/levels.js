const express = require("express");
const router = express.Router();

const {
    fullAuthenticationMiddleware,
    partialAuthenticationMiddleware
} = require("../classes/utils");

router.get("/", fullAuthenticationMiddleware, (req, res) => {
    const id = req.body.id;
    if (!id) return res.status(400).send({ message: "Missing id parameter." });

    req.database.query("SELECT l.id, l.displayName, l.difficulty, l.notes, COALESCE(us.score, 0) AS score FROM levels l LEFT JOIN users_scores us ON l.id = us.lId AND us.uId = ?", [id], (err, result, fields) => {
        if (err) console.error(err);
        if (err) return res.status(500).send({ message: "Something went wrong." });

        var jsonOut = [];
        result.forEach((plate) => {
            jsonOut.push({
                id: plate.id,
                displayName: plate.displayName,
                difficulty: plate.difficulty,
                bestScore: plate.score || 0,
                notes: plate.notes
            });
        });

        return res.status(200).json(jsonOut);
    });
});

router.post("/score", fullAuthenticationMiddleware, (req, res) => {
    const id = req.body.id;
    const lId = req.body.lId;
    const score = req.body.score;
    console.log(req.body, req.params)

    if (!id) return res.status(400).send({ message: "Missing id parameter." });
    if (!lId) return res.status(400).send({ message: "Missing lId parameter." });
    if (!score) return res.status(400).send({ message: "Missing score parameter." });

    req.database.query("INSERT INTO users_scores (uId, lId, score) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE score = ?", [id, lId, score, score], (err, result, fields) => {
        if (err) console.error(err);
        if (err) return res.status(500).send({ message: "Something went wrong." });

        return res.status(200).send({ message: "Score saved." });
    });
});

module.exports = router;