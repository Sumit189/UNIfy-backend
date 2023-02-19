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
        if (error || !response.body) return callback(error)
        let result = JSON.parse(response.body)
        return callback(null, {streamKey: result.streamKey, streamId: result.id, streamDetails: result})
    });
}

const deleteStream = (opts, callback) => {
    if (!opts?.streamId) {
        return callback("Session Id is Missing", null)
    }
    var options = {
    'method': 'DELETE',
    'url': `https://livepeer.studio/api/stream/${opts.streamId}`,
    'headers': {
        'authorization': process.env.LIVEPEER_APIKEY
    }
    };
    request(options, function (error, response) {
        if (error || !response.body) return callback(error)
        return callback(null, {success: true})
    });

}

module.exports = {
    createStream,
    deleteStream
  };