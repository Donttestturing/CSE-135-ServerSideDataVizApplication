
let queryResultStatic;
let queryResultPerformance;
let queryResultActivity;
let staticValues;
let performanceValues;
let activityValues;

document.addEventListener('DOMContentLoaded', async () => {

    queryResultStatic = await fetch('https://ucsociallydead.com/api/static', { 'Content-type': 'application/json' });
    queryResultPerformance = await fetch('https://ucsociallydead.com/api/performance');
    queryResultActivity = await fetch('https://ucsociallydead.com/api/activity');

    staticValues = await queryResultStatic.json();
    performanceValues = await queryResultPerformance.json();
    activityValues = await queryResultActivity.json();


    renderScatterPlot();
    renderPieChart();
    renderTwoSeriesLoadTimeOnsiteTimeBarChart();
    renderThreeSeriesOnsiteTimeIdleTimeDifferenceBarChart();
    renderThreeSeriesOnsiteTimeIdleTimeDifferenceWithDiffBarChart();
    

})

function renderThreeSeriesOnsiteTimeIdleTimeDifferenceWithDiffBarChart() {
    let valuesForIdleTime = [];
    let valuesForOnsiteTime = [];
    let valuesForRegion = [];
    let regionToIdleTimeMap = new Map();
    let regionToOnsiteTimeMap = new Map();
    
    staticValues.forEach((element)=>{
        if(element.userConnectionType != null){
            let idOfUser = element.id;
            valuesForRegion.push([idOfUser, element.userLanguage]);
        }

    });
   

    activityValues.forEach((element)=>{
        let pageEventObj, idleEventObj;
        let idOfUser = element.id;

        if(element.PageEvents != null){
            pageEventObj = JSON.parse(element.PageEvents)[0];
        }
        if(element.IdleEvents != null){
            idleEventObj = JSON.parse(element.IdleEvents)[0];
        }    
        if(idleEventObj != undefined){
            
            valuesForIdleTime.push([idOfUser, idleEventObj.idleLength]);
        }
  
        if(pageEventObj != null && pageEventObj != undefined) {
            if(pageEventObj.timeLeft != null) {
                valuesForOnsiteTime.push([idOfUser, pageEventObj.timeLeft - pageEventObj.timeEntered]);
            }
             
        }
     
        

    });
 

    valuesForRegion.forEach((elementRegion) => { 
        let userID = elementRegion[0];
        let userRegion = elementRegion[1];

        valuesForIdleTime.forEach((elementIdleTime) => {
       
            if(userID === elementIdleTime[0]  && elementIdleTime[1] < 200000){ //there are a couple extreme outliners in our data, for the US, we should go look at this, but it affects the viewability of the chart, so leaving it out for now.
                if(regionToIdleTimeMap.get(userRegion) != null) { 
                    regionToIdleTimeMap.set(userRegion, [Number(regionToIdleTimeMap.get(userRegion)[0]) + Number(elementIdleTime[1]), Number(regionToIdleTimeMap.get(userRegion)[1]) + 1]);
                } else {
                    regionToIdleTimeMap.set(userRegion, [Number(elementIdleTime[1]), 1]);
                }
            }
        });

        valuesForOnsiteTime.forEach((elementOnsiteTime) => {
            if(userID === elementOnsiteTime[0] ){ 
              
                if(regionToOnsiteTimeMap.get(userRegion) != null) { 
                    if(userID === "9d0eef46-b777-4058-acb1-09617ce5b762") {  //there is 1 extreme outliners in our data, for japan, we should go look at this, but it affects the viewability of the chart, so altering to 10% of original for now.
                        regionToOnsiteTimeMap.set(userRegion, [Number(regionToOnsiteTimeMap.get(userRegion)[0]) + 323456, Number(regionToOnsiteTimeMap.get(userRegion)[1]) + 1]);
     
                    } else {
                        regionToOnsiteTimeMap.set(userRegion, [Number(regionToOnsiteTimeMap.get(userRegion)[0]) + Number(elementOnsiteTime[1]), Number(regionToOnsiteTimeMap.get(userRegion)[1]) + 1]);
                    }        
                } 
                else {
                    regionToOnsiteTimeMap.set(userRegion, [Number(elementOnsiteTime[1]), 1]);
                }
                
            }
        });


    });
    

    let idleTimeAvgValues = [];
    regionToIdleTimeMap.forEach((value, key)=>{
        idleTimeAvgValues.push([key, value[0]/value[1]]);

    });

    let onsiteTimeAvgValues = [];
    regionToOnsiteTimeMap.forEach((value, key)=>{
        onsiteTimeAvgValues.push([key, value[0]/value[1]]);

    });

    let avgDiffIdleOnSiteTimesValues = [];
    for (let index = 0; index < onsiteTimeAvgValues.length; index++) {
        for (let i = 0; i < idleTimeAvgValues.length; i++) {
            if(idleTimeAvgValues[i] != undefined) {
                if(onsiteTimeAvgValues[index][0] === idleTimeAvgValues[i][0]){
                 

                    avgDiffIdleOnSiteTimesValues.push([onsiteTimeAvgValues[index][0], Math.abs(Number(onsiteTimeAvgValues[index][1]) - Number(idleTimeAvgValues[i][1]))]);
                }
                
            } 
                    
        }
    }


    let twoSeriesBarChartIdleTimeOnsiteTimeWithDiffConfig = {
        type: 'bar',
        legend: {
            x:"70%",
            y: "7%",
            
        },
        title: {
            text: "Average Idletime, Time Onsite, and Active time by User Region/Language"
        },
        plotarea:{
            marginLeft: 'dynamic',
        },
  
        'scale-x': {
            label: {
                text: "User Region/Language",
            },
        },
        'scale-y': {
            label: {
                text: "Average Time (millisec)",
            },
        },
        series: [
            {values: idleTimeAvgValues, text: "Idle Time"},
            {values: onsiteTimeAvgValues, text: "Onsite Time"},
            {values: avgDiffIdleOnSiteTimesValues, text: "Active Time"},
        ]
    };

    zingchart.render({
        id: 'timeOnSiteIdleTimeWithDiffChart',
        data: twoSeriesBarChartIdleTimeOnsiteTimeWithDiffConfig,
        height: '100%',
        width: '100%'
    });



}


