 

const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
const TIMEOUT = 50000; 
let STORAGE = [];

const CREDENTIALS = {
    "companyName": "goMart",
    "clientID": "4b3e6e8d-df80-41d9-8554-dda180208c7d",
    "clientSecret": "nqzpRmBgXmCzmbKT",
    "ownerName": "suhruthyenneti",
    "ownerEmail": "suhruthyenneti.2004@gmail.com",
    "rollNo": "vu21csen0300018"
};

let accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzI0NzM4NDYyLCJpYXQiOjE3MjQ3MzgxNjIsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjRiM2U2ZThkLWRmODAtNDFkOS04NTU0LWRkYTE4MDIwOGM3ZCIsInN1YiI6InN1aHJ1dGh5ZW5uZXRpLjIwMDRAZ21haWwuY29tIn0sImNvbXBhbnlOYW1lIjoiZ29NYXJ0IiwiY2xpZW50SUQiOiI0YjNlNmU4ZC1kZjgwLTQxZDktODU1NC1kZGExODAyMDhjN2QiLCJjbGllbnRTZWNyZXQiOiJucXpwUm1CZ1htQ3ptYktUIiwib3duZXJOYW1lIjoic3VocnV0aHllbm5ldGkiLCJvd25lckVtYWlsIjoic3VocnV0aHllbm5ldGkuMjAwNEBnbWFpbC5jb20iLCJyb2xsTm8iOiJ2dTIxY3NlbjAzMDAwMTgifQ.EFOdrhyoEYgglVTVBY-lQIKWHT5IotXiuAgTWq_z16Y";
const API_ENDPOINTS = {
    p: 'http://20.244.56.144/test/primes',
    f: 'http://20.244.56.144/test/fibo',
    e: 'http://20.244.56.144/test/even',
    r: 'http://20.244.56.144/test/rand'
};

const getAccessToken = async () => {
    try {
        const response = await axios.post('http://20.244.56.144/test/auth', {
            companyName: CREDENTIALS.companyName,
            clientID: CREDENTIALS.clientID,
            clientSecret: CREDENTIALS.clientSecret,
            ownerName: CREDENTIALS.ownerName,
            ownerEmail: CREDENTIALS.ownerEmail,
            rollNo: CREDENTIALS.rollNo
        });
        accessToken = response.data.access_token;
    } catch (error) {
        console.error('Error fetching access token:', error.message);
    }
};

const fetchNumbers = async (type) => {
    try {
        const response = await axios.get(API_ENDPOINTS[type], {
            headers: { 'Authorization': `Bearer ${accessToken}` },
            timeout: TIMEOUT
        });
        return response.data.numbers;
    } catch (error) {
        console.error(`Error fetching ${type} numbers:`, error.message);
        return [];
    }
};

app.get('/numbers/:numberid', async (req, res) => {
    const numberid = req.params.numberid;
    if (!['p', 'f', 'e', 'r'].includes(numberid)) {
        return res.status(400).json({ error: 'Invalid number type' });
    }

    const start = Date.now();
    const newNumbers = await fetchNumbers(numberid);
    const end = Date.now();

    if (end - start > TIMEOUT) {
        return res.status(504).json({ error: 'Timeout exceeded while fetching numbers' });
    }
    const uniqueNewNumbers = [...new Set(newNumbers)];
    const windowPrevState = [...STORAGE];
    uniqueNewNumbers.forEach(number => {
        if (!STORAGE.includes(number)) {
            if (STORAGE.length >= WINDOW_SIZE) {
                STORAGE.shift(); 
            }
            STORAGE.push(number);
        }
    });

    const windowCurrState = [...STORAGE];
    const avg = (STORAGE.length === 0) ? 0 : STORAGE.reduce((a, b) => a + b, 0) / STORAGE.length;

    res.json({
        windowPrevState,
        windowCurrState,
        numbers: uniqueNewNumbers,
        avg: avg.toFixed(2)
    });
});

app.listen(PORT, async () => {
    await getAccessToken();
    console.log(`Server is running on http://localhost:${PORT}`);
});
