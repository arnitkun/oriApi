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

/**
 * Returns number of messages with hour
 * @param {string} user_type one of three: customer, bot, admin
 * @param {Object} data the array of object containing chat information from JSON file
 * @param {string} timezone timezone as per requested
 */
function getDatainHours(user_type, data, timezone) {
    // data.forEach(row => {
    //     console.log(typeof row.createdAt);
    // });
    let chatsForUser = data.filter(function (ob) {
        return ob.sender == user_type;
    });

    
    Object.values(chatsForUser).forEach(element => {
            element.createdAt = moment.tz(element.createdAt, timezone).format("YYYY-MM-DD HH");
    });

    // console.log(chatsForUser[0].createdAt);

    var hours = {};
    var dataByHour = [];

    chatsForUser.forEach(function(val){
        var hour = val.createdAt;

        if(hour in hours){
            hours[hour].push(val);
        } else {
            hours[hour] = new Array(val);
        }
    });

    for(let i = 0 ; i < Object.keys(hours).length; i++){
        let ob = {};
        ob.hour = Object.keys(hours)[i];
        ob.messages = Object.values(hours)[i].length;
        dataByHour.push(ob);
    }
    return dataByHour;

}

/**
 * Returns number of messages with day
 * @param {string} user_type one of three: customer, bot, admin
 * @param {Object} data the array of object containing chat information from JSON file
 * @param {string} timezone timezone as per requested
 */
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

/**
 * Helper function that selects between hour and day
 * @param {string} user_type one of three: customer, bot, admin
 * @param {Object} data the array of object containing chat information from JSON file
 * @param {string} timezone timezone as per requested
 * @param {*} timescale "day"/"hour" as per choice
 */
function resizeData(user_type, importedData, timezone,timescale){
    if(timescale == 'day' || timescale == 'days'){
        return getDataInDays(user_type, importedData, timezone);
    } else 
        if(timescale == 'hours' || timescale == 'hour'){
            return getDatainHours(user_type, importedData, timezone);
        } else {
        return "Incorrect choice! Please choose in days or hours.";
    }
}

/**
 * 
 * route handler
 */
function graphHandler(req, res, body) {
    const {user_type, timezone, timescale} = req.body;
    
    let importedData = [];
    
    fs.createReadStream(filePath)
        .on('error', (error) => {
            console.log(error);
        })
        .pipe(csvParser())
        .on('data', (row) => {
            importedData.push(row);
        })
        .on('end',()=>{
            console.log("file parsed!");
            console.log("imported data length  " + importedData.length)
            let userdata = resizeData(user_type, importedData, timezone, timescale);
            res.send(userdata);
            
        })
        .on('error', () => {
            res.send("Something went wrong. Please retry.");
        })

}

module.exports = {
    graphHandler
}