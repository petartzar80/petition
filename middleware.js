function requireLoggedOutUser(req, res, next) {
    if (req.session.regId) {
        res.redirect("/petition");
    } else {
        next();
    }
}

function requireSignature(req, res, next) {
    if (req.session.signedId) {
        res.redirect("/petition");
    } else {
        next();
    }
}
function requireNoSignature(req, res, next) {
    if (req.session.signedId) {
        res.redirect("/thanks");
    } else {
        next();
    }
}

module.exports = {
    requireLoggedOutUser,
    requireSignature,
    requireNoSignature
};
