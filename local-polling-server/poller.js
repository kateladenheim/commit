const axios = require('axios');
const osc = require('node-osc');

const HEROKU_ENDPOINT = 'https://commit-3e48a13ebc10.herokuapp.com/latest-data';
const POLL_INTERVAL = 1000;

const oscClient = new osc.Client('localhost', 8000);

function pollServer() {
    axios.get(HEROKU_ENDPOINT)
        .then(response => {
            const data = response.data;
            oscClient.send('/clickCount1', parseFloat(data.button1));
            oscClient.send('/clickCount2', parseFloat(data.button2));
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });

    setTimeout(pollServer, POLL_INTERVAL);
}

pollServer();