function renderThreeSeriesOnsiteTimeIdleTimeDifferenceBarChart() {
    let valuesForIdleTime = [];
    let valuesForOnsiteTime = [];
    let valuesForRegion = [];
    let regionToIdleTimeMap = new Map();
    let regionToOnsiteTimeMap = new Map();
    
    staticValues.forEach((element)=>{
        if(element.userConnectionType != null){
            let idOfUser = element.id;
            valuesForRegion.push([idOfUser, element.userLanguage]);
        }

    });
   

    activityValues.forEach((element)=>{
        let pageEventObj, idleEventObj;
        let idOfUser = element.id;

        if(element.PageEvents != null){
            pageEventObj = JSON.parse(element.PageEvents)[0];
        }
        if(element.IdleEvents != null){
            idleEventObj = JSON.parse(element.IdleEvents)[0];
        }    
        if(idleEventObj != undefined){
            
            valuesForIdleTime.push([idOfUser, idleEventObj.idleLength]);
        }
  
        if(pageEventObj != null && pageEventObj != undefined) {
            if(pageEventObj.timeLeft != null) {
                valuesForOnsiteTime.push([idOfUser, pageEventObj.timeLeft - pageEventObj.timeEntered]);
            }
             
        }
     
        

    });
 

    valuesForRegion.forEach((elementRegion) => { 
        let userID = elementRegion[0];
        let userRegion = elementRegion[1];

        valuesForIdleTime.forEach((elementIdleTime) => {
       
            if(userID === elementIdleTime[0] && elementIdleTime[1] < 200000 ){ //there are 2 extreme outliners in our data, discard for chart
                if(regionToIdleTimeMap.get(userRegion) != null) { 
                    regionToIdleTimeMap.set(userRegion, [Number(regionToIdleTimeMap.get(userRegion)[0]) + Number(elementIdleTime[1]), Number(regionToIdleTimeMap.get(userRegion)[1]) + 1]);
                } else {
                    regionToIdleTimeMap.set(userRegion, [Number(elementIdleTime[1]), 1]);
                }
            }
        });

        valuesForOnsiteTime.forEach((elementOnsiteTime) => {
            if(userID === elementOnsiteTime[0] ) { 
              
                if(regionToOnsiteTimeMap.get(userRegion) != null) { 
                    if(userID === "9d0eef46-b777-4058-acb1-09617ce5b762") {  //there is 1 extreme outliners in our data, for japan, we should go look at this, but it affects the viewability of the chart, so altering to 10% of original for now.
                        regionToOnsiteTimeMap.set(userRegion, [Number(regionToOnsiteTimeMap.get(userRegion)[0]) + 323456, Number(regionToOnsiteTimeMap.get(userRegion)[1]) + 1]);
     
                    } else {
                        regionToOnsiteTimeMap.set(userRegion, [Number(regionToOnsiteTimeMap.get(userRegion)[0]) + Number(elementOnsiteTime[1]), Number(regionToOnsiteTimeMap.get(userRegion)[1]) + 1]);
                    }
                                   
                    
                } else {
                    regionToOnsiteTimeMap.set(userRegion, [Number(elementOnsiteTime[1]), 1]);
                }
                
            }
        });


    });
    

    let idleTimeAvgValues = [];
    regionToIdleTimeMap.forEach((value, key)=>{
        idleTimeAvgValues.push([key, value[0]/value[1]]);

    });

    let onsiteTimeAvgValues = [];
    regionToOnsiteTimeMap.forEach((value, key)=>{
        onsiteTimeAvgValues.push([key, value[0]/value[1]]);

    });


    let twoSeriesBarChartIdleTimeOnsiteTimeConfig = {
        type: 'bar',
        legend: {
            x:"70%",
            y: "7%",
            
        },
        title: {
            text: "Average Idletime, Time Onsite, by User Region/Language"
        },
        plotarea:{
            marginLeft: 'dynamic',
        },
  
        'scale-x': {
            label: {
                text: "User Region/Language",
            },
        },
        'scale-y': {
            label: {
                text: "Average Time (millisec)",
            },
        },
        series: [
            {values: idleTimeAvgValues, text: "Idle Time"},
            {values: onsiteTimeAvgValues, text: "Onsite Time"},
        ]
    };

    zingchart.render({
        id: 'timeOnSiteIdleTimeDiffChart',
        data: twoSeriesBarChartIdleTimeOnsiteTimeConfig,
        height: '100%',
        width: '100%'
    });



}



