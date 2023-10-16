//OpenWeatherMap API key
const apiKey = "af8600a6a4cbcf9235be40524d92b839";

//Event listener for page load
window.addEventListener("load", () => {
  //On page load, display welcome message
  updateCurrentWeather("", "", "", "", "");
  hideError(); //Hide the error message on page load
});

//Function to handle weather search
function searchWeather() {
  const city = document.getElementById("cityInput").value;
  if (city) {
    fetchWeatherData(city);
    updateSearchHistory(city);
  } else {
    showError("Please enter a city name.");
  }
}

//Function to display error messages
function showError(message) {
  const errorContainer = document.getElementById("errorContainer");
  errorContainer.innerText = message;
  errorContainer.style.display = "block";

  //Hide error after display
  setTimeout(() => {
    hideError();
  }, 2000);
}

//Function to hide error message
function hideError() {
  const errorContainer = document.getElementById("errorContainer");
  errorContainer.style.display = "none";
}

//Function to fetch weather data for a city and display forecast
function fetchWeatherData(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;
  //Fetch weather forecast data from OpenWeatherMap API
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      const forecastData = parseWeatherData(data.list);
      displayFutureWeather(forecastData);

      //Use data for the first day to update current weather
      const firstDayData = forecastData[Object.keys(forecastData)[0]]; 
      updateCurrentWeather(
        firstDayData.iconCode,
        firstDayData.iconDescription,
        firstDayData.temperature,
        firstDayData.wind,
        firstDayData.humidity
      );
    })
    .catch((error) => console.error("Error fetching weather data:", error));
}

//Function to parse weather data and organize it by date
function parseWeatherData(data) {
  const forecastData = {};

  for (const entry of data) {
    const timestamp = entry.dt * 1000;
    const date = new Date(timestamp);
    const dateKey = date.toDateString();
    const weather = entry.weather[0];
    const iconCode = weather.icon;
    const iconDescription = weather.description;

    if (!forecastData[dateKey]) {
      const temperatureKelvin = entry.main.temp;
      const windKmh = entry.wind.speed;
      const humidity = entry.main.humidity;

      const temperatureFahrenheit = (
        ((temperatureKelvin - 273.15) * 9) / 5 +
        32
      ).toFixed(1);
      const windMph = (windKmh * 0.621371).toFixed(1);

      forecastData[dateKey] = {
        date,
        temperature: temperatureFahrenheit,
        wind: windMph,
        humidity,
        iconCode,
        iconDescription,
      };
    }
  }

  return forecastData;
}

//Function to display future weather forecast
function displayFutureWeather(forecastData) {
  const forecastContainer = document.getElementById("forecastContainer");
  forecastContainer.innerHTML = "";

  //Get the keys (dates) and sort them
  const sortedDates = Object.keys(forecastData)
    .sort((a, b) => new Date(a) - new Date(b))
    .slice(0, 5); //Take the first 5 dates

  for (const dateKey of sortedDates) {
    const day = forecastData[dateKey];

    const forecastCard = document.createElement("div");
    forecastCard.classList.add("forecast-card");

    const dateElement = document.createElement("h3");
    dateElement.innerText = dateKey;

    const weatherIcon = document.createElement("img");
    weatherIcon.src = `https://openweathermap.org/img/wn/${day.iconCode}.png`;
    weatherIcon.alt = "Weather Icon";

    const iconDescription = document.createElement("p");
    iconDescription.innerText = `Weather: ${day.iconDescription}`;
    iconDescription.style.marginBottom = "10px"; // Add margin to create spacing

    const temperatureElement = document.createElement("p");
    temperatureElement.innerText = `Temperature: ${day.temperature} °F`;
    temperatureElement.style.marginBottom = "10px";

    const windElement = document.createElement("p");
    windElement.innerText = `Wind: ${day.wind} mph`;
    windElement.style.marginBottom = "10px";

    const humidityElement = document.createElement("p");
    humidityElement.innerText = `Humidity: ${day.humidity}%`;
    humidityElement.style.marginBottom = "10px";

    //Add the weather description
    forecastCard.appendChild(dateElement);
    forecastCard.appendChild(weatherIcon);
    forecastCard.appendChild(iconDescription);
    forecastCard.appendChild(temperatureElement);
    forecastCard.appendChild(windElement);
    forecastCard.appendChild(humidityElement);

    forecastContainer.appendChild(forecastCard);
  }
}

//Function to update the current weather display
function updateCurrentWeather(
  iconCode,
  iconDescription,
  temperature,
  wind,
  humidity
) {
  const currentWeatherContainer = document.getElementById("weatherInfo");

  if (iconCode) {
    const weatherInfo = `
    <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="Weather Icon"> 
      Weather: ${iconDescription}
      Temperature: ${temperature} °F
      Wind: ${wind} mph
      Humidity: ${humidity}%
    `;

    currentWeatherContainer.innerHTML = weatherInfo;
  } else {
    const welcomeMessage = "Welcome! Enter a city to get the weather.";
    currentWeatherContainer.innerHTML = `<div>${welcomeMessage}</div>`;
  }
}

//Array to store search history
let searchHistory = [];
//Function to handle a weather search and update search history
function searchWeather() {
  const city = document.getElementById("cityInput").value;
  if (city) {
    fetchWeatherData(city);
    updateSearchHistory(city);
  } else {
    showError("Please enter a city name.");
  }
}

//Function to update the search history
function updateSearchHistory(city) {
  searchHistory.push(city);
  const searchHistoryList = document.getElementById("searchHistory");
  searchHistoryList.innerHTML = ""; // Clear previous entries

  for (const item of searchHistory) {
    const listItem = document.createElement("li");
    listItem.innerText = item;
    listItem.addEventListener("click", () => {
      fetchWeatherData(item);
    });
    searchHistoryList.appendChild(listItem);
  }
}

//Initial update of current weather
updateCurrentWeather("");

//Sample initial call to display forecast for default city
searchWeather();
