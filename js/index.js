const addSections = function () {
  let html = ` 
    <section class="p-4 d-flex flex-wrap vh-100 w-100">
        <div class="h-100 workout-section col-12 col-lg-4 py-5 px-5 text-center overflow-auto"
            style="background-color: #2d3439;">
            <img src="images/logo.png" alt="" width="140px" style="margin-bottom: 20px;">
            <form class="form hidden d-flex flex-column gap-3" action="">
                <div class="d-flex align-items-center w-100 justify-content-center">
                    <label class="col-3 " for="" style="color: white; text-align: left;">Type</label>
                    <select class="options col-3" name="" id="">
                        <option value="running">Running</option>
                        <option value="cycling">Cycling</option>
                    </select>
                    <label class="col-3" for="" style="color: white;">Distance</label>
                    <input required class="distance col-3" type="number" placeholder="Km">
                </div>
                <div class="d-flex align-items-center w-100 justify-content-center">
                    <label class="col-3" for="" style="color: white;text-align: left;">Duration</label>
                    <input required class="duration col-3" type="number" placeholder="min">
                    <label class="col-3 sc-label" for="" style="color: white;">Steps</label>
                    <input required class="col-3 sc-value" type="number" placeholder="step/min">
                    <input type="submit" value="" style="width: 0px; padding: 0px;">
                </div>
            </form>
            <section class="workout-container">
            </section>
        </div>
        <div class="map col-12 col-lg-8 flex-grow-1" id="map" style="height: 100%;">
    </section>
    </div>`;

  document.body.insertAdjacentHTML("afterbegin", html);
};

addSections();

let form = document.querySelector(".form");
let workoutContainer = document.querySelector(".workout-container");
let workoutBox = document.querySelector(".workout-container");
let options = document.querySelector(".options");
let scText = document.querySelector(".sc-label");
let inputDistance = document.querySelector(".distance");
let inputDuration = document.querySelector(".duration");
let inputsc = document.querySelector(".sc-value");

// get date
let getMonth = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// workout classes
class Workout {
  id = Math.trunc(Math.random(0) * 999999);
  date =
    String(getMonth[new Date().getMonth()]) +
    " " +
    String(new Date().getDate());

  constructor(position, distance, duration, type) {
    this.position = position;
    this.distance = distance;
    this.duration = duration;
    this.type = type;
  }
}

class Running extends Workout {
  constructor(position, distance, duration, type) {
    super(position, distance, duration, type);
  }
}

class Cycling extends Workout {
  constructor(position, distance, duration, type) {
    super(position, distance, duration, type);
  }
}

// app class and operations
class App {
  #map;
  #mapPosition = [];
  #workout = [];

  constructor() {
    this.#workout.forEach((e) => this._showSavedMarker(e));
    this._getWorkouts();
    this._showMap();
    this._showWorkout();
    options.addEventListener("change", this._toggleType);
    form.addEventListener("submit", this._workout);
    workoutBox.addEventListener("click", this._moveTo);
  }

  // show map
  _showMap() {
    navigator.geolocation.getCurrentPosition(this._getPosition.bind(this));
  }

  // get position
  _getPosition(position) {
    let { latitude, longitude } = position.coords;
    this.#map = L.map("map").setView([latitude, longitude], 13);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on("click", this._showForm.bind(this));
  }

  // show form
  _showForm(position) {
    let { lat, lng } = position.latlng;
    this.#mapPosition = [lat, lng];
    inputDistance.focus();
    form.style.height = `96px`;
    form.classList.remove("hidden");
  }

  // toggle type of workout
  _toggleType() {
    if (this.value === "running") {
      scText.textContent = "Steps";
      inputsc.attributes.placeholder.value = "step/min";
    } else if (this.value === "cycling") {
      scText.textContent = "Elev Gain";
      inputsc.attributes.placeholder.value = "meters";
    }
  }

