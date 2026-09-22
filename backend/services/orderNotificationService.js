const {
    sendToBale
} = require("./baleService");


const {
    buildOrderMessage
} = require("../utils/orderMessage");


async function notifyNewOrder(
    order,
    items
) {

    const message =
        buildOrderMessage(
            order,
            items
        );


    const result =
        await sendToBale(message);


    return {
        ...result,
        message
    };
}


module.exports = {
    notifyNewOrder
};