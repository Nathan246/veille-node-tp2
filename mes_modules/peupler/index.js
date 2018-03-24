"use strict";

// Le fichier index.js utilise le module tableaux.js

const tableau = require('./tableaux')
const util = require('util')

const longTabNom = tableau.nom.length
const longTabPrenom = tableau.prenom.length
const longTabDomaine = tableau.domaine.length
const longTabVille = tableau.ville.length
const longTabInterets = tableau.interets.length
const genere_telephone = ()=> {
  let sTel = ''
  for (let k=0 ; k<10 ; k++)
  {
    if (k== 3 || k == 6) {sTel += '-'}
    if (k== 0){
      sTel += Math.floor(Math.random()*9)+1  
    }
    else{
      sTel += Math.floor(Math.random()*10)
    }  
    }
  return sTel
  }
/////////////////////////////////////////////////////////
/*
const genere_courriel = () => {
  let gauche = 
}

*/

const peupler_json = ()=> {

   let tabMembre = []
   let nom 
   let prenom
   let domaine
   let ville
   let interets
   for (let k=0 ; k <20; k++)
   {
     nom = tableau.nom[Math.floor(Math.random()*longTabNom)]
     prenom = tableau.prenom[Math.floor(Math.random()*longTabPrenom)]
     domaine =  tableau.domaine[Math.floor(Math.random()*longTabDomaine)]
     ville = tableau.ville[Math.floor(Math.random()*longTabVille)]
     interets = tableau.interets[Math.floor(Math.random()*longTabInterets)]
     tabMembre[k] =
     {
       "nom" :  nom,
       "prenom" :  prenom,
       "telephone" : genere_telephone(),
       "courriel" :  prenom.charAt(0).toLowerCase() + nom.toLowerCase() + '@' + domaine,
       "ville" : ville,
       "interets" : interets
     }
   }
// console.log(util.inspect(tabMembre))
  return tabMembre
}


// on exporte la fonction peupler_json
module.exports = peupler_json;