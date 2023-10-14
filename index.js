var express = require('express');
var app = express();
var port = process.env.PORT||3000;

app.use(express.static(__dirname + '/demo'));
app.get('/hydra/js', (req,res)=>{
    res.type('js');
    res.end(require('fs').readFileSync('./hydra.js'))
});
app.get('/hydra/css', (req,res)=>{
    res.type('css');
    res.end(require('fs').readFileSync('./hydra.css'))
});

app.listen(port, ()=>{
    console.log("App listening on port " + port);
});