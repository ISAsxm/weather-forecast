/** ***************************************
 *          UI CONTROLLER MODULE
 *************************************** */
const DOMStrings = {
  cityLabel: "#city_label",
  dayLabel: "#day_label",
  dateLabel: "#date_label",
  windLabel: "#wind_label",
  humidityLabel: "#humidity_label",
  tempMinLabel: "#min_temp",
  tempMaxLabel: "#max_temp",
  iconPrincipal: ".card__icon--principal",
  descriptionLabel: "#code_label",
  degreesLabel: "#degrees_label",
  smallCardContainer: ".card--s",
}

const displayDataInCards = (data) => {
  // small cards
  let html, newHtml

  const smallCardBox = document.querySelector(DOMStrings.smallCardContainer)
  smallCardBox.innerHTML = ""

  html =
    '<div class="card__small"><p class="card__small__text">%TUE%</p><svg class="card__small__icon icon-sun"><use xlink:href="img/sprite.svg#%icon-sun%"></use></svg><p class="card__small__text card__small__text--unit">%9%</p></div>'

  for (let i = 0; i < data.smallDayName.length; i++) {
    newHtml = html.replace("%TUE%", data.smallDayName[i])
    newHtml = newHtml.replace("%icon-sun%", data.smallIcon[i])
    newHtml = newHtml.replace("%9%", data.smallDegrees[i])
    smallCardBox.insertAdjacentHTML("beforeend", newHtml)
  }
  // big card
  document.querySelector(DOMStrings.cityLabel).innerText = data.cityLabel
  document.querySelector(DOMStrings.dateLabel).innerText = data.dateLabel
  document.querySelector(DOMStrings.descriptionLabel).innerText =
    data.descriptionLabel
  document.querySelector(DOMStrings.humidityLabel).innerText =
    data.humidityLabel
  document.querySelector(DOMStrings.windLabel).innerText = data.windLabel
  document.querySelector(DOMStrings.degreesLabel).innerText = data.degreesLabel
  document.querySelector(DOMStrings.dayLabel).innerText = data.dayName
  document.querySelector(DOMStrings.tempMinLabel).innerText = data.tempMinLabel
  document.querySelector(DOMStrings.tempMaxLabel).innerText = data.tempMaxLabel
  document.querySelector(
    DOMStrings.iconPrincipal
  ).innerHTML = `<use xlink:href="img/sprite.svg#${data.icon}"></use>`
}

const formatDayName = (date) => {
  const D = new Date(date)
  const DAY_INDEX = D.getDay()
  //   const DAYS = [
  //     "Sunday",
  //     "Monday",
  //     "Tuesday",
  //     "Wednesday",
  //     "Thursday",
  //     "Friday",
  //     "Saturday",
  //   ]
  const DAYS = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ]
  const DAY_NAME = DAYS[DAY_INDEX]

  return DAY_NAME
}

const formatDate = (date) => {
  // input format == YYYY-MM-DD
  let d = date.split("-")
  let newFormat = `${d[2]}/${d[1]}/${d[0].substr(2)}`
  // output format == DD/MM/YY
  return newFormat
}

const formatIcon = (code) => {
  if (code >= 200 && code <= 299) {
    icon = "icon-lightning"
  } else if (code >= 300 && code <= 399) {
    icon = "icon-rainy"
  } else if (code >= 500 && code <= 599) {
    icon = "icon-rainy1"
  } else if (code >= 600 && code <= 699) {
    icon = "icon-snowy"
  } else if (code >= 700 && code <= 799) {
    icon = "icon-weather1"
  } else if (code >= 801 && code <= 899) {
    icon = "icon-cloudy"
  } else {
    icon = "icon-sun"
  }
  return icon
}

/** ***************************************
 *         CALL API CONTROLLER MODULE
 *************************************** */
const formatGeoAPiResponse = (response) => {
  lat = response.data.results[0].geometry.lat
  lon = response.data.results[0].geometry.lng
  return (city = `&lat=${lat}&lon=${lon}`)
}

const formatWeatherApiResponse = (response) => {
  let data = {
    cityLabel: response.data.city_name,
    degreesLabel: Math.floor(response.data.data[0].temp),
    descriptionLabel: response.data.data[0].weather.description,
    humidityLabel: Math.floor(response.data.data[0].rh),
    windLabel: Math.floor((response.data.data[0].wind_spd * 18) / 5),
    dateLabel: formatDate(response.data.data[0].valid_date),
    dayName: formatDayName(response.data.data[0].valid_date),
    tempMinLabel: Math.floor(response.data.data[0].min_temp),
    tempMaxLabel: Math.floor(response.data.data[0].max_temp),
    smallDayName: [],
    smallDegrees: [],
    smallIcon: [],
    icon: formatIcon(response.data.data[0].weather.code),
  }
  for (let i = 1; i < 7; i++) {
    data.smallDayName.push(formatDayName(response.data.data[i].valid_date))
    data.smallDegrees.push(Math.floor(response.data.data[i].temp))
    data.smallIcon.push(formatIcon(response.data.data[i].weather.code))
  }
  return data
}

const getCoordinatesApi = (city_sought) => {
  let BASE_URL = "https://api.opencagedata.com/geocode/v1/json?q="
  let API_KEY = "0fbafe4ad9ee4db584a1b693e7dfe3da"
  let URL = encodeURI(
    `${BASE_URL}${city_sought},France&no_annotations=1&limit=1&key=${API_KEY}`
  )
  axios
    .get(URL)
    .then((response) => {
      const coordinates = formatGeoAPiResponse(response)
      getWeatherApi(coordinates)
    })
    .catch((error) => console.log(error))
}

const getWeatherApi = (city) => {
  let BASE_URL = "https://api.weatherbit.io/v2.0/forecast/daily?"
  let API_KEY = "6466c33d606b43a9ac49907c65f8810b"
  let URL = encodeURI(`${BASE_URL}${city}&lang=fr&key=${API_KEY}`)

  axios
    .get(URL)
    .then((response) => {
      const datas = formatWeatherApiResponse(response)
      displayDataInCards(datas)
    })
    .catch((error) => console.log(error))
}

/** ***************************************
 *        EVENTS CONTROLLER MODULE
 *************************************** */
document.forms["search"].addEventListener("submit", function (e) {
  e.preventDefault()
  if (
    document.forms["search"][0].value != null ||
    document.forms["search"][0].value != ""
  ) {
    getCoordinatesApi(document.forms["search"][0].value)
  }
})
