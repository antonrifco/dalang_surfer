const puppeteer = require('puppeteer');

let target_url = 'https://www.traveloka.com/hotel';
const retry = (fn, ms) => new Promise(resolve => { 
    fn()
      .then(resolve)
      .catch(() => {
        setTimeout(() => {
          console.log('retrying...');
          retry(fn, ms).then(resolve);
        }, ms);
      })
});

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 926 });
    await retry(() => page.goto(target_url), 1000);
    let hotels = [];
    
    await page.waitForSelector('button.tvat-hotelSubmitButton');
    await page.focus('input[data-id=hotelDestination]');
    await page.keyboard.type('Bandung');

    await page.waitForSelector("div.tvat-autocompleteContainer div.tvat-dropdownitem");
    await page.click('div.tvat-autocompleteContainer div.tvat-dropdownitem:nth-of-type(2)');
    await page.click('button.tvat-hotelSubmitButton');
    
    await page.waitForNavigation();
    await page.waitForSelector('div.tvat-searchListItem');

    let hotelElms = await page.$$('div.tvat-searchListItem');
    for(l = 0; l < hotelElms.length; l++){
        let hotel_element = hotelElms[l];

        let h_img = await hotel_element.$eval('img', node => node.src);
        let h_name = await hotel_element.$eval('div.tvat-hotelName', node => node.innerText);

        let h_star = '-';
        try{
            h_star = await hotel_element.$eval('meta[itemprop=ratingValue]', node => node.getAttribute('content') );
        } catch(e){}

        let h_rating = '-';
        try{
            h_rating = await hotel_element.$eval('span.tvat-ratingScore', node => node.innerText);
        } catch(e){}
        
        let h_price = '-';
        try{
            h_price = await hotel_element.$eval('div.tvat-primaryPrice', node => node.innerText);
        } catch(e){}
        hotels.push({
            name: h_name,
            h_img: h_img,
            star: h_star,
            rating: h_rating,
            price: h_price
        })
    }

    console.log(JSON.stringify(hotels, undefined, 2));
})();