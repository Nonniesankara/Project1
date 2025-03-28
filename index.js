// API Key
const API_KEY = "2c5c1f0c423e6dd90f62fb3db96696cc";
let currentUnit = "metric"; // Default to Celsius

// DOM Elements
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const celsiusBtn = document.getElementById("celsius-btn");
const fahrenheitBtn = document.getElementById("fahrenheit-btn");
const currentWeatherCard = document.getElementById("current-weather");
const errorMessage = document.getElementById("error-message");
const forecastTitle = document.getElementById("forecast-title");
const forecastContainer = document.getElementById("forecast-container");

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    // Default to Nairobi weather on load
    fetchWeather("Nairobi");
});

searchBtn.addEventListener("click", () => {
    const city = searchInput.value.trim();
    if (city) {
        fetchWeather(city);
    }
});

searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const city = searchInput.value.trim();
        if (city) {
            fetchWeather(city);
        }
    }
});

celsiusBtn.addEventListener("click", () => {
    if (currentUnit !== "metric") {
        currentUnit = "metric";
        celsiusBtn.classList.add("active");
        fahrenheitBtn.classList.remove("active");
        const city = document.getElementById("city-name").textContent;
        if (city) {
            fetchWeather(city);
        }
    }
});

fahrenheitBtn.addEventListener("click", () => {
    if (currentUnit !== "imperial") {
        currentUnit = "imperial";
        fahrenheitBtn.classList.add("active");
        celsiusBtn.classList.remove("active");
        const city = document.getElementById("city-name").textContent;
        if (city) {
            fetchWeather(city);
        }
    }
});

// Functions
async function fetchWeather(city) {
    try {
        // Fetch current weather
        const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${currentUnit}&appid=${API_KEY}`
        );
        
        if (!currentResponse.ok) {
            throw new Error("City not found");
        }
        
        const currentData = await currentResponse.json();
        
        // Fetch forecast
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${currentUnit}&appid=${API_KEY}`
        );
        const forecastData = await forecastResponse.json();
        
        displayCurrentWeather(currentData);
        displayForecast(forecastData);
        
        // Hide error message if shown
        errorMessage.style.display = "none";
        currentWeatherCard.style.display = "block";
        forecastTitle.style.display = "block";
    } catch (error) {
        console.error("Error fetching weather data:", error);
        currentWeatherCard.style.display = "none";
        forecastTitle.style.display = "none";
        forecastContainer.innerHTML = "";
        errorMessage.style.display = "block";
    }
}

function displayCurrentWeather(data) {
    document.getElementById("city-name").textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById("weather-description").textContent = data.weather[0].description;
    document.getElementById("current-temp").textContent = `${Math.round(data.main.temp)}°${currentUnit === "metric" ? "C" : "F"}`;
    document.getElementById("feels-like").textContent = `${Math.round(data.main.feels_like)}°${currentUnit === "metric" ? "C" : "F"}`;
    document.getElementById("humidity").textContent = `${data.main.humidity}%`;
    document.getElementById("wind-speed").textContent = currentUnit === "metric" 
        ? `${data.wind.speed} km/h` 
        : `${data.wind.speed} mph`;
    document.getElementById("pressure").textContent = `${data.main.pressure} hPa`;
    
    const iconCode = data.weather[0].icon;
    document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    document.getElementById("weather-icon").alt = data.weather[0].main;
}

function displayForecast(data) {
    forecastContainer.innerHTML = "";
    
    // Filter to get one forecast per day (every 24 hours)
    const dailyForecasts = [];
    const daysAdded = new Set();
    
    for (const forecast of data.list) {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString("en-UK", { weekday: "short" });
        
        if (!daysAdded.has(day)) {
            daysAdded.add(day);
            dailyForecasts.push({
                day,
                temp: Math.round(forecast.main.temp),
                icon: forecast.weather[0].icon,
                description: forecast.weather[0].main
            });
            
            if (dailyForecasts.length === 5) break;
        }
    }
    
    dailyForecasts.forEach(forecast => {
        const forecastItem = document.createElement("div");
        forecastItem.className = "forecast-item";
        forecastItem.innerHTML = `
            <div class="forecast-day">${forecast.day}</div>
            <img class="forecast-icon" src="https://openweathermap.org/img/wn/${forecast.icon}.png" alt="${forecast.description}">
            <div>${forecast.temp}°${currentUnit === "metric" ? "C" : "F"}</div>
        `;
        forecastContainer.appendChild(forecastItem);
    });
}