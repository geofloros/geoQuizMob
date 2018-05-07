//This is the server side code responsible for the following: 1)get the POI data from the web question app and posting it to postgres, serve them to the mobile app, and get the 
//user's answers and save them in the database. It is based and adapted from Ellul, 2018: 
// express is the server that forms part of the nodejs program
var express = require('express');
var path = require("path");
var app = express();
var fs = require('fs');
var pg = require('pg');


// add an http server to serve files to the Edge browser 
// due to certificate issues it rejects the https files if they are not
// directly called in a typed URL
var http = require('http');
var httpServer = http.createServer(app); 
httpServer.listen(4480);


// adding functionality to allow cross-domain queries when PhoneGap is running a server
app.use(function(req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
	res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	next();
});

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// adding functionality to log the requests
app.use(function (req, res, next) {
	var filename = path.basename(req.url);
	var extension = path.extname(filename);
	console.log("The file " + filename + " was requested.");
	next();
});
app.get('/',function (req,res) {
	res.send("hello world from the HTTP server");
});

// read in the file and force it to be a string by adding “” at the beginning
var configtext = "" + fs.readFileSync("/home/studentuser/certs/postGISConnection.js");
// now convert the configruation file into the correct format -i.e. a name/value pair array
var configarray = configtext.split(",");
var config = {};

for (var i = 0; i < configarray.length; i++) {
  var split = configarray[i].split(':');
  config[split[0].trim()] = split[1].trim();
}	

//Connecting to PostgreSQL
var pool = new pg.Pool(config);
//pool.connect();
app.get('/postgistest', function (req,res) {
	pool.connect(function(err,client,done) {
		console.log('File: /postgistest');
       		if(err){
           		console.log("not able to get connection "+ err);
           		res.status(400).send(err);
			}
       		client.query('SELECT location FROM formdata', function(err,result) {
          	done();
           	if(err){
               console.log(err);
               res.status(400).send(err);
           	}
           	res.status(200).send(result.rows);
       	});
	   }); 
});
//This is how to get the points from the database to the mobile app
app.get('/getPOI', function (req,res) {
	pool.connect(function(err,client,done) {
		console.log('File: /getPOI');
       		if(err){
           		console.log("not able to get connection "+ err);
           		res.status(400).send(err);
			}
		var querystring = "SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.location)::json As geometry, row_to_json((SELECT l FROM (SELECT question,optiona, optionb, optionc, optiond, solution) As l)) As properties FROM formdata As lg limit 100) As f;";
		console.log(querystring);
		client.query(querystring,function(err,result){
        done();
        if(err){
           console.log(err);
            res.status(400).send(err);
           	}
        res.status(200).send(result.rows);
       	});
	  }); 
});
//This is how to upload the form of the web question app
app.post('/upload',function(req,res){
       // note that we are using POST here as we are uploading data
       // so the parameters form part of the BODY of the request rather than the
      console.dir(req.body);
      res.send(req.body);
    
       const client = new pg.Client(config);
	
	client.connect((err)=>{
             if(!err){
		  		  
		  var querystring = "Insert into formdata (question,optiona,optionb,optionc,optiond,solution,location) values ('" + req.body.question + "','" + req.body.optionA + "','" + req.body.optionB + "','"+ req.body.optionC +"', '"+ req.body.optionD +"', '"+ req.body.solution +"'," +"st_geomfromtext('POINT("+req.body.longitude+" "+req.body.latitude+")', 4326))";
		  console.log(querystring);

	
		client.query(querystring, (err,result)=>{
			console.log('inside query');
			if(err){
				console.log(err);
				res.status(400).send(err);
			}else{
				console.log('results have been sent');
			}
		});	
	}})
});

//this is how to store the answers given in the mobile app to the database
app.post('/location', function(req,res){
	console.dir(req.body);
	res.send(req.body);
	//console.log(req.body);

	 const client = new pg.Client(config);
	
	client.connect((err)=>{
             if(!err){
		  		  
		  var querystring = "Insert into answers (id,correct,user_answer) values ('" + req.body.info + "','" + req.body.solution + "','" + req.body.answer + "')";
		  console.log(querystring);

	
		client.query(querystring, (err,result)=>{
			console.log('inside query');
			if(err){
				console.log(err);
				res.status(400).send(err);
			}else{
				console.log('results have been sent');
			}
		});	
	}})
});

	// the / indicates the path that you type into the server - in this case, what happens when you type in:  http://developer.cege.ucl.ac.uk:32560/xxxxx/xxxxx
app.get('/:name1', function (req, res) {
  // run some server-side code
  // the console is the command line of your server - you will see the console.log values in the terminal window
console.log('request '+req.params.name1);

  // the res is the response that the server sends back to the browser - you will see this text in your browser window
res.sendFile(__dirname + '/'+req.params.name1);
});


  // the / indicates the path that you type into the server - in this case, what happens when you type in:  http://developer.cege.ucl.ac.uk:32560/xxxxx/xxxxx
app.get('/:name1/:name2', function (req, res) {
  // run some server-side code
  // the console is the command line of your server - you will see the console.log values in the terminal window
console.log('request '+req.params.name1+"/"+req.params.name2);

  // the res is the response that the server sends back to the browser - you will see this text in your browser window
res.sendFile(__dirname + '/'+req.params.name1+'/'+req.params.name2);
});


	// the / indicates the path that you type into the server - in this case, what happens when you type in:  http://developer.cege.ucl.ac.uk:32560/xxxxx/xxxxx/xxxx
app.get('/:name1/:name2/:name3', function (req, res) {
		// run some server-side code
		// the console is the command line of your server - you will see the console.log values in the terminal window
console.log('request '+req.params.name1+"/"+req.params.name2+"/"+req.params.name3); 
		// send the response
res.sendFile(__dirname + '/'+req.params.name1+'/'+req.params.name2+ '/'+req.params.name3);
});
  // the / indicates the path that you type into the server - in this case, what happens when you type in:  http://developer.cege.ucl.ac.uk:32560/xxxxx/xxxxx/xxxx
app.get('/:name1/:name2/:name3/:name4', function (req, res) {
  // run some server-side code
  // the console is the command line of your server - you will see the console.log values in the terminal window
console.log('request '+req.params.name1+"/"+req.params.name2+"/"+req.params.name3+"/"+req.params.name4); 
  // send the response
res.sendFile(__dirname + '/'+req.params.name1+'/'+req.params.name2+ '/'+req.params.name3+"/"+req.params.name4);
});
