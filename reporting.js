

window.onload = async function() {
    let auth_token = sessionStorage.getItem('auth-token');
    let admin_token = sessionStorage.getItem('admin');

    if(auth_token == null){
        console.log('Auth token not present, redirecting to login page')
        window.location.href = "./login.html";
    }

    if (admin_token == 1) {
        let usersLink = document.createElement("section");
        usersLink.innerHTML = `<li> <a href="./users.html"> Users </a> </li>`;
        document.getElementsByTagName('header')[0].appendChild(usersLink);
    } 
    
    let userCheck = await fetch('https://ucsociallydead.com/user/check', {headers:{ 'auth-token': auth_token }})
    let checkVal = await userCheck.json();
    
    if(checkVal.msg !== 'user checked'){        //user did not pass verify check
        console.log('Auth token not present, redirecting to login page')
        window.location.href = "./login.html";
    }


    let respon = await fetch('https://ucsociallydead.com/api/static', {headers:{ 'auth-token': auth_token }})
    let responseVal = await respon.json();
  
    let gridData = [];
    responseVal.forEach(element => {
        let percentAcceptance = Math.floor(((Number(element.userAllowsCss) + Number(element.userAcceptsCookies) + Number(element.userAllowsJavaScript) + Number(element.userAllowsImages))/4) * 100);
        percentAcceptance += "%";
        gridData.push({id: element.id, 'User accepts Cookies': element.userAcceptsCookies, 'User allows Javascript': element.userAllowsJavaScript,
         'User allows Css': element.userAllowsCss,  'User allows Images': element.userAllowsImages, 'Percent Acceptance': percentAcceptance});
    });
    

    document.getElementById("acceptanceGrid").setData(gridData);

};


document.addEventListener('DOMContentLoaded', async () => {
    let viewDatabaseGrids = document.getElementById("flexSwitchCheckChecked");

    viewDatabaseGrids.addEventListener('click', ()=>{
        document.getElementById("databaseGrids").hidden = viewDatabaseGrids.checked ? false : true;
    });


    setTimeout(()=>{
        document.getElementById("logoutBtn").addEventListener("click", ()=>{
            sessionStorage.clear();
            window.location.href = "./logout.html";
        });
    }, 10);

})