function renderTwoSeriesLoadTimeOnsiteTimeBarChart() {
    let valuesForLoadTime = [];
    let valuesForOnsiteTime = [];
    let valuesForRegion = [];
    let regionToLoadTimeMap = new Map();
    let regionToOnsiteTimeMap = new Map();
    
    staticValues.forEach((element)=>{
        //console.log(element.id, element.userConnectionType);
        if(element.userConnectionType != null){
            let idOfUser = element.id;
            valuesForRegion.push([idOfUser, element.userLanguage]);
        }

    });
   
    performanceValues.forEach((element)=>{
        //console.log(element);
        if(element.loadTime != null){
            let idOfUser = element.id;
            valuesForLoadTime.push([idOfUser, element.loadTime]);
        }

    });

    activityValues.forEach((element)=>{
        let pageEventObj;
        if(element.PageEvents != null){
            pageEventObj = JSON.parse(element.PageEvents)[0];
        }
            

        if(pageEventObj != null && element.PageEvents.length > 0 && pageEventObj != undefined) {
            if(pageEventObj.timeLeft != null) {
                let idOfUser = element.id;
                valuesForOnsiteTime.push([idOfUser, pageEventObj.timeLeft - pageEventObj.timeEntered]);
            }
             
        }

    });
 

    valuesForRegion.forEach((elementRegion) => { 
        let userID = elementRegion[0];
        let userRegion = elementRegion[1];

        valuesForLoadTime.forEach((elementLoadTime) => {
               
            if(userID === elementLoadTime[0]){
                if(regionToLoadTimeMap.get(userRegion) != null){
                    regionToLoadTimeMap.set(userRegion, [Number(regionToLoadTimeMap.get(userRegion)[0]) + Number(elementLoadTime[1]), Number(regionToLoadTimeMap.get(userRegion)[1]) + 1]);
                } else {
                    regionToLoadTimeMap.set(userRegion, [Number(elementLoadTime[1]), 1]);
                }
                
            }
        });

        valuesForOnsiteTime.forEach((elementOnsiteTime) => {
            if(userID === elementOnsiteTime[0]  ){ 
                if(regionToOnsiteTimeMap.get(userRegion) != null) { 
                    if(userID === "9d0eef46-b777-4058-acb1-09617ce5b762") {  //there is 1 extreme outliners in our data, for japan, we should go look at this, but it affects the viewability of the chart, so altering to 10% of original for now.
                        regionToOnsiteTimeMap.set(userRegion, [Number(regionToOnsiteTimeMap.get(userRegion)[0]) + 323456, Number(regionToOnsiteTimeMap.get(userRegion)[1]) + 1]);
     
                    } else {
                        regionToOnsiteTimeMap.set(userRegion, [Number(regionToOnsiteTimeMap.get(userRegion)[0]) + Number(elementOnsiteTime[1]), Number(regionToOnsiteTimeMap.get(userRegion)[1]) + 1]);
                    }                
                } else {
                    regionToOnsiteTimeMap.set(userRegion, [Number(elementOnsiteTime[1]), 1]);
                }
                
            }
        });


    });
    

    let loadTimeAvgValues = [];
    regionToLoadTimeMap.forEach((value, key)=>{
        loadTimeAvgValues.push([key, value[0]/value[1]]);

    });

    let onsiteTimeAvgValues = [];
    regionToOnsiteTimeMap.forEach((value, key)=>{
        onsiteTimeAvgValues.push([key, value[0]/value[1]]);

    });
    

    let twoSeriesBarChartLoadTimeOnsiteTimeConfig = {
        type: 'bar',
        legend: {
            x:"70%",
            y: "7%",

        },
        title: {
            text: "Average Loadtime and Time Onsite, by User Region/Language"
        },
        plotarea:{
            marginLeft: 'dynamic',
        },
  
        'scale-x': {
            label: {
                text: "User Region/Language",
            },
        },
        'scale-y': {
            label: {
                text: "Average Time (millisec)",
            },
        },
        series: [
            {values: loadTimeAvgValues, text: "Load Time"},
            {values: onsiteTimeAvgValues, text: "Onsite Time"},
        ]
    };

    zingchart.render({
        id: 'timeOnSiteLoadTimeChart',
        data: twoSeriesBarChartLoadTimeOnsiteTimeConfig,
        height: '100%',
        width: '100%'
    });



}





