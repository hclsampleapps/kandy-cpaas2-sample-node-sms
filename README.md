# kandy-cpaas2-sample-sms-node

SMS app based on node.js, is used to create communication channel between two users via SMS APIs

## Setup & Run

Install dependencies via

	npm install

Start the server via

	npm start

## Usage

### Login

There are 3 fields in the form

1. **Base Url**: Enter base url.
2. **Private Project Key**: Enter private project key.
3. **Private Project Secret**: Enter private project secret value.

### Send SMS

There are 2 fields in the form

1. **Phone number**: The phone number where the SMS is to be sent.
2. **Message**: A text message for the SMS

When clicked on `Send` button, a SMS is sent out.

Here, the `sender` phone number is the one present in `.env` file as PHONE_NUMBER and `destination` is the one entered in the form.
