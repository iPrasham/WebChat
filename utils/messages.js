const moment = require('moment');

function formatMessage(username, text){
    return {                            // this would be returned as object, ES6 functionality
        username,
        text,
        time: moment().format('h:m a')
    };
}

module.exports = formatMessage;
