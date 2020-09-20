const express = require('express');
const { json } = require('express');
const fetch = require('node-fetch');

const app = express();

app.get('/:celular', (request, response) => {
    let url = 'https://api.zenvia.com/v1/channels/whatsapp/messages';
    let token = 'AXJ_SswUp--Yo9b_QC1f8EDEIdc2obz5wqQy';

    fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-TOKEN': token
            },
            body: JSON.stringify({
                'from': 'enchanting-mind',
                'to': celular,
                'contents': [{
                    'type': 'text',
                    'text': 'Teste servidor 2'
                }],
            })
        })
        .then(response => {
            response.ok ?
                    response.json().then(json => { console.log(json) }) : console.log(response);
        })
        .then(() => response.send("Mensagem enviada com sucesso."))
        .catch((error) => console.log('Error:', error));
});

const server = app.listen(process.env.PORT || 8080, () => {
    const host = server.address().address;
    const port = server.address().port;

    console.log(`App listening at http://${host}:${port}`);
});