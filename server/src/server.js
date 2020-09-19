const express = require('express');
const { json } = require('express');

const app = express();

app.get('/', (request, response) => {
    response.send('Hello World');
});

app.listen(5555, () => console.log('Server initialized.'));