const bcrypt = require("bcryptjs");

const supabase =
    require("../config/supabase");


async function loginAdmin(
    email,
    password
) {

    if (
        typeof email !== "string" ||
        typeof password !== "string"
    ) {
        return null;
    }


    const normalizedEmail =
        email.trim().toLowerCase();


    if (!normalizedEmail || !password) {
        return null;
    }


    const {
        data: admin,
        error
    } = await supabase
        .from("admins")
        .select(`
            id,
            email,
            password_hash,
            is_active
        `)
        .eq(
            "email",
            normalizedEmail
        )
        .maybeSingle();


    if (error) {

        console.error(
            "Admin lookup error:",
            error
        );

        throw new Error(
            "خطا در بررسی حساب مدیر."
        );
    }


    if (!admin) {
        return null;
    }


    if (!admin.is_active) {
        return null;
    }


    const passwordMatches =
        await bcrypt.compare(
            password,
            admin.password_hash
        );


    if (!passwordMatches) {
        return null;
    }


    return {
        id: admin.id,
        email: admin.email
    };
}


module.exports = {
    loginAdmin
};