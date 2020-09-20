const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const express = require('express');
const { json } = require('express');
const fetch = require('node-fetch');

const app = express();
const jsonParser = bodyParser.json();

let $ = cheerio.load('');

app.post('/', jsonParser, async (request, response) => {
    const resourceUrl = 'https://www.zoom.com.br';
    const apiUrl = 'https://api.zenvia.com/v1/channels/whatsapp/messages';
    const token = 'AXJ_SswUp--Yo9b_QC1f8EDEIdc2obz5wqQy';

    let query = `/search?q=${request.body.message.contents[1].text.replace(/ /g, '+')}`;
    let message = '';

    await fetch(resourceUrl + query, {
            method: 'GET'
        })
        .then(response => {
            if (!response.ok) throw new Error("HTTP error " + response.status);

            return response.text();
        })
        .then(text => {
            $ = cheerio.load(text);

            query = $('.Button_button__3nfZN.Button_system__2LJjZ.card__lead-button').first().attr('href');
        })
        .catch((error) => console.log('Error:', error));

    await fetch(resourceUrl + query, {
            method: 'GET'
        })
        .then(response => {
            if (!response.ok) throw new Error("HTTP error " + response.status);

            return response.text();
        })
        .then(text => {
            $ = cheerio.load(text);

            let prices = [];
            let stores = [];

            $('.offers-list__offer').find('.price__total').each((index, element) => {
                if (index < 3) { 
                    prices.push($(element).text());
                } else {
                    return false;
                }
            });

            $('.offers-list__offer').find('.col-store > a').each((index, element) => {
                if (index < 3) {
                    stores.push($(element).attr('title'));
                } else {
                    return false;
                }
            });
            
            message += `O valor de um ${$('.product-name > span').text()} está `;

            for (let i = 0; i < 3; i++) {
                message += prices[i];
                message += ' ';
                message += stores[i];
                i != 2 ? message += ', ' : message += '.';
            }

            console.log(message);
        })
        .catch((error) => console.log('Error:', error));

    fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-TOKEN': token
            },
            body: JSON.stringify({
                'from': 'enchanting-mind',
                'to': request.body.message.from,
                'contents': [{
                    'type': 'text',
                    'text': message
                }],
            })
        })
        .then(response => {
            response.ok ?
                response.json().then(json => console.log(json)) : console.log(response);
        })
        .then(() => response.send("Mensagem enviada com sucesso."))
        .catch((error) => console.log('Error:', error));
});

const server = app.listen(process.env.PORT || 8080, () => {
    const host = server.address().address;
    const port = server.address().port;

    console.log(`App listening at http://${host}:${port}`);
});