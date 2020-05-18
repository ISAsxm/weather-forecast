/** ***************************************
 *          DATA CONTROLLER MODULE
 *************************************** */ 

var DataController = (function() {

    let getLocationApi = async function (city_sought) 
    {
        const URL = `https://api-adresse.data.gouv.fr/search/?q=${city_sought}&type=municipality&limit=1&autocomplete=1`;
        // const PROXY_URL = "https://cors-anywhere.herokuapp.com/";
        
        try
        {

            // let response = await fetch(PROXY_URL + URL);
            let response = await fetch(URL);

            if(response.ok) {
                return await response.json();
            } else {
                console.error("Erreur", response.status);
            }

        }catch(err)
        {
            console.error("Erreur réseau", err);
        }
    };


    let getWeatherApi = async function(city)
    {

        const BASE_URL = 'https://api.weatherbit.io/v2.0/forecast/daily?';
        const API_KEY = '6466c33d606b43a9ac49907c65f8810b';

        const URL = `${BASE_URL}${city}&key=${API_KEY}`;

        try
        {
            let response = await fetch(URL);

            if(response.ok) {
                return await response.json();
            } else {
                console.error("Erreur", response.status);
            }
            
        }catch(err)
        {
            console.error("Erreur réseau", err);
        }
    };


    return {

        getWeatherForecast: function(city) {

            return getWeatherApi(city);
        },

        getLocation: function(city_sought) {

            return getLocationApi(city_sought);
        },

    };

})(); 


/** ***************************************
 *          UI CONTROLLER MODULE
 *************************************** */ 
var UIController = (function() {


    // object pour stocker les références des éléments cible du DOM
    const DOMStrings = {
        
        inputSearch: '.search__input',
        btnSearch: '.search__btn',
        cityLabel: '#city_label',
        dayLabel: '#day_label',
        dateLabel: '#date_label',
        windLabel: '#wind_label',
        humidityLabel: '#humidity_label',
        tempMinLabel: '#min_temp',
        tempMaxLabel: '#max_temp',
        iconPrincipal: '.card__icon--principal',
        descriptionLabel: '#code_label',
        degreesLabel: '#degrees_label',
        smallCardContainer: '.card--s',
    };

    // function publique pour accéder au code en dehors de mon controller
    return {
    // function publique qui permet d'accéder aux éléments DOM cibles enregistrés dans l'object DOMStrings
        getDOMStrings: function() 
        {
            return DOMStrings;
        },

        displayData: function(data) 
        {
            var html, newHtml, element;

            // insérer les données dans les petites cartes

            // récupérer le container
            element = DOMStrings.smallCardContainer;
            // effacer les cards placeholders
            document.querySelector(element).innerHTML = "";
            // créer mon template
            html = '<div class="card__small"><p class="card__small__text">%TUE%</p><svg class="card__small__icon icon-sun"><use xlink:href="img/sprite.svg#%icon-sun%"></use></svg><p class="card__small__text card__small__text--unit">%9%</p></div>';
            
            
            for (let i = 0; i < data.smallDayName.length; i++) {

                // remplacer les placeholder par les données
                newHtml = html.replace('%TUE%', data.smallDayName[i]);
                newHtml = newHtml.replace('%icon-sun%', data.smallIcon[i]);
                newHtml = newHtml.replace('%9%',data.smallDegrees[i]);
                
                // insérer le html dans le DOM
                document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
            }

            // insérer les données dans la carte principale
            document.querySelector(DOMStrings.cityLabel).innerText = data.cityLabel;
            document.querySelector(DOMStrings.dateLabel).innerText = data.dateLabel;
            document.querySelector(DOMStrings.descriptionLabel).innerText = data.descriptionLabel;
            document.querySelector(DOMStrings.humidityLabel).innerText = data.humidityLabel;
            document.querySelector(DOMStrings.windLabel).innerText = data.windLabel;
            document.querySelector(DOMStrings.degreesLabel).innerText = data.degreesLabel;
            document.querySelector(DOMStrings.dayLabel).innerText = data.dayName;
            document.querySelector(DOMStrings.tempMinLabel).innerText = data.tempMinLabel;
            document.querySelector(DOMStrings.tempMaxLabel).innerText = data.tempMaxLabel;
            document.querySelector(DOMStrings.iconPrincipal).innerHTML = `<use xlink:href="img/sprite.svg#${data.icon}"></use>`;
        },

        formatDayName: function(date) {

            const D = new Date(date);
            const DAY_INDEX = D.getDay();
            const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const DAY_NAME = DAYS[DAY_INDEX];

            return DAY_NAME;
        },

        formatDate: function(date) {

            // input format == YYYY-MM-DD
            let d = date.split("-");
            let newFormat = `${d[2]}/${d[1]}/${d[0].substr(2)}`;
            // output format == DD/MM/YY
            return newFormat;
        },

        formatIcon: function(code) {


            if (code >= 200 && code <= 299) {
                icon = 'icon-lightning';
            } else if (code >= 300 && code <= 399) {
                icon = 'icon-rainy';
            } else if (code >= 500 && code <= 599) {
                icon = 'icon-rainy1';
            } else if (code >= 600 && code <= 699) {
                icon = 'icon-snowy';
            } else if (code >= 700 && code <= 799) {
                icon = 'icon-weather1';
            } else if (code >= 801 && code <= 899) {
                icon = 'icon-cloudy';
            } else {
                icon= 'icon-sun';
            }

            return icon;
        },

    };

})();