function renderScatterPlot() {
    let scatterSeriesArr = [];

    activityValues.forEach((element) => {
        if(element != null){
            let userMouseEvents = JSON.parse(element.MouseEvents);
            if(userMouseEvents != null){
               
                let usersCoordsList = []
                userMouseEvents.forEach(mEvent => {
                    //console.log(mEvent.coords);
                    usersCoordsList.push(mEvent.coords);
                });
                let usersCoords = {values : usersCoordsList};
                scatterSeriesArr.push(usersCoords);
            }
           
        }
      
    });

    var scatterChartVals = {
        "type": "scatter",
        "series": scatterSeriesArr,

        'scale-x': {
            values: "0:1920", 
        },
        'scale-y': {
            values: "0:1080",
            mirrored: true,
        },
        title: {
            text: "User mouse locations on ucsociallydead.com's homepage",
            y: "0%"
        },
        subtitle: {
            text: "By (x,y) coordinate, truncated by most recent user activity",
          
        },

      };

       
      zingchart.render({
        id: 'scatterChart',
        data: scatterChartVals,
        height: '100%',
        width: "100%"
      });

}


  function renderPieChart() {
    const counts = new Map();

    for (let i = 0; i < staticValues.length; i++) {
        let language = staticValues[i]['userLanguage'];
        if (counts.has(language)) {
            counts.set(language, counts.get(language) + 1);
        }
        else {
            counts.set(language, 1);
        }
    }


    let data = [];
    for (const [key, value] of counts) {
        data.push({ values: [Number(`${value}`)], text: `${key}` });
    }

    let pieChartConfig = {
        type: "pie",
        title: {
            text: "Region/Language Distribution"
        },
        plot: {
            borderWidth: 2,
            // slice: 90,
            valueBox: {
                placement: 'out',
                text: '%t\n%npv%',
                fontFamily: "Open Sans"
            },
            tooltip: {
                fontSize: '18',
                fontFamily: "Open Sans",
                padding: "5 10",
                text: "%npv%"
            },
            animation: {
                effect: "ANIMATION_FADE_IN",
                delay: "750"
            },
        },
        series: data

    };

    zingchart.render({
        id: 'pieChart',
        data: pieChartConfig,
        height: '100%',
        width: "100%"
    });
}

