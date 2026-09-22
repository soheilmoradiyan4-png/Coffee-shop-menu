function requireAdmin(req, res, next) {

    if (!req.session || !req.session.admin) {

        return res.status(401).json({

            success: false,

            message:
                "دسترسی غیرمجاز. ابتدا وارد حساب مدیر شوید."

        });

    }


    next();

}


module.exports = {
    requireAdmin
};