//const API_BASE_URL = "/api";
const API_BASE_URL =
    window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
        ? "http://127.0.0.1:8787/api"
        : "/api";


const loginForm =
    document.getElementById(
        "admin-login-form"
    );


const emailInput =
    document.getElementById(
        "admin-email"
    );


const passwordInput =
    document.getElementById(
        "admin-password"
    );


const submitButton =
    document.getElementById(
        "admin-login-submit"
    );


const messageElement =
    document.getElementById(
        "admin-login-message"
    );


document.addEventListener(
    "DOMContentLoaded",
    initializeLogin
);


function initializeLogin() {

    checkExistingSession();


    loginForm.addEventListener(
        "submit",
        handleLogin
    );

}


async function checkExistingSession() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/admin/auth/me`,
                {
                    credentials:
                        "include"
                }
            );


        if (response.ok) {

            window.location.href =
                "admin.html";

        }

    } catch (error) {

        console.error(
            "Session check error:",
            error
        );

    }

}


async function handleLogin(event) {

    event.preventDefault();


    const email =
        emailInput.value
            .trim()
            .toLowerCase();


    const password =
        passwordInput.value;


    if (!email || !password) {

        showMessage(
            "ایمیل و رمز عبور را وارد کنید.",
            "error"
        );

        return;

    }


    setLoading(true);


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/admin/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials:
                        "include",

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "ورود ناموفق بود."
            );

        }


        showMessage(
            "ورود موفق بود. در حال انتقال...",
            "success"
        );


        window.location.href =
            "admin.html";


    } catch (error) {

        console.error(
            "Admin login error:",
            error
        );


        showMessage(
            error.message ||
            "خطایی هنگام ورود رخ داد.",
            "error"
        );

    } finally {

        setLoading(false);

    }

}


function setLoading(isLoading) {

    submitButton.disabled =
        isLoading;


    submitButton.textContent =
        isLoading
            ? "در حال ورود..."
            : "ورود";

}


function showMessage(
    message,
    type
) {

    messageElement.textContent =
        message;


    messageElement.className =
        `admin-login-message ${type}`;

}