function renderThreeSeriesLineChart() {

    const TAIWAN = "zh-TW"
    const ENGLISH = "en-US"
    const SPANISH = "es"

    const loadTimesByLanguage = new Map();
    const values = [[], [], []]

    // Loop through the performance data
    for (let i = 0; i < staticValues.length; i++) {
        const staticObj = staticValues[i];
        let id = staticObj['id']
        let userLanguage = staticObj['userLanguage']
        loadTimesByLanguage.set(id, [userLanguage, undefined])
    }

    for (let i = 0; i < performanceValues.length; i++) {
        const performanceObj = performanceValues[i]
        let id = performanceObj['id']
        let loadTime = performanceObj['loadTime']
        if (loadTimesByLanguage.get(id) == null)
            continue
        let userLanguage = loadTimesByLanguage.get(id)[0]
        loadTimesByLanguage.set(id, [userLanguage, loadTime]);
    }

    for (const value of loadTimesByLanguage.values()) {
        if (value[1] === undefined)
            continue

        //console.log(value[0])
        switch (value[0]) {
            case ENGLISH:
                values[0].push(value[1])
                break;
            case SPANISH:
                values[1].push(value[1])
                break;
            case TAIWAN:
                values[2].push(value[1])
                break
        }
    }


    const threeSeriesLineChartConfig = {
        type: "line",
        plotarea: {
            backgroundColor: '#90ADC6',
            //border: '#DAD02C',
        },
        scaleX: {
            label: {
                text: ""
            }
        },
        scaleY: {
            label: {
                text: "Load Time"
            }

        },

        legend: {
            //x:"35%",
            y: "8%",
            layout: "1x3"
        },
        title: {
            text: "Load Time Grouped By Language",
            y: "0%"
        },
        series: [
            {
                values: values[0],
                text: "en-US",
                'line-color': 'grey',
            },
            {
                values: values[1],
                text: "es",
                'line-color': '#DAD02C'
            },
            {
                values: values[2],
                text: "zh-TW",
                'line-color': '#333652'
            },
        ]
    };

    // Render the chart using ZingChart
    zingchart.render({
        id: 'threeSeriesLineChart',
        data: threeSeriesLineChartConfig,
        height: '100%',
        width: '100%'
    });
}


