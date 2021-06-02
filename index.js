
require("dotenv").config();
const express = require("express");
const app = express();
const axios = require('axios');
const cheerio = require('cheerio');
const sendgrid = require("@sendgrid/mail");
const url = process.env.url

sendgrid.setApiKey(process.env.apiKey);

const sendEmail = (from, to, subject, body) => {
    sendgrid
      .send({ from, to, subject, text: body })
      .then(() => {
        console.log(`Email sent from ${from} to ${to}`);
      })
      .catch((error) => {
        console.error(error);
      });
}


let previousCount = 0;


const fetchData = async (url) => {
    console.log("Fetching data...")
    let response = await axios.get(url, {
        headers: {
            "Cache-Control": "no-cache"
        }
    }).catch((err) => console.log(err));
    if(response.status !== 200){
        console.log("Error occurred while fetching data");
        return;
    }

    return response;
}

const begin = async () => {
  try{
      const data = await fetchData(url);
      const html = data.data;
      const $ = cheerio.load(html);
      const heading = $('div > .searchHeader-title > span').text();
      let count = Number(heading);
      console.log('val: ', count);
      if(count > previousCount){
          sendEmail(process.env.sender, process.env.receiver, process.env.subject, process.env.message)
          console.log('MATCH');
      }
      previousCount = count;
    }
    catch(err){
      console.log("ERROR:", err);
    }
}

app.get("/", async (req, res) => {
  setInterval(begin, 60000);
  return res.send("Everything is fine.");
})

const server = app.listen(process.env.PORT || 8080, () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log(`App listening at http://${host}:${port}`);
});

