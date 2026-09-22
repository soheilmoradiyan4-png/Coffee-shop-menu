const {
    loginAdmin
} = require("../services/adminAuthService");


async function loginController(
    req,
    res
) {

    try {

        const {
            email,
            password
        } = req.body;


        const admin =
            await loginAdmin(
                email,
                password
            );


        if (!admin) {

            return res.status(401).json({

                success: false,

                message:
                    "ایمیل یا رمز عبور اشتباه است."

            });
        }


        // جلوگیری از Session Fixation
        req.session.regenerate(
            (error) => {

                if (error) {

                    console.error(
                        "Admin session regenerate error:",
                        error
                    );


                    return res.status(500).json({

                        success: false,

                        message:
                            "خطا در ایجاد نشست مدیر."

                    });
                }


                req.session.admin = {

                    id:
                        admin.id,

                    email:
                        admin.email

                };


                return res.json({

                    success: true,

                    message:
                        "ورود با موفقیت انجام شد."

                });

            }
        );


    } catch (error) {

        console.error(
            "Admin login error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "خطا در ورود مدیر."

        });

    }

}


function logoutController(
    req,
    res
) {

    req.session.destroy(
        (error) => {

            if (error) {

                console.error(
                    "Admin logout error:",
                    error
                );


                return res.status(500).json({

                    success: false,

                    message:
                        "خطا در خروج از حساب."

                });

            }


            res.clearCookie(
                "connect.sid"
            );


            return res.json({

                success: true,

                message:
                    "با موفقیت خارج شدید."

            });

        }
    );

}


function meController(
    req,
    res
) {

    if (
        !req.session ||
        !req.session.admin
    ) {

        return res.status(401).json({

            success: false,

            message:
                "وارد حساب مدیر نشده‌اید."

        });

    }


    return res.json({

        success: true,

        data: {

            id:
                req.session.admin.id,

            email:
                req.session.admin.email

        }

    });

}


module.exports = {

    loginController,

    logoutController,

    meController

};