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
    const greetings = request.body.message.contents[1].text.toLowerCase().includes('oi') ? true : false; 

    let query = `/search?q=${request.body.message.contents[1].text.replace(/ /g, '+')}`;
    let message = '';

    if (!greetings) {
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

                console.log(query);
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
                        if ($(element).text() !== 'undefined') prices.push($(element).text());
                    } else {
                        return false;
                    }
                });

                $('.offers-list__offer').find('.col-store > a').each((index, element) => {
                    if (index < 3) {
                        if ($(element).attr('title') !== 'undefined') stores.push($(element).attr('title'));
                    } else {
                        return false;
                    }
                });
                
                if (prices.length == 0 || stores.length == 0) {
                    message += 'Foi mal. Não achei seu item :('; 
                } else {
                    message += `O valor de um ${$('.product-name > span').text()} está `;
                }

                for (let i = 0; i < prices.length; i++) {
                    message += prices[i];
                    message += ' ';
                    message += stores[i];
                    i != prices.length - 1 ? message += ', ' : message += '.';
                }

                console.log(message);
            })
            .catch((error) => console.log('Error:', error));
    } else {
        message += `Oi, ${request.body.message.contents[0].payload.visitor.firstName}! Sou a Luppita. Estou aqui para te ajudar. Tem interesse em algum produto? Especifique o produto que eu pesquiso para você.`;

        console.log(message);
    }

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