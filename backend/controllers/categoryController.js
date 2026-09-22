const supabase = require("../config/supabase");

async function getCategories(req, res) {
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

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Get categories error:", error);

        res.status(500).json({
            success: false,
            message: "خطا در دریافت دسته‌بندی‌ها"
        });
    }
}

module.exports = {
    getCategories
};