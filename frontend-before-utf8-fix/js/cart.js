const CART_STORAGE_KEY = "cafe_cart";

let cart = loadCart();


// ==============================
// Load Cart
// ==============================

function loadCart() {
    try {
        const savedCart =
            localStorage.getItem(
                CART_STORAGE_KEY
            );

        if (!savedCart) {
            return [];
        }

        const parsedCart =
            JSON.parse(savedCart);

        if (!Array.isArray(parsedCart)) {
            return [];
        }

        return parsedCart;

    } catch (error) {
        console.error(
            "Load cart error:",
            error
        );

        return [];
    }
}


// ==============================
// Save Cart
// ==============================

function saveCart() {
    localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart)
    );
}


// ==============================
// Add To Cart
// ==============================

function addToCart(product) {
    if (!product) {
        return;
    }

    if (!product.available) {
        return;
    }

    const existingItem =
        cart.find(
            item =>
                Number(item.id) ===
                Number(product.id)
        );

    if (existingItem) {
        existingItem.quantity += 1;

    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    saveCart();
    renderCart();
    updateCartSummary();
}


// ==============================
// Increase Quantity
// ==============================

function increaseQuantity(productId) {
    const item =
        cart.find(
            item =>
                Number(item.id) ===
                Number(productId)
        );

    if (!item) {
        return;
    }

    item.quantity += 1;

    saveCart();
    renderCart();
    updateCartSummary();
}


// ==============================
// Decrease Quantity
// ==============================

function decreaseQuantity(productId) {
    const item =
        cart.find(
            item =>
                Number(item.id) ===
                Number(productId)
        );

    if (!item) {
        return;
    }

    item.quantity -= 1;

    if (item.quantity <= 0) {
        cart =
            cart.filter(
                cartItem =>
                    Number(cartItem.id) !==
                    Number(productId)
            );
    }

    saveCart();
    renderCart();
    updateCartSummary();
}


// ==============================
// Remove From Cart
// ==============================

function removeFromCart(productId) {
    cart =
        cart.filter(
            item =>
                Number(item.id) !==
                Number(productId)
        );

    saveCart();
    renderCart();
    updateCartSummary();
}


// ==============================
// Clear Cart
// ==============================

function clearCart() {
    cart = [];

    saveCart();
    renderCart();
    updateCartSummary();
}


// ==============================
// Cart Item Count
// ==============================

function getCartItemCount() {
    return cart.reduce(
        (total, item) => {
            return total + item.quantity;
        },
        0
    );
}


// ==============================
// Cart Total
// ==============================

function getCartTotal() {
    return cart.reduce(
        (total, item) => {
            return total +
                (
                    Number(item.price) *
                    Number(item.quantity)
                );
        },
        0
    );
}


// ==============================
// Render Cart
// ==============================

function renderCart() {
    const container =
        document.getElementById(
            "cart"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";


    // ==============================
    // Cart Header
    // ==============================

    const header =
        document.createElement(
            "div"
        );

    header.className =
        "cart-header";


    const title =
        document.createElement(
            "h2"
        );

    title.textContent =
        "سبد خرید";


    const clearButton =
        document.createElement(
            "button"
        );

    clearButton.type =
        "button";

    clearButton.className =
        "clear-cart-button";

    clearButton.dataset.action =
        "clear";

    clearButton.textContent =
        "خالی کردن سبد";


    header.appendChild(title);

    header.appendChild(
        clearButton
    );

    container.appendChild(
        header
    );


    // ==============================
    // Empty Cart
    // ==============================

    if (cart.length === 0) {

        const empty =
            document.createElement(
                "p"
            );

        empty.className =
            "empty-cart";

        empty.textContent =
            "سبد خرید شما خالی است.";

        container.appendChild(
            empty
        );

        return;
    }


    // ==============================
    // Cart Items
    // ==============================

    const itemsContainer =
        document.createElement(
            "div"
        );

    itemsContainer.className =
        "cart-items";


    cart.forEach(
        item => {

            const cartItem =
                document.createElement(
                    "div"
                );

            cartItem.className =
                "cart-item";


            // Product Info
            const info =
                document.createElement(
                    "div"
                );

            info.className =
                "cart-item-info";


            const name =
                document.createElement(
                    "strong"
                );

            name.textContent =
                item.name;


            const price =
                document.createElement(
                    "span"
                );

            price.textContent =
                `${formatPrice(
                    item.price
                )} تومان`;


            info.appendChild(name);

            info.appendChild(price);


            // Controls
            const controls =
                document.createElement(
                    "div"
                );

            controls.className =
                "cart-item-controls";


            const increaseButton =
                document.createElement(
                    "button"
                );

            increaseButton.type =
                "button";

            increaseButton.className =
                "cart-button";

            increaseButton.dataset.action =
                "increase";

            increaseButton.dataset.id =
                item.id;

            increaseButton.textContent =
                "+";


            const quantity =
                document.createElement(
                    "span"
                );

            quantity.className =
                "cart-quantity";

            quantity.textContent =
                item.quantity;


            const decreaseButton =
                document.createElement(
                    "button"
                );

            decreaseButton.type =
                "button";

            decreaseButton.className =
                "cart-button";

            decreaseButton.dataset.action =
                "decrease";

            decreaseButton.dataset.id =
                item.id;

            decreaseButton.textContent =
                "−";


            const removeButton =
                document.createElement(
                    "button"
                );

            removeButton.type =
                "button";

            removeButton.className =
                "cart-remove";

            removeButton.dataset.action =
                "remove";

            removeButton.dataset.id =
                item.id;

            removeButton.textContent =
                "حذف";


            controls.appendChild(
                increaseButton
            );

            controls.appendChild(
                quantity
            );

            controls.appendChild(
                decreaseButton
            );

            controls.appendChild(
                removeButton
            );


            // Item Total
            const itemTotal =
                document.createElement(
                    "div"
                );

            itemTotal.className =
                "cart-item-total";

            itemTotal.textContent =
                `${formatPrice(
                    item.price *
                    item.quantity
                )} تومان`;


            // Add Item Parts
            cartItem.appendChild(
                info
            );

            cartItem.appendChild(
                controls
            );

            cartItem.appendChild(
                itemTotal
            );


            itemsContainer.appendChild(
                cartItem
            );
        }
    );


    container.appendChild(
        itemsContainer
    );


    // ==============================
    // Cart Footer
    // ==============================

    const footer =
        document.createElement(
            "div"
        );

    footer.className =
        "cart-footer";


    const totalRow =
        document.createElement(
            "div"
        );

    totalRow.className =
        "cart-total-row";


    const totalLabel =
        document.createElement(
            "span"
        );

    totalLabel.textContent =
        "مجموع سفارش";


    const totalValue =
        document.createElement(
            "strong"
        );

    totalValue.textContent =
        `${formatPrice(
            getCartTotal()
        )} تومان`;


    totalRow.appendChild(
        totalLabel
    );

    totalRow.appendChild(
        totalValue
    );


    // Checkout Button
    const checkoutButton =
        document.createElement(
            "button"
        );

    checkoutButton.type =
        "button";

    checkoutButton.id =
        "checkout-button";

    checkoutButton.className =
        "checkout-button";

    checkoutButton.textContent =
        "ادامه و ثبت سفارش";


    footer.appendChild(
        totalRow
    );

    footer.appendChild(
        checkoutButton
    );


    container.appendChild(
        footer
    );
}


// ==============================
// Update Cart Summary
// ==============================

function updateCartSummary() {
    const cartCount =
        document.getElementById(
            "cart-count"
        );

    const cartTotal =
        document.getElementById(
            "cart-total"
        );


    if (cartCount) {
        cartCount.textContent =
            getCartItemCount();
    }


    if (cartTotal) {
        cartTotal.textContent =
            `${formatPrice(
                getCartTotal()
            )} تومان`;
    }
}


// ==============================
// Setup Cart Events
// ==============================

function setupCartEvents() {
    const cartContainer =
        document.getElementById(
            "cart"
        );

    if (!cartContainer) {
        return;
    }


    cartContainer.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "button"
                );

            if (!button) {
                return;
            }


            // Checkout
            if (
                button.id ===
                "checkout-button"
            ) {
                handleCheckout();

                return;
            }


            const action =
                button.dataset.action;


            if (!action) {
                return;
            }


            const productId =
                button.dataset.id;


            if (
                action ===
                "increase"
            ) {

                increaseQuantity(
                    productId
                );

                return;
            }


            if (
                action ===
                "decrease"
            ) {

                decreaseQuantity(
                    productId
                );

                return;
            }


            if (
                action ===
                "remove"
            ) {

                removeFromCart(
                    productId
                );

                return;
            }


            if (
                action ===
                "clear"
            ) {

                clearCart();

                return;
            }
        }
    );
}


// ==============================
// Format Price
// ==============================

function formatPrice(price) {
    return new Intl.NumberFormat(
        "fa-IR"
    ).format(price);
}