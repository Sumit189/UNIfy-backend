var request = require('request');
require("dotenv").config();

const createStream = (opts, callback) => {
    if (!opts.sessionName) {
        return callback("Session Name is Missing", null)
    }
    var options = {
        'method': 'POST',
        'url': 'https://livepeer.studio/api/stream',
        'headers': {
            'content-type': 'application/json',
            'authorization': process.env.LIVEPEER_APIKEY
        },
        body: JSON.stringify({
            "name": opts.sessionName,
            "profiles": [
            {
                "name": "720p",
                "bitrate": 2000000,
                "fps": 30,
                "width": 1280,
                "height": 720
            },
            {
                "name": "480p",
                "bitrate": 1000000,
                "fps": 30,
                "width": 854,
                "height": 480
            },
            {
                "name": "360p",
                "bitrate": 500000,
                "fps": 30,
                "width": 640,
                "height": 360
            }
            ]
        })
    };
    request(options, function (error, response) {
        if (error || !response.body?.streamKey) return callback(error, null)
        return callback(null, {streamKey: response.body.streamKey, streamDetails: response.body})
    });
}

module.exports = createStream;