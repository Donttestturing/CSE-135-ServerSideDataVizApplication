
//const e = require("cors");

const loginForm = document.getElementById("login")



loginForm.onsubmit = async (e) => {
    e.preventDefault();

    var emailOrName = DOMPurify.sanitize(document.getElementById("email").value);
    var password = DOMPurify.sanitize(document.getElementById("password").value);
    var error = document.getElementById("error-text");
    let requestBody = {
        emailOrName,
        password
    }
    const res = await fetch("https://ucsociallydead.com/user/login", {
        method: 'POST',
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(requestBody)
    }).then(response => {

        response.json().then(data => {
            if (response.status != 200) {
                error.innerHTML = data.msg;
            } else {
                if (data.token == undefined && data.admin == undefined) {  //user DNE
                    const popup = document.getElementById("modal")
                    popup.style.display = "block"
                } else {
                    sessionStorage.setItem('auth-token', data.token);
                    //console.log(data);
                    sessionStorage.setItem('admin', data.admin);                //set if admin here also
                    window.location.href = "../index.html";
                }

            }
        })
    }).catch(error => {
        console.log(error);
    });

}

window.addEventListener('DOMContentLoaded', async function () {
    let auth_token = window.sessionStorage.getItem('auth-token');
    if (auth_token != null) {
        let userCheck = await fetch('https://ucsociallydead.com/user/check', {headers:{ 'auth-token': auth_token }})
        let checkVal = await userCheck.json();
        console.log(checkVal.msg);
        if(checkVal.msg === 'user checked'){        //user did not pass verify check
            console.log('Auth token present');
            window.location.href = "./index.html";
        } else {
            console.log('Auth token not present');
        }
    }
  

});

