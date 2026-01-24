const API_KEY = "e8fc51ff3a514fe1bed160008261101 ";

/* ===== Date & Time ===== */
function updateDateTime() {
  const now = new Date();
  document.getElementById("dateText").innerText =
    now.toLocaleString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
}
setInterval(updateDateTime, 1000);
updateDateTime();

/* ===== Main Fetch ===== */
function getWeather(city = null) {
  if (!city) {
    city = document.getElementById("cityInput").value;
  }
  if (!city) return alert("Enter city name");

  fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=7&aqi=no&alerts=no`
  )
    .then(res => res.json())
    .then(data => {
      updateCurrent(data);
      loadHourly(data);
      loadDaily(data);
    })
    .catch(() => alert("Weather fetch failed"));
}

/* ===== Current Weather ===== */
function updateCurrent(data) {
  const current = data.current;
  const location = data.location;

  document.getElementById("cityName").innerText =
    `${location.name}, ${location.country}`;

  document.getElementById("temp").innerText = Math.round(current.temp_c) + "°";
  document.getElementById("feels").innerText = Math.round(current.feelslike_c) + "°";
  document.getElementById("humidity").innerText = current.humidity + "%";
  document.getElementById("wind").innerText = current.wind_kph + " km/h";
  document.getElementById("rain").innerText = current.precip_mm + " mm";

  document.getElementById("weatherIcon").src =
    "https:" + current.condition.icon;
}

/* ===== Hourly Forecast (Real 1 hour) ===== */
function loadHourly(data) {
  const container = document.getElementById("hourly");
  container.innerHTML = "";

  const hours = data.forecast.forecastday[0].hour;
  const nowHour = new Date().getHours();

  const upcoming = hours.filter(h =>
    new Date(h.time).getHours() >= nowHour
  ).slice(0, 8);

  upcoming.forEach(h => {
    const date = new Date(h.time);
    let hour = date.getHours();
    let ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;

    let icon = h.condition.icon;
    if (!icon.startsWith("http")) {
      icon = "https:" + icon;
    }

    container.innerHTML += `
      <div class="flex justify-between bg-gray-800 p-3 rounded-lg">
    
        <span>${hour} ${ampm}</span>
        <img src="${icon}" class="w-2 h-2" style="width:26px;height:26px;" alt="icon" />
        <span>${Math.round(h.temp_c)}°</span>

      </div>`;
  });
}

/* ===== 7 Day Forecast ===== */
function loadDaily(data) {
  const container = document.getElementById("daily");
  container.innerHTML = "";

  data.forecast.forecastday.forEach(day => {
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const icon = day.day.condition.icon;

    container.innerHTML += `
      <div class="bg-gray-800 p-3 rounded-xl text-center text-sm">
        <p>${dayName}</p>
        <img src="https:${icon}" class="mx-auto" />
        <p>${Math.round(day.day.maxtemp_c)}° / ${Math.round(day.day.mintemp_c)}°</p>
      </div>`;
  });
}

/* ===== Auto Location ===== */
function detectLocation() {
  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    getWeather(`${lat},${lon}`);
  });
}

window.addEventListener("load", detectLocation);