  // submit form & add workout
  _workout(form) {
    form.preventDefault();
    if (
      inputDistance.value <= 0 ||
      inputDuration.value <= 0 ||
      inputsc.value <= 0
    ) {
      alert("please insert positive number");
    } else {
      form.target.classList.add("hidden");
      let workout;
      if (options.value === "cycling") {
        workout = new Cycling(
          [app.#mapPosition[0], app.#mapPosition[1]],
          Number(inputDistance.value),
          Number(inputDuration.value),
          options.value
        );
      } else {
        workout = new Running(
          [app.#mapPosition[0], app.#mapPosition[1]],
          Number(inputDistance.value),
          Number(inputDuration.value),
          options.value
        );
      }
      app.#workout.push(workout);
      app._showMarker();
      app._showWorkout(app.#workout);
      app._saveWorkouts();
    }
  }

  // show marker
  _showMarker() {
    L.marker([app.#mapPosition[0], app.#mapPosition[1]])
      .addTo(app.#map)
      .bindPopup(
        L.popup({
          autoClose: false,
          closeOnClick: false,
          className: `leaflet-popup-content-wrapper ${options.value}`,
        })
      )
      .setPopupContent(
        `${options.value === "cycling" ? "🚴" : "🏃‍♂️"}${
          String(options.value)[0].toUpperCase() +
          String(options.value).slice(1)
        } on ${getMonth[new Date().getMonth()]} ${new Date().getDate()}`
      )
      .openPopup();
  }

  // show workout content
  _showWorkout(workout) {
    if (workout === undefined) {
      return;
    } else {
      workoutContainer.innerHTML = "";
      workout.forEach(function (e) {
        let workoutType = `<div class="workout ${
          e.type
        } d-flex flex-column gap-4 align-items-start" data-lat="${
          e.position[0]
        }" data-lng="${e.position[1]}">
                <h3>${
                  String(e.type)[0].toUpperCase() + String(e.type).slice(1)
                } on  ${e.date}</h3>
                <div class="d-flex align-items-start align-items-sm-center flex-column flex-sm-row w-100">
                    <div class="d-flex gap-1 col-3 align-items-baseline">
                        <p style="font-size: 18px;">${
                          e.type === "cycling" ? "🚴" : "🏃‍♂️"
                        }</p>
                        <p>${Number(e.distance)}</p>
                        <p style="font-weight: 100; font-size: 10px;">KM</p>
                    </div>
                    <div class="d-flex gap-1 col-3 align-items-baseline">
                        <p style="font-size: 18px;">🕔</p>
                        <p>${Number(e.duration)}</p>
                        <p style="font-weight: 100; font-size: 10px;">MIN</p>
                    </div>
                    <div class="d-flex gap-1 col-3 align-items-baseline">
                        <p style="font-size: 18px;">⚡</p>
                        <p>${Number(
                          Math.trunc(Math.abs(e.distance / e.duration) * 60)
                        )}</p>
                        <p style="font-weight: 100; font-size: 10px;">KM/H</p>
                    </div>
                    <div class="d-flex gap-1 col-3 align-items-baseline">
                        <p style="font-size: 18px;">${
                          e.type === "cycling" ? "🗻" : "🦶"
                        }</p>
                        <p>${inputsc.value}</p>
                        <p style="font-weight: 100; font-size: 10px;">${
                          e.type === "cycling" ? "M" : "SPM"
                        }</p>
                    </div>
                </div>
            </div>`;
        inputDuration.value = inputDistance.value = inputsc.value = "";
        workoutContainer.insertAdjacentHTML("afterbegin", workoutType);
      });
    }
  }

  // move to marker
  _moveTo(e) {
    let box = e.target.closest(".workout");
    app.#map.setView([box.dataset.lat, box.dataset.lng], 13, {
      animate: true,
      pan: 1,
    });
  }

  // show saved marker
  _showSavedMarker(e) {
    L.marker([e.position[0], e.position[1]])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          autoClose: false,
          closeOnClick: false,
          className: `leaflet-popup-content-wrapper ${e.type}`,
        })
      )
      .setPopupContent(
        `${e.type === "cycling" ? "🚴" : "🏃‍♂️"}${
          String(e.type)[0].toUpperCase() + String(e.type).slice(1)
        } on ${e.date}`
      )
      .openPopup();
  }

  // storage workouts
  _saveWorkouts() {
    localStorage.setItem("workouts", JSON.stringify(this.#workout));
  }

  // get workouts from locale storage
  _getWorkouts() {
    let data = JSON.parse(localStorage.getItem("workouts"));

    if (!data) {
      return;
    } else {
      data.forEach((e) => this.#workout.push(e));
      this._showWorkout(this.#workout);
    }
  }
}

const app = new App();
