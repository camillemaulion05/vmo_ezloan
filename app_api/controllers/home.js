/* GET home page. */
const index = (req, res) => {
    return res
        .status(200)
        .json({
            "msg": "Welcome to API"
        });
};

module.exports = {
    index
};