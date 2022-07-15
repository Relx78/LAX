//Packages
const axios = require('axios').default;
const cheerio = require("cheerio");
require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const url =
  "https://www.amazon.es/HUAWEI-Smartphone-fotograf%C3%ADa-Resoluci%C3%B3n-Supercharge/dp/B09TCPSG7V";

const product = { name: "", price: "", link: "" };

//Set interval

const scrape = async () => {
    try{
  //Fetch the data
  const { data } = await axios.get(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "axios 0.21.1"
    }
  });
  
  //Load up the html
  const $ = cheerio.load(data);
  const item = $("div#dp-container");
  const handle = setInterval(scrape, 20000);
  //Extract the data that we need
  product.name = $(item).find("h1 span#productTitle").text();
  product.link = url;
  const price = $(item)
    .find("span .a-price-whole")
    .first()
    .text()
    .replace(/[,.]/g, "");
  const priceNum = parseInt(price);
  product.price = priceNum;
  //Send an SMS
  if (priceNum < 50) {
    client.messages
      .create({
        body: `The price of ${product.name} went below ${price}. Purchase it at ${product.link}`,
        from: "+19706331226",
        to: process.env.NUMBER,
      })
      .then((message) => {
        console.log(message);
        clearInterval(handle);
      });
  }
} catch (err) {
    console.log(err);
  }
}

scrape();