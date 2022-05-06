const { createServer } = require('http');
const authResponse = require('./resources/authResponse.json');
const authResponse1 = require('./resources/authResponse1.json');
const authResponseError = require('./resources/authResponseError.json');
const dataResponse = require('./resources/dataResponse.json');
const dataResponse1 = require('./resources/dataResponse1.json');
const metadataResponse = require('./resources/metadataResponse.json');

const PORT = 8080;

const commonUrl = {
    '/opendata/api/observacion/convencional/datos/estacion/teruel': authResponse,
    '/opendata/api/observacion/convencional/datos/estacion/8368U': authResponse,
    '/opendata/api/observacion/convencional/datos/estacion/zaragoza': authResponse1,
    '/opendata/api/observacion/convencional/datos/estacion/9434': authResponse1,
    '/opendata/sh/d1': dataResponse,
    '/opendata/sh/md1': metadataResponse,
    '/opendata/sh/d2': dataResponse1,
    '/opendata/sh/md2': metadataResponse
};

const mapUrl = {
    GET: {
        ...commonUrl
    },
    OPTIONS: {
        ...commonUrl
    }
};

const statuses = {
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR',
};

const commonHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
};

const getLog = req => (status, message = '') => {
    const now = new Date();
    let response;

    const getResponse = (status, message) => `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()} ${status.toUpperCase()} ${req.method} ${req.url} ${message ?? ''}`;

    if (status === statuses.SUCCESS) {
        response = getResponse(statuses.SUCCESS, message);
    } else {
        response= getResponse(statuses.ERROR, message);
    }

    console.log(response);
};

const getResponseData = (req, cb) => {
    const { method, url } = req;
    const data = mapUrl[method]?.[url];

    if (!data) {
        cb(new Error('Endpoint does not exist.'));
    } else {
        cb(null, data);
    }
};

createServer((req, res) => {
    let responseData;
    let log = getLog(req);

    getResponseData(req, (error, data) => {
        if (error) {
            res.writeHead(404, commonHeaders);
            responseData = authResponseError;
            log(statuses.ERROR, error);
        } else {
            res.writeHead(200, commonHeaders);
            responseData = data;
            log(statuses.SUCCESS);
        }
    });

    res.end(JSON.stringify(responseData));

}).listen(PORT, () => console.log(`mock server running on ${PORT}`))