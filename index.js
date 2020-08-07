const dotenv = require('dotenv')
const express = require('express')
const path = require('path')
const { createClient } = require('@kandy-io/cpaas-nodejs-sdk')
var request = require('request');

dotenv.config()

const server = express()
const port = process.env.PORT || '8000'

let client = "";
let sendMessage = [];

//setDefaultState()
server.use(express.static(path.join(__dirname, '/public')))
server.use(express.json())
server.use(express.urlencoded({
    extended: true
}))
server.set('view engine', 'ejs')

server.get('/', (req, res) => {
    const type = req.query.success ? 'success' : 'error';
    const message = req.query[type]
    sendMessage = [];

    res.render('pages/login', { alert: { message, type } })
})

server.post('/send', async (req, res) => {
    try {
        const response = await client.conversation.createMessage({
            destinationAddress: req.body.number_destination,
            message: req.body.message_text,
            senderAddress: process.env.PHONE_NUMBER
        })

        const type = 'success';
        //const message =  "success"
        sendMessage.push(response.message);

        res.render('pages/home', { alert: { sendMessage, type } })
    } catch (error) {
        // Received error message is echoed back to the UI as an error alert.
        const type = 'error';
        const message = errorMessageFrom(error)
        if (error.exceptionId == 'Unknown') {
            res.render('pages/login', { alert: { message, type } })
        } else {
            res.render('pages/home', { alert: { message, type } })
        }

    }
})

server.post('/logout', (req, res) => {
    const type = 'success';
    const message = 'Successfully Logout'
    sendMessage = [];

    res.render('pages/login', { alert: { message, type } })
})

server.post('/home', async (req, res) => {

    let baseUrl = req.body.baseUrl;
    let key = req.body.privateProjectKey;
    let secret = req.body.privateProjectSecret;

    if (baseUrl == undefined || baseUrl.length < 1) {
        res.redirect(302, '/?error=Please enter Base Url');
        return;
    }

    if (key == undefined || key.length < 1) {
        res.redirect(302, '/?error=Please enter Private Project Key');
        return;
    }

    if (secret == undefined || secret.length < 1) {
        res.redirect(302, '/?error=Please enter Private Project Secret');
        return;
    }


    client = await createClient({
        clientId: key,
        clientSecret: secret,
        baseUrl: baseUrl
    })

    var options = {
        'method': 'POST',
        'url': baseUrl + '/cpaas/auth/v1/token',
        'headers': {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
            client_id: key,
            client_secret: secret,
            grant_type: 'client_credentials',
            scope: 'openid'
        }
    };
    request(options, function (error, response) {
        if (error) {
            const type = 'error';
            const message = 'Invalid base URL or server is down';
            res.render('pages/login', { alert: { message, type } })
        } else {
            if (response.statusCode == 200) {
                const type = 'success';
                const message = 'Login Success';
                res.render('pages/home', { alert: { message, type } })
            } else {
                const type = 'error';
                const data = JSON.parse(response.body);
                const message = data.error_description;
                res.render('pages/login', { alert: { message, type } })
            }
        }
    });

})

server.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`)
})

function errorMessageFrom(error) {
    const { message, name, exceptionId } = error

    return `${name}: ${message} (${exceptionId})`
}
