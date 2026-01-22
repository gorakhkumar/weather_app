const API_KEY = "78b1a5b05e1ce8111e7dfe38dbd7c0fb";

/* ---------- Date & Time ---------- */
function updateDateTime() {
  const now = new Date();
  const options = {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  };

  document.getElementById("dateText").innerText =
    now.toLocaleString("en-US", options);
}
setInterval(updateDateTime, 1000);
updateDateTime();


/* ---------- Main Weather Function ---------- */
async function getWeather(lat, lon) {

//   let url = "";

  if (lat && lon) {
    // Current location se
    url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
  } else {
    // City search se
    const city = document.getElementById("cityInput").value;
    url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`;
  }

  const res = await fetch(url);
  const data = await res.json();

  if (data.cod !== "200") {
    alert("City not found");
    return;
  }

  const current = data.list[0];

  document.getElementById("cityName").innerText =`${data.city.name}, ${data.city.country}`;
  document.getElementById("temp").innerText = Math.round(current.main.temp) + "°";
  document.getElementById("feels").innerText = Math.round(current.main.feels_like) + "°";
  document.getElementById("humidity").innerText = current.main.humidity + "%";
  document.getElementById("wind").innerText = current.wind.speed + " km/h";
  document.getElementById("rain").innerText = (current.rain?.["3h"] || 0) + " mm";

  // weather icon ke liye
  const iconCode = current.weather[0].icon;
  document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  loadHourly(data.list);
  loadDaily(data.list);
}

/* ---------- One Call API (7 Days) ---------- */
function fetchOneCall(lat, lon) {
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      updateCurrentUI(data.current);
      loadDaily7Days(data.daily);
      loadHourlyFromOneCall(data.hourly);
    });
}


// hourly ke liye
function loadHourly(list) {
  const container = document.getElementById("hourly");
  container.innerHTML = "";

  list.slice(0, 6).forEach(item => {
    const time = new Date(item.dt_txt).getHours();
    container.innerHTML += `
      <div class="flex justify-between bg-gray-800 p-2 rounded">
        <span>${time}:00</span>
        <span>${Math.round(item.main.temp)}°</span>
      </div>`;
  });
}

// daily ke liye 
function loadDaily(list) {
  const container = document.getElementById("daily");
  container.innerHTML = "";

  const days = {};
  list.forEach(item => {
    const day = item.dt_txt.split(" ")[0];
    if (!days[day]) days[day] = item;
  });

  Object.values(days).slice(0, 7).forEach(item => {
    const date = new Date(item.dt_txt);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const icon = item.weather[0].icon;

    container.innerHTML += `
      <div class="bg-gray-800 p-3 rounded-xl text-center text-sm">
        <p>${dayName}</p>
        <img src="https://openweathermap.org/img/wn/${icon}.png" class="mx-auto" />
        <p>${Math.round(item.main.temp)}°</p>
      </div>`;
  });
}



// current location weather

function detectLocation() {
  if (!navigator.geolocation) {
    alert("Location not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(position => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    getWeather(lat, lon); 
  });
}

// page ko reload karne ke liye
window.addEventListener("load", detectLocation);
