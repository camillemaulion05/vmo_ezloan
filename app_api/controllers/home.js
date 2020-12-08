/* GET home page. */
const index = (req, res, next) => {
    return res
        .status(200)
        .json({
            "msg": "Welcome to API"
        });
};

module.exports = {
    index
};