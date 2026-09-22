const supabase = require("../config/supabase");

async function getProductsController(c) {

    try {

        const { data, error } = await supabase
            .from("products")
            .select(`
                id,
                name,
                description,
                price,
                available,
                sort_order,
                category_id,
                categories (
                    id,
                    name,
                    slug
                )
            `)
            .order("sort_order", { ascending: true });

        if (error) {
            throw error;
        }

        return c.json({ success: true, data });

    } catch (error) {

        console.error("Get products error:", error);

        return c.json({
            success: false,
            message: "خطا در دریافت محصولات"
        }, 500);
    }
}

module.exports = {
    getProductsController
};
