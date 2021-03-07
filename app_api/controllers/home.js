const CryptoJS = require("crypto-js");

const index = (req, res) => {
    return res
        .status(200)
        .json({
            "message": "Welcome to API"
        });
};

const encrypt = (req, res) => {
    let cipherText = CryptoJS.AES.encrypt(req.body.plainText, process.env.CRYPTOJS_SECRET).toString();
    return res
        .status(200)
        .json({
            "cipherText": cipherText
        });
};

const decrypt = (req, res) => {
    let bytes = CryptoJS.AES.decrypt(req.body.cipherText, process.env.CRYPTOJS_SECRET);
    let originalText = bytes.toString(CryptoJS.enc.Utf8);
    return res
        .status(200)
        .json({
            "plainText": originalText
        });
};

module.exports = {
    index,
    encrypt,
    decrypt
};