function renderTwoSeriesBarChart() {

    const loadTimesByConnectionType = new Map();
    const values = [];

    const valuesWithImages = [];
    const valuesWithoutImages = [];


    for (let i = 0; i < staticValues.length; i++) {
        const staticObj = staticValues[i];
        let id = staticObj['id']
        let connectionType = staticObj['userConnectionType']
        let userAllowsImages = staticObj['userAllowsImages'];
        loadTimesByConnectionType.set(id, [userAllowsImages, connectionType, undefined])
    }

    for (let i = 0; i < performanceValues.length; i++) {
        const performanceObj = performanceValues[i]
        let id = performanceObj['id']
        let loadTime = performanceObj['loadTime']
        if (loadTimesByConnectionType.get(id) == null)
            continue
        let connectionType = loadTimesByConnectionType.get(id)[1]
        loadTimesByConnectionType.set(id, [loadTimesByConnectionType.get(id)[0], connectionType, loadTime]);
    }

    for (const value of loadTimesByConnectionType.values()) {
        if (value[2] === undefined)
            continue
        //console.log(value); 
        if(value[0] == 1){
            if(value[1] != null){
                valuesWithImages.push([value[1], value[2]]);
            }
                
    
        } else {
            if(value[1] != null){
                valuesWithoutImages.push([value[1], value[2]]);
            }
                
        }
        //values.push(value);
    }

    //const averages = values.map(([connectionType, loadTime]) => [connectionType, loadTime / values.length]);
    //const averagesWithImages = valuesWithImages.map(([connectionType, loadTime]) => [connectionType, loadTime / valuesWithImages.length]);
    let twogCount = 0, twogSum = 0, threegCount = 0, threegSum = 0, fourgCount = 0, fourgSum = 0;
    valuesWithImages.forEach((key, value)=>{

        if(key[0] === "2g"){
            twogSum += Number(key[1]);
            twogCount++;
        } else if(key[0] === "3g"){
            threegSum += Number(key[1]);
            threegCount++;
        } else if(key[0] === "4g"){
            fourgSum += Number(key[1]);
            fourgCount++;
        }

    });

    let twogCountWithOut = 0, twogSumWithOut = 0, threegCountWithOut = 0, threegSumWithOut = 0, fourgCountWithOut = 0, fourgSumWithOut = 0;
    valuesWithoutImages.forEach((key, value)=>{

        if(key[0] === "2g"){
            twogSumWithOut += Number(key[1]);
            twogCountWithOut++;
        } else if(key[0] === "3g"){
            threegSumWithOut += Number(key[1]);
            threegCountWithOut++;
        } else if(key[0] === "4g"){
            fourgSumWithOut += Number(key[1]);
            fourgCountWithOut++;
        }
        
    });

    const averagesWithImages = [["2g",twogSum/twogCount], ["3g",threegSum/threegCount], ["4g",fourgSum/fourgCount]]
    const averagesWithoutImages = [["2g",twogSumWithOut/twogCountWithOut], ["3g",threegSumWithOut/threegCountWithOut], ["4g",fourgSumWithOut/fourgCountWithOut]]
    //const averagesWithoutImages = valuesWithoutImages.map(([connectionType, loadTime]) => [connectionType, loadTime / valuesWithoutImages.length]);

    //console.log(averagesWithImages);
    //console.log(averagesWithoutImages);

    let twoSeriesBarChartConfig = {
        type: 'bar3d',
        legend: {
            x:"1%",
            y: "92%",
            layout: "1x2"
        },
        title: {
            text: "Loadtime~images, by Connection Type"
        },
        plotarea:{
            marginLeft: 'dynamic',
        },
        plot: {
            facets: {

            },
   
        },
        'scale-x': {
            label: {
                text: "Connection Type",
            },
        },
        'scale-y': {
            label: {
                text: "Average Load Time (sec)",
            },
        },
        series: [
            {values: averagesWithImages, text: "With Images"},
            //{values: [0.1, 0.1, 0.1], text: "Without Images"},
            {values: averagesWithoutImages, text: "Without Images"}
        ]
    };

    zingchart.render({
        id: 'twoSeriesBarChart',
        data: twoSeriesBarChartConfig,
        height: '100%',
        width: '100%'
    });


    let chartConfig = {
        type: 'bar',
        series: [{
            values: [20, 40, 25, 50, 15, 45, 33, 34]
          },
          {
            values: [5, 30, 21, 18, 59, 50, 28, 33]
          },
          {
            values: [30, 5, 18, 21, 33, 41, 29, 15]
          }
        ]
      };
       
      zingchart.render({
        id: 'twoSeriesBarChart',
        data: chartConfig,
        height: '100%',
        width: '100%'
      });


}






