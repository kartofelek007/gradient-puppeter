const express = require('express');
const cors = require('cors');
const app = express();
const puppeteer = require('puppeteer');
const axios = require('axios');

app.use(cors())
app.use(express.json());

app.get('/', async (req, res) => {
    res.send("( ͡° ͜ʖ ͡°)");
});

//get json post
app.post('/', async (req, res) => {
    if (req.body && req.body.gradients) {
        const data = req.body;

        if (!data.recaptchaToken) {
            res.sendStatus(404);
            return false;
        }

        const secretKey = '6Lep9T4nAAAAAGU-PvJqA8NDWtn0FHusnijWTSXA';
        const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${data.recaptchaToken}`;

        try {
            const request = await axios.get(url);
            const requestData = await request.data;
            if (!requestData.success) {
                res.sendStatus(404);
                return false;
            }
        } catch (err) {
            res.sendStatus(404);
            return false;
        }

        const browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium',
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.goto(`file://${__dirname}/server.html`, {waitUntil: 'domcontentloaded'});
        
        let devicePixelRatio = data.devicePixelRatio || 1;
        let width = parseInt(data.width) || 1024;
        let height = parseInt(data.height) || 768;

        await page.setViewport({
            width: width,
            height: height,
            deviceScaleFactor: devicePixelRatio,
            devicePixelRatio: devicePixelRatio
        });

        await page.evaluate((insertData) => {
            injectGradientIntoHTML(insertData);
        }, data);

        const screen = await page.screenshot({
            fullPage: true,
            //path: `${__dirname}/scrapingbee_homepage.png`,
            omitBackground: true,
        });

        await browser.close();
        const img = Buffer.from(screen, 'base64');
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': img.length
        });
        res.end(img);
        return;
    }

    res.sendStatus(404);
});

app.listen(3000, () => console.log(`Started server at http://localhost:3000`));