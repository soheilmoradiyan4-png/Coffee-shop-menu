const env = require("../config/env");


async function sendBaleMessage(chatId, message) {

    if (!env.baleBotToken || !chatId) {
        console.warn(
            "Bale configuration is incomplete."
        );

        return {
            success: false,
            chatId,
            reason: "configuration"
        };
    }


    try {

        const response = await fetch(
            `https://tapi.bale.ai/bot${env.baleBotToken}/sendMessage`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    chat_id: chatId,
                    text: message
                })
            }
        );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.ok
        ) {

            console.error(
                "Bale API error:",
                result
            );

            return {
                success: false,
                chatId,
                reason: "api_error",
                result
            };
        }


        return {
            success: true,
            chatId
        };

    } catch (error) {

        console.error(
            "Bale request error:",
            error
        );


        return {
            success: false,
            chatId,
            reason: "request_error",
            error: error.message
        };
    }
}


async function sendToBale(message) {

    const targets = [
        {
            name: "group",
            chatId: env.baleChatId
        },
        {
            name: "admin",
            chatId: env.baleAdminChatId
        }
    ].filter(
        target => Boolean(target.chatId)
    );


    if (targets.length === 0) {

        console.warn(
            "No Bale chat IDs configured."
        );

        return {
            success: false,
            group: false,
            admin: false
        };
    }


    const results =
        await Promise.all(
            targets.map(
                target =>
                    sendBaleMessage(
                        target.chatId,
                        message
                    )
            )
        );


    const groupResult =
        results.find(
            result =>
                result.chatId ===
                env.baleChatId
        );


    const adminResult =
        results.find(
            result =>
                result.chatId ===
                env.baleAdminChatId
        );


    return {
        success:
            results.length > 0 &&
            results.every(
                result =>
                    result.success
            ),

        group:
            groupResult
                ? groupResult.success
                : false,

        admin:
            adminResult
                ? adminResult.success
                : false
    };
}


module.exports = {
    sendBaleMessage,
    sendToBale
};