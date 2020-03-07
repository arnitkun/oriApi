const fs = require('fs');
const moment = require('moment-timezone');
const bodyparser = require('body-parser');
const csvParser = require('csv-parser');
const path = require('path');

const filePath = path.join(__dirname,'..', 'data.csv');

/**
 * 
 * @param {object} data List of json objects obtained by parsing the csv file.
 * @param {string} timezone The requested timezone.
 */

function convertToTimeZone(data, timezone) {
    Object.values(data).forEach(element => {
            element.createdAt = moment.tz(element.createdAt, timezone).format("YYYY-MM-DD");
    });
    return data;
}

function getDatainHours(data) {
    // data.forEach(row => {
    //     console.log(typeof row.createdAt);
    // });
}

function getDataInDays(user_type,data, timezone) {

    let chatsForUser = data.filter(function (ob) {
        return ob.sender == user_type;
    });

    let convertedUserData = convertToTimeZone(chatsForUser, timezone);

    var days = {};
    var dayData = [];

    convertedUserData.forEach(function (val) {
        var day = val.createdAt;
        if(day in days) {
            days[day].push(val);            
        } else {
            days[day] = new Array(val);
        }
    });
    
    // console.log(Object.keys(days));

    for(let i = 0 ; i < Object.keys(days).length; i++){
        let ob = {};
        ob.day = Object.keys(days)[i];
        ob.messages = Object.values(days)[i].length;
        dayData.push(ob);
    }
    return dayData;

}





function graphHandler(req, res, body) {
    const {user_type, timezone, timescale} = req.body;
    
    
    let importedData = [];
    
    fs.createReadStream(filePath)
        .on('error', (error) => {
            console.log(error);
        })

        .pipe(csvParser())
        .on('data', (row) => {
            // console.log(row);
            importedData.push(row);
        })
        .on('end',()=>{
            console.log("file parsed!");
            console.log("imported data length  " + importedData.length)
            let userdata = getDataInDays(user_type, importedData, timezone);
            console.log(userdata)
            
        })

}

module.exports = {
    graphHandler
}