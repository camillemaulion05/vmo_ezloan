const express = require('express');
const router = express.Router();

router.get('/check', (req, res) => {
    return res
        .status(200)
        .json({
            "message": "Working . . ."
        });
});

module.exports = router;