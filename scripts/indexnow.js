#!/usr/bin/env node
// Pings IndexNow (distributed to Bing, Yandex, Seznam, Naver...) with every URL
// listed in sitemap.xml. Run after any deploy that changes page content:
//
//   node scripts/indexnow.js
//
// Docs: https://www.indexnow.org/

const fs = require('fs');
const path = require('path');
const https = require('https');

const HOST = 'xn--b1amql.kz';
const KEY = 'b962f05c8bd1128e530b20c59f5568d5';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_PATH = path.join(__dirname, '..', 'sitemap.xml');

function readUrlsFromSitemap() {
  const xml = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];
  return matches.map((m) => m[1]);
}

function submit(urlList) {
  const body = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  });

  const req = https.request(
    {
      hostname: 'api.indexnow.org',
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
      },
    },
    (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        console.log(`IndexNow response: ${res.statusCode} ${res.statusMessage}`);
        if (data) console.log(data);
      });
    }
  );

  req.on('error', (err) => console.error('IndexNow request failed:', err.message));
  req.write(body);
  req.end();
}

const urls = readUrlsFromSitemap();
console.log(`Submitting ${urls.length} URLs to IndexNow:\n${urls.join('\n')}\n`);
submit(urls);
