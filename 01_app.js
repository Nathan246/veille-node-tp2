const express = require('express');
const fs = require('fs')
const util = require("util");
const app = express();

const server = require('http').createServer(app);
const io = require('./mes_modules/chat_socket').listen(server);

const peupler = require('./mes_modules/peupler')
const bodyParser= require('body-parser')
const MongoClient = require('mongodb').MongoClient // le pilote MongoDB
const ObjectID = require('mongodb').ObjectID;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))
/* on associe le moteur de vue au module «ejs» */
const i18n = require('i18n');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(express.static('public'));

i18n.configure({ 
   locales : ['fr', 'en'],
   cookie : 'langueChoisie', 
   directory : __dirname + '/locales' 
})

app.use(i18n.init);

let db // variable qui contiendra le lien sur la BD

MongoClient.connect('mongodb://127.0.0.1:27017', (err, database) => {
 if (err) return console.log(err)
 db = database.db('carnet_adresse')

// lancement du serveur Express sur le port 8081
 server.listen(8081, (err) => {
 	if(err) console.log(err)
 console.log('connexion à la BD et on écoute sur le port 8081')
 })
})


/*
Les routes
*/

////////////////////////////////////////// Route /
app.set('view engine', 'ejs'); // générateur de template

app.get('/', function (req, res) {
      
 res.render('accueil.ejs')  
 
  });

app.get('/:local(en|fr)', function (req, res) {

	console.log(req.params.local);
	res.cookie('langueChoisie', req.params.local);
	res.setLocale(req.params.local);
	console.log(req.get('referer'));

	if(req.get('referer') == "http://localhost:8081/rechercher") {
 		res.redirect('/adresse')
 	} else {
 		res.redirect(req.get('referer'))
 	}
  });

//////////////////////////////////////////  Route Adresse
app.get('/adresse', function (req, res) {
   var cursor = db.collection('adresse')
                .find().toArray(function(err, resultat){
 if (err) return console.log(err)        
 res.render('adresse.ejs', {adresses: resultat})   
  });
})
//////////////////////////////////////////  Route Rechercher
app.post('/rechercher',  (req, res) => {
   let recherche = req.body.recherche.toLowerCase()
   let regRecherche = new RegExp(recherche, 'i')
   var match = regRecherche.exec(recherche);
	console.log("match[0] = " + match[0]); 
	console.log("match[1] = " + match[1]); 

   console.log(recherche)
   let cursor = db.collection('adresse').find({$or: [ 
                				{nom: {$regex :regRecherche, $options: "$i"}},
                			  {prenom: {$regex :regRecherche, $options: "$i"}},
                			 	{telephone: {$regex :regRecherche, $options: "$i"}},
                				{courriel: {$regex :regRecherche, $options: "$i"}}
                			]
                		}).toArray(function(err, resultat){
 if (err) return console.log(err)        
 res.render('adresse.ejs', {adresses: resultat, recherche:recherche})   
  });
})
////////////////////////////////////////// Route /ajouter
app.post('/ajouter', (req, res) => {
console.log('route /ajouter')	
 db.collection('adresse').save(req.body, (err, result) => {
 if (err) return console.log(err)	
 console.log('sauvegarder dans la BD')
 res.send(JSON.stringify(req.body));
 })
})

////////////////////////////////////////  Route /modifier
app.post('/modifier', (req, res) => {
console.log('route /modifier')
req.body._id = 	ObjectID(req.body._id)
console.log("req.body._id = " + req.body._id);
 db.collection('adresse').save(req.body, (err, result) => {
	 if (err) return console.log(err)
	 console.log('sauvegarder dans la BD')
	 res.send(JSON.stringify(req.body));
	 })
})


////////////////////////////////////////  Route /detruire
app.get('/detruire/:id', (req, res) => {
 console.log('route /detruire')
 var id = req.params.id
 console.log(id)
 db.collection('adresse').findOneAndDelete({"_id": ObjectID(req.params.id)}, (err, resultat) => {

if (err) return console.log(err)
	res.send(JSON.stringify(ObjectID(req.params.id)));
 })
})


///////////////////////////////////////////////////////////   Route /trier
app.get('/trier/:cle/:ordre', (req, res) => {

 let cle = req.params.cle
 let ordre = (req.params.ordre == 'asc' ? 1 : -1)
 let cursor = db.collection('adresse').find().sort(cle,ordre).toArray(function(err, resultat){

  ordre = (req.params.ordre == 'asc' ? 'desc' : 'asc')  
 res.render('adresse.ejs', {adresses: resultat, cle, ordre })	
})

}) 
/////////////////////////////////////////////////////////  Route /peupler
app.get('/peupler', (req, res) => {
	let collectionMembre = peupler()
	let cursor = db.collection('adresse').insertMany(collectionMembre, (err, resultat)=>{
		if(err) console.error(err)
			res.redirect('/adresse')
		})
})

/////////////////////////////////////////////////////////  Route /vider
app.get('/vider', (req, res) => {

	let cursor = db.collection('adresse').drop((err, res)=>{
		if(err) console.error(err)
			console.log('ok')
		})
	res.redirect('/adresse')
})

/////////////////////////////////////////////////////////  Route /profil
app.get('/profil/:id', function (req, res) {
	let id = req.params.id 
	let critere = ObjectID(req.params.id)
   let cursor = db.collection('adresse').find({"_id": critere}).toArray(function(err, resultat){
 if (err) return console.log(err)
 // transfert du contenu vers la vue adresses.ejs (renders)
 // affiche le contenu de la BD
 res.render('profil.ejs', {adresses: resultat})
 }) 
})

/////////////////////////////////////////////////////////  Route /chat
app.get('/chat', (req, res) => {
	res.render('socket_vue.ejs');
})