/** ***************************************
 *          APP CONTROLLER MODULE
 *************************************** */ 

var appController = (function(dataCtrl, UICtrl) {

    // pour récupérer les éléments du DOM
    const DOM = UICtrl.getDOMStrings();

    // pour gérér les événements
    var setupEventListeners = function() {

        
        const BTN = document.querySelector(DOM.btnSearch);
        let city_sought;

        // city_sought = document.querySelector(DOM.inputSearch).value;

        city_sought = "69100";

        BTN.addEventListener('click', function() 
        {

            dataCtrl.getLocation(city_sought).then(function(response)
            {
                let lat, lon, city;
        
                lat = response.features[0].geometry.coordinates[1];
                lon = response.features[0].geometry.coordinates[0];

                return city = `&lat=${lat}&lon=${lon}`;
        
            }).then(function(city)
            {
        
                dataCtrl.getWeatherForecast(city).then(function(response)
                {

                    let data = {
                                cityLabel: response.city_name,
                                degreesLabel: Math.floor(response.data[0].temp),
                                descriptionLabel: response.data[0].weather.description,
                                humidityLabel: Math.floor(response.data[0].rh),
                                windLabel: Math.floor(response.data[0].wind_spd * 18 / 5),
                                dateLabel: UICtrl.formatDate(response.data[0].valid_date),
                                dayName: UICtrl.formatDayName(response.data[0].valid_date),
                                tempMinLabel: Math.floor(response.data[0].min_temp),
                                tempMaxLabel: Math.floor(response.data[0].max_temp),
                                smallDayName: [],
                                smallDegrees: [],
                                smallIcon: [],
                                icon: UICtrl.formatIcon(response.data[0].weather.code),
                            };

                    for (let i = 1; i < 7; i++ ) {

                        data.smallDayName.push(UICtrl.formatDayName(response.data[i].valid_date));
                        data.smallDegrees.push(Math.floor(response.data[i].temp));
                        data.smallIcon.push(UICtrl.formatIcon(response.data[i].weather.code));
                    }

                    UICtrl.displayData(data);
                })
            })
         });
     };
    

    // function publique pour activer le code en dehors de mon controller
    return {

        init: function() {

            setupEventListeners();
        }
    }

})(DataController, UIController);

// appel à la function init pour rendre le code opérationel
appController.init();
