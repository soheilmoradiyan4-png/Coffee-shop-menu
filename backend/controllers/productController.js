const supabase = require("../config/supabase");

async function getProducts(req, res) {
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

        if (error) throw error;

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Get products error:", error);

        res.status(500).json({
            success: false,
            message: "خطا در دریافت محصولات"
        });
    }
}

module.exports = {
    getProducts
};