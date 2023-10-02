const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Cache = require('cache-manager');
const HttpStatus = require('http-status-codes');

const app = express();
app.use(express.json());

const cPromise = Cache.caching('memory', {
    max: 100,
    ttl: 10 * 1000 /*milliseconds*/,
});
app.get('/api/qr-store', async (req, res) => {
const id = req.query.id;
const cacheManager = await cPromise;
const data = await cacheManager.get(id);

if (!data) {
    return res.status(HttpStatus.NOT_FOUND).json({ error: `item not found ${id}` });
}

return res.status(HttpStatus.OK).json(data);
});

app.post('/api/qr-store', async (req, res) => {
    console.log("Anfrage geht rein")
    const body = req.body;
    const uuid = uuidv4();
    const cacheManager = await cPromise;

    console.log(cacheManager);

    await cacheManager.set(uuid, body, { ttl: 3600 });

    const hostUrl = process.env.HOST_URL;
    const qrUrl = `${hostUrl}/api/qr-store?id=${uuid}`;

    return res.status(HttpStatus.OK).json({ qrUrl });
});

app.listen(3000, () => {
console.log('Express server is running on port 3000');

});