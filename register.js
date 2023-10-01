

const loginForm = document.getElementById("register-form")

loginForm.onsubmit = async (e) => {
    e.preventDefault();

    var username = DOMPurify.sanitize(document.getElementById("username").value);
    var email = DOMPurify.sanitize(document.getElementById("email").value);
    var password = DOMPurify.sanitize(document.getElementById("password").value);
    var error = document.getElementById("error-text")

    let requestBody = {
        username,
        email,
        password
    }

    const res = await fetch("https://ucsociallydead.com/user/register", {
        method: 'POST',
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(requestBody)
    }).then(response => {
        response.json().then(data => {
            if (response.status != 200) {
                error.innerHTML = data.msg;
            } else if (data.msg === "User Already Exists") {
                const popup = document.getElementById("modal")
                popup.style.display = "block"
            }
            else {
                window.location.href = "../login.html";
            }
        })
    }).catch(error => {
        console.log(error);
    });

}