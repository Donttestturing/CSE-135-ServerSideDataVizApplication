

window.onload = async function() {
    let auth_token = sessionStorage.getItem('auth-token');
    let admin_token = sessionStorage.getItem('admin');  //TODO add hashing for admin?



    if(auth_token == null){
        console.log('Auth token not present, redirecting to login page')
        window.location.href = "./login.html";
    } 

    if(admin_token == null || admin_token != 1){
        console.log('Admin token not present, redirecting to login page')
        window.location.href = "./login.html";
    } 

    let aToken = JSON.stringify({ "auth-token": auth_token, "admin-token": admin_token });
    document.getElementById("headParam").value = aToken;    //trying to add token to zinggrid request
    document.getElementById("zgData").src = "https://ucsociallydead.com/user";


    //console.log(document.getElementById("headParam").value);

    //let respon = await fetch('https://ucsociallydead.com/user/secure-api', {headers:{ 'auth-token': auth_token }});
    //let respon = await fetch('https://ucsociallydead.com/user/secure-api', {headers:{ 'auth-token': auth_token, 'admin-token': admin_token }});
    //let responseVal = await respon.json();
    //console.log(responseVal);
    
    //if(responseVal.msg !== "jwt malformed")
        //document.getElementById("outputLoc").innerText = JSON.stringify(responseVal);

   
    //console.log(document.getElementById("headParam"));
    
    setTimeout(()=>{
        document.getElementById("logoutBtn").addEventListener("click", ()=>{
            sessionStorage.clear();
            window.location.href = "./logout.html";
        });
    }, 10);
    

  


};


// window.addEventListener("DOMContentLoaded", ()=>{
//     let auth_token = sessionStorage.getItem('auth-token');
//     let admin_token = sessionStorage.getItem('admin');  //TODO add hashing for admin?
//     let aToken = JSON.stringify({ "auth-token": auth_token });


// });

