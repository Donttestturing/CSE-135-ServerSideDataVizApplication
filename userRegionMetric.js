window.onload = async function() {
    let auth_token = sessionStorage.getItem('auth-token');

    if(auth_token == null){
        console.log('Auth token not present, redirecting to login page')
        window.location.href = "./login.html";
    }


    let respon = await fetch('https://ucsociallydead.com/api/static', {headers:{ 'auth-token': auth_token }})
    let responseVal = await respon.json();
  

    let gridData = [];
    let gridMap = new Map();
    responseVal.forEach(element => {
        if(element.userConnectionType != null) {   
            gridMap.set(element.id, {"id":element.id, "UserRegion": element.userLanguage, "ConnectionType":element.userConnectionType});
        }
        
    });
    

    let responPerf = await fetch('https://ucsociallydead.com/api/performance', {headers:{ 'auth-token': auth_token }})
    let responseValPerf = await responPerf.json();

    responseValPerf.forEach(element => {
        if(element.timingObject != null) {
            let userAttriList = gridMap.get(element.id);
            if(userAttriList != null && userAttriList != undefined){
                userAttriList.LoadTime = Number(element.loadTime);
            }
                
        }
       
    });
    
    let responeAct = await fetch('https://ucsociallydead.com/api/activity', {headers:{ 'auth-token': auth_token }})
    let responseValAct = await responeAct.json();

    responseValAct.forEach(element => {
        if(element.PageEvents != null) {
            let pageEventObj;
            if(element.PageEvents != null){
                pageEventObj = JSON.parse(element.PageEvents)[0];
            }


            if(pageEventObj != undefined && pageEventObj.timeLeft != null){
                let userAttriList = gridMap.get(element.id);
                if(userAttriList != undefined){
                    userAttriList.OnsiteTime = pageEventObj.timeLeft - pageEventObj.timeEntered;
                }
                
            }
            if(pageEventObj != undefined) {
                let userAttriList = gridMap.get(element.id);
                if(userAttriList != undefined){
        
                    let mouseEvents = JSON.parse(element.MouseEvents);
                    let kbEvents = JSON.parse(element.KeyboardEvents);

                    if(mouseEvents.length > 0 || kbEvents.length > 0){
                        userAttriList.active = true;
                        
                    }else {
                        userAttriList.active = false;
                    }
                    
              
                } 
                                
            }
                          
        }
       
    });
    let activeTotal = 0; let numTotal = 0;
    gridMap.forEach(element => {

        //console.log(element);
        if(element.active == undefined){    //element has no entry in activity table, treat as inactive
            element.active = false;
        }
        if(element.active){
            activeTotal++;      
        }

        numTotal++;
        gridData.push(element);
        
    });


    //console.log(bounceTotal,numTotal);
    //console.log(Math.floor((bounceTotal/numTotal) * 100) + "%");
    const bRate = Math.floor(((numTotal-activeTotal)/numTotal) * 100) + "%";
    document.getElementById("bounceTimeAndRateGrid").setData(gridData);



    document.getElementById("bounceRate").innerHTML = ` <b> ${bRate} </b> `;


};



document.addEventListener('DOMContentLoaded', async () => {
    let viewDiffToggle = document.getElementById("showDiffToggle");

    viewDiffToggle.addEventListener('click', ()=>{

        document.getElementById("timeOnSiteIdleTimeDiffChart").hidden = viewDiffToggle.checked ? true : false;

        //timeOnSiteIdleTimeWithDiffChart
        document.getElementById("timeOnSiteIdleTimeWithDiffChart").hidden = viewDiffToggle.checked ? false : true;
    
    });


    setTimeout(()=>{
        document.getElementById("logoutBtn").addEventListener("click", ()=>{
            sessionStorage.clear();
            window.location.href = "./logout.html";
        });
    }, 10);

})


