const express = require('express')
const fs = require('fs')
const axios = require('axios')
const cheerio = require('cheerio')
const pdf = require('html-pdf')
const app = express()
const htm = fs.readFileSync('demo.html','utf8');
let page = cheerio.load(htm)


app.get('/airbitrage',async function(req,res){
    const stock = ['Infosys','TataSteel']
    const url = ['https://www.business-standard.com/company/infosys-2806.html','https://www.business-standard.com/company/tata-steel-566.html'];

    page = cheerio.load(htm)

    for(let u = 0;u<url.length;u++){
        try{
            let response = await axios(url[u])
            let html = response.data
            let $ = cheerio.load(html)

            let value = []

            $('.tdC').filter(function(){
                let data = $(this);
                value.push(parseFloat(data.text()));
            })

            page('.my_table').append(
                `<tr>
                    <td>${stock[u]}</td>
                    <td>${value[2]}</td>
                    <td>${value[0]}</td>
                    <td>${Math.abs(value[2]-value[0])}</td>
                </tr>`
            )
            console.log(`${stock[u]} value`,value)
        }catch(err){
            console.log(err)
        }
    }
    res.send('Data Fetched.')
}) 

app.get('/download',function(req,res){
    try{
        let options = {format:'A4',orientation:'portrait',border:'10mm'};
        pdf.create(page.html(),options).toFile('./output.pdf',function(err,resp){
            if(err) return console.log(err);
            res.download(resp.filename)
        })
    }catch(err){
        console.log(err)
    }
})

app.listen(process.env.PORT || 5000,function(){
    console.log("Work on start");
})