// adresse de la doc de l'api weather forecast https://www.climacell.co/weather-api/docs/
// adresse la doc de l'api rechercher par adresse https://geo.api.gouv.fr/adresse
// descriptif de l'application : appli destinée à afficher les prévisions météo sur une période de jour actuel +6 jours, soit en utilisant la géolocalisation, soit en utilisant un moteur de recherche par ville (uniquement valable pour les villes française et drom)

// ui/ux : spinner lors du load des datas
var spinner = document.getElementById("spinner");
spinner.style.display="none";
// ui/ux : faire apparaître le container forecast seulement lorsqu'il reçoit les données
var containerForecast = document.getElementById('container-forecast');
// containerForecast.style.visibility="hidden";

// ---------------------------------------------------
// ------------------- fonctions ---------------------
// ---------------------------------------------------

// fonction de décodage des htmlEntities pour pouvoir les afficher dans le navigateur
function decodeHTML(html) 
{
	var text = document.createElement("textarea");
	text.innerHTML = html;
	return text.value;
}


// fonction permettant de sécuriser les inputs (équivalent du htmlspecialchars)
function escapeHtml(text) 
{
    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) 
    { 
        return map[m]; 
    });
}


// fonction pour effacer les données si déjà chargées, dans le cas ou le user souhaite faire une autre recherche (utiliser également avec le bouton reset)
function eraseDatas() 
{
    var elDates = document.getElementById('dates');
    var elIcons = document.getElementById('icons');
    var elTemperaturesMin = document.getElementById('temperaturesMin');
    var elTemperaturesMax = document.getElementById('temperaturesMax');
    var elCityName = document.getElementById('show-city-name');

    elDates.innerHTML = " ";
    elIcons.innerHTML = " ";
    elTemperaturesMin.innerHTML = " ";
    elTemperaturesMax.innerHTML = " ";
    elCityName.innerText = "Entrez le nom de votre ville ou son code postal, ou utilisez la géolocalistaion pour afficher les prévisions météorologiques sur 7 jours";

    containerForecast.style.visibility="hidden";
}


// fonction permettant de calculer la date actuelle et d'ajouter un nombres de jours en paramètres
Date.prototype.addDays = function(days) 
{
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);

    return date;
}
// pour ajouter 6 jours à la date actuelle et convertir le tout en format iso-8601 (format supporté par l'api)
var date = new Date();
var duration = date.addDays(6).toISOString();
// console.log(date.toLocaleDateString());


// fonction permettant d'afficher les prévisions météo selon un emplacement et une période (prend en paramètre la latitude, la longitude et la période), fait appel a l'api climacell
function weatherByPlaceForecast(lat, lon, duration)
{
    // pour afficher le spinner
    spinner.style.display="block";

    var data = "";
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.addEventListener("readystatechange", function() 
    {
    if(this.readyState === 4) {
        // pour cacher le spinner
        spinner.style.display="none";
        // pour faire apparaître le container forecast
        containerForecast.style.visibility="initial";

        var responses = JSON.parse(this.responseText);
        responses.forEach(function(response) 
        {
            // pour afficher les dates
            var datesElt = document.getElementById("dates");
            var dateElt = document.createElement("li");
            dateElt.textContent = response.observation_time.value;
            datesElt.appendChild(dateElt);

            // pour afficher les températures Min
            var temperaturesMinElt = document.getElementById("temperaturesMin");
            var tempMinElt = document.createElement("li");
            tempMinElt.textContent = " Température prévisionnelle min " + Math.round(response.temp[0].min.value) + ' ' + response.temp[0].min.units +"°";
            temperaturesMinElt.appendChild(tempMinElt);

            // pour afficher les températures Max
            var temperaturesMaxElt = document.getElementById("temperaturesMax");
            var tempMaxElt = document.createElement("li");
            tempMaxElt.textContent = " Température prévisionnelle max " + Math.round(response.temp[1].max.value) + ' ' + response.temp[1].max.units +"°";
            temperaturesMaxElt.appendChild(tempMaxElt);

            // pour afficher les icônes
            var iconsElt = document.getElementById('icons');
            var iconElt = document.createElement("li");
            var icon;
            var weather=response.weather_code.value;
            switch(weather) {
                case 'clear':
                    icon = decodeHTML('&#127774;');
                    break;
                case 'mostly_clear':
                    icon = decodeHTML('&#127780;');
                    break;
                case 'partly_cloudy':
                    icon = decodeHTML('&#9925;');
                case 'cloudy':
                    icon = decodeHTML('&#9729;');
                    break;
                case 'mostly_cloudy':
                case 'fog_light':
                case 'fog':
                    icon = decodeHTML('&#127787;');
                    break;
                case 'rain':
                case 'rain_light':
                case 'freezing_rain':
                case 'freezing_rain_light':
                case 'drizzle':
                case 'freezing_drizzle':
                case 'flurries':
                    icon = decodeHTML('&#127783;');
                    break;
                case 'rain_heavy':
                case 'freezing_rain_heavy':
                    icon = decodeHTML('&#128166;');
                    break;
                case 'tstorm':
                    icon = decodeHTML('&#9928;');
                    break;
                case 'snow_heavy':
                case 'snow':
                case 'snow_light':
                    icon = decodeHTML('&#127784;');
                    break;
                case 'ice_pellets_heavy':
                case 'ice_pellets':
                case 'ice_pellets_light':
                    icon = decodeHTML('&#10052;');
                    break;
                default:
                    icon = decodeHTML('&#127782;');
                    break;
            }
            iconElt.textContent = icon;
            iconsElt.appendChild(iconElt);
        });
    }
    
    });
    xhr.open("GET", "https://api.climacell.co/v3/weather/forecast/daily?lat="+lat+"&lon="+lon+"&start_time=now&end_time="+duration+"&unit_system=si&fields=temp,weather_code");
    xhr.setRequestHeader("apikey", "s97GKAHOKyajMLnKOzPijDzJK0BBvio0");
    xhr.setRequestHeader("content-type", "application/json");

    xhr.send(data);
}


