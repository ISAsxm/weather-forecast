# Weather forecast app.   


## Description :  

Just a little weather forecast project to improve my front-end techniques with Sass, Js and API consuming.     
Version : 1.0.0   
Date : 2020-05-06   
Responsable : HI   
API:   
- weather data : https://www.weatherbit.io/api/weather-forecast-16-day   
- geo data : https://geo.api.gouv.fr/adresse   

---

## Implementation :   


### project init :  


$ __npm install__  

---

### dev environment :  

Run this if you don't need npm server :

$ __npm run watch:sass__   


Or this if you prefer to use the npm server  :   

***install npm live-server if you have not already done so :***
$ __npm install live-server -g__   

Then run :

$ __npm run start__  


---

### prod environment :  

$ __npm run build:css__   


***replace with these lines if you have used several .css files to concatenate them (like a font file for icons for example)***    
*(just rename the file to be concat with your file name)*    

`"compile:sass": "node-sass sass/main.scss css/style.comp.css",`     
`"concat:css": "concat -o css/style.concat.css css/icon-font.css css/style.comp.css",`   
`"prefix:css": "postcss --use autoprefixer -b 'last 10 versions' css/style.concat.css -o css/style.prefix.css",`   
`"compress:css": "node-sass css/style.prefix.css css/style.css --output-style compressed",`   
`"build:css": "npm-run-all compile:sass concat:css prefix:css compress:css"`   

---


## Technologies used :  

* HTML5,  
* Sass,  
* JavaScript,
* Npm,  
* AJAX,  
* APIs   

---