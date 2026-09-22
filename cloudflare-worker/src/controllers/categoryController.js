const supabase = require("../config/supabase");

async function getCategoriesController(c) {

    try {

        const { data, error } = await supabase
            .from("categories")
            .select(`
                id,
                name,
                slug,
                is_active,
                sort_order
            `)
            .eq("is_active", true)
            .order("sort_order", { ascending: true });

        if (error) {
            throw error;
        }

        return c.json({ success: true, data });

    } catch (error) {

        console.error("Get categories error:", error);

        return c.json({
            success: false,
            message: "خطا در دریافت دسته‌بندی‌ها"
        }, 500);
    }
}

module.exports = {
    getCategoriesController
};