// fonction pour obtenir la position actuelle grâce à la fonction getCurrentPosition() et du navigateur qui récupère la position du device 
//        !!!!! manque de précision lors des tests, fonction getMyCity() mises en commentaire pour l'instant !!!!!!!
function getMyPosition() 
{
    // pour faire apparaître le spinner
    spinner.style.display="block";

    var options = { 
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0 
    };

    function success(position) 
    {
        // pour cacher le spinner
        spinner.style.display="none";

        var lat = position.coords.latitude;
        var lon = position.coords.longitude;

        // pas opérationel car pas assez précis (indique Paris au lieu de Lyon...)
        // getMyCity(lat,lon);
        weatherByPlaceForecast(lat, lon, duration);
    }
    function error(error) 
    {
        console.log("Erreur de géoloc N°"+error.code+" : "+error.message);
        console.log(error);
    }

    navigator.geolocation.getCurrentPosition(success, error, options);
}


// fonction pour la transcription en geodata, appel a l'api data.gouv, permettant de trouver les géoCoordonnées à partir du nom d'une ville ou de son code postal (code postal doit être unique, ne fonctionne pas si partagé)
function getOneLocation(town)
{
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api-adresse.data.gouv.fr/search/?q="+town+"&type=municipality&limit=1&autocomplete=1", true);
    xhr.onload = function () 
    {
        var data = JSON.parse(xhr.responseText);
        var city = data.features[0].properties.city;
        var lat = data.features[0].geometry.coordinates[1];
        var lon = data.features[0].geometry.coordinates[0];

        showCityName(city);
        weatherByPlaceForecast(lat, lon, duration);
    }

    xhr.send();
}


// fonction pour afficher le nom de la ville demandée
function showCityName(city) 
{
    var containerCityName = document.getElementById('show-city-name');
    containerCityName.innerText= "Voici les prévisions météorologiques sur 7 jours pour "+city;
}


// fonction pour trouver le nom de la ville selon la position du user (clic sur géolocalisation)
function getMyCity(lat,lon) 
{
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api-adresse.data.gouv.fr/reverse/?lon="+lon+"&lat="+lat, true);
    xhr.onload = function () 
    {
        var data = JSON.parse(xhr.responseText);
        var city = data.features[0].properties.city;

        showCityName(city);
    }

    xhr.send();
}


// ----------------------------------------------------------------------------------------
// ------------------- appel des fonctions, interactions avec le user ---------------------
// ----------------------------------------------------------------------------------------

// pour appeler la fonction qui va effacer les données affichées au click sur le bouton "reinitialiser"
var buttonReset = document.getElementById("button-reset");
buttonReset.addEventListener('click', function(e)
{
    eraseDatas();
});

// pour appeler la fonction getOneLocation (qui elle-même appelle weatherByPlaceForecast()) et récupérer ainsi les valeurs de lat et lon par user action quand valeur entrée dans input "entrer le nom de la ville" et click sur bouton "afficher" et ainsi retourner les données récupérer grâce aux appels auprès des 2 api
var buttonSubmit = document.getElementById("button-submit");
buttonSubmit.addEventListener('click', function(e)
{
    e.preventDefault();
    var choiceTown = document.getElementById("town").value;
    searchTown = escapeHtml(choiceTown);
    if (searchTown) {

        eraseDatas();
        getOneLocation(searchTown);

    } else {
        alert("Veuillez saisir le nom d'une ville française");
    }
});

// pour appeler la fonction getMyPosition() (qui se sert du navigateur pour géolocaliser le device) au click sur le bouton "afficher selon ma position"
var buttonGetMyPosition = document.getElementById('getMyPosition');
buttonGetMyPosition.addEventListener('click', function(e)
{
    e.preventDefault();
    eraseDatas();
    getMyPosition();
});