let map, driverMarker, routeLine;
let pickupCoords = [26.511033215194615, 80.24687682883604];
let dropoffCoords = [26.473499195676375, 80.35282512883602];
let showingPriority = false;
let currentRide = null;
let currentRideIndex = 0;

const rides = [
  {
    priority: false,
    fare: "₹138.39",
    pickup: "Hall of Residence 14, G66W+8PH, Near IIT Kanpur, Kalyanpur, Kanpur, Uttar Pradesh 208017",
    dropoff: "Z Square Mall, Mall Rd, Downtown, Kanpur, Uttar Pradesh 208001",
    pickupCoords: [26.511052416556655, 80.24688755767203],
    dropoffCoords: [26.47363172825254, 80.3526459430123],
    time: "27 mins",
    distance: "14.5 km"
  },
  {
    priority: true,
    fare: "₹173.00",
    pickup: "Hall of Residence 14, G66W+8PH, Near IIT Kanpur, Kalyanpur, Kanpur, Uttar Pradesh 208017",
    dropoff: "Kanpur Central Railway Station, central railway station, Kanpur",
    pickupCoords: [26.511052416556655, 80.24688755767203],
    dropoffCoords: [26.456144881546738, 80.35043147788303],
    time: "29 mins",
    distance: "15.0 km"
  },
  {
    priority: true,
    fare: "₹173.00",
    pickup: "Hall of Residence 14, G66W+8PH, Near IIT Kanpur, Kalyanpur, Kanpur, Uttar Pradesh 208017",
    dropoff: "Chaudhary Charan Singh International Airport, Amausi, Lucknow, Uttar Pradesh 226009",
    pickupCoords: [26.511052416556655, 80.24688755767203],
    dropoffCoords: [26.761937431431722, 80.88558312698392],
    time: "2hr 21 mins",
    distance: "91.9 km"
  },
  {
    priority: false,
    fare: "₹138.39",
    pickup: "Hall of Residence 14, G66W+8PH, Near IIT Kanpur, Kalyanpur, Kanpur, Uttar Pradesh 208017",
    dropoff: "J.K. Temple, P, GT Rd, Khyora, Kanpur, Uttar Pradesh 208024",
    pickupCoords: [26.511052416556655, 80.24688755767203],
    dropoffCoords: [26.475642774065843, 80.3058759436053],
    time: "27 mins",
    distance: "14.5 km"
  }
];

function updateMap() {
  if (!map) {
    map = L.map('map').setView(pickupCoords, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(map);
  }

  map.eachLayer(layer => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline) {
      map.removeLayer(layer);
    }
  });

  L.marker(pickupCoords).addTo(map).bindPopup('Pickup');
  L.marker(dropoffCoords).addTo(map).bindPopup('Dropoff');

  routeLine = L.polyline([pickupCoords, dropoffCoords], {
    color: 'blue',
    weight: 4,
    opacity: 0.7,
    dashArray: '10,10'
  }).addTo(map);

  driverMarker = L.marker(pickupCoords, {
    icon: L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    })
  }).addTo(map).bindPopup("Driver");

  map.fitBounds([pickupCoords, dropoffCoords], { padding: [30, 30] });

  simulateDriver();
}

function simulateDriver() {
  const steps = [
    pickupCoords,
    [26.500, 80.270],
    [26.490, 80.300],
    dropoffCoords,
  ];
  let index = 0;

  const move = setInterval(() => {
    if (index >= steps.length) {
      clearInterval(move);
    } else {
      driverMarker.setLatLng(steps[index]);
      index++;
    }
  }, 2000);
}

function renderRide() {
  const ride = rides[currentRideIndex];
  showingPriority = ride.priority;
  pickupCoords = ride.pickupCoords;
  dropoffCoords = ride.dropoffCoords;
  updateMap();

  const badgeHTML = ride.priority ? `<span class="badge">PRIORITY</span>` : "";
  const note = ride.priority ? `<p class="note">You are getting 25% more than usual</p>` : "";

  document.getElementById('rideCard').innerHTML = `
  <div class="ride-card-content">
    <div class="ride-price">${ride.fare}</div>
    <hr class="divider" />

    <div class="ride-info">
      <div class="info-row">
        <span class="dot"></span>
        <span class="info-text">${ride.time} away</span>
      </div>
      <p class="info-address">${ride.pickup}</p>

      <div class="info-row">
        <span class="dot bold"></span>
        <span class="info-text">${ride.distance} trip</span>
      </div>
      <p class="info-address">Dropoff: ${ride.dropoff}</p>
    </div>

    <div class="buttons">
      <button class="accept" onclick="acceptRide()">Accept</button>
      <button class="decline" onclick="declineRide()">Decline</button>
    </div>

    ${badgeHTML}
  </div>
`;
}

function acceptRide() {
  currentRide = rides[currentRideIndex];

  const cancelButton = currentRide.priority
  ? `<button class="decline" disabled>Cancel Disabled</button>
  <button class="decline" onclick="reportEmergency()">Report Emergency</button>`
  : `<button class="decline" onclick="cancelRide()">Cancel Ride</button>`;
  
  const badgeHTML = currentRide.priority ? `<span class="badge">PRIORITY</span>` : "";

  document.getElementById('rideCard').innerHTML = `
    <div class="ride-header">
      <div class="price">✅ <strong>Ride Accepted</strong></div>
      ${badgeHTML}
    </div>
    <p class="note">You're on your way to the pickup location.</p>
    <p class="location">Pickup: ${currentRide.pickup}</p>
    <p class="location">Dropoff: ${currentRide.dropoff}</p>
    <p class="location">Trip: ${currentRide.distance} · ETA: ${currentRide.time}</p>

    <div class="otp-section" id="otpSection">
      <label for="otpInput">Enter 4-digit OTP</label>
      <input type="text" id="otpInput" maxlength="4" placeholder="____" oninput="validateOTP(this)">
    </div>

    <div class="buttons">
      ${cancelButton}
    </div>
  `;
}

function declineRide() {
  currentRideIndex++;
  if (currentRideIndex < rides.length) {
    renderRide();
  } else {
    document.getElementById('rideCard').innerHTML = `
      <div class="ride-header"><div class="price">No more rides available</div></div>
      <p class="note">You're all caught up 🚗</p>
    `;
  }
}

function validateOTP(input) {
  const otp = input.value;

  if (otp.length === 4 && /^\d{4}$/.test(otp)) {
    // Delay to allow the fourth digit to render visually before alert
    setTimeout(() => {
      alert("OTP verified ✅. Ride started.");
      const otpSection = document.getElementById("otpSection");
      if (otpSection) otpSection.remove();
    }, 100); // 100ms delay feels smooth
  }
}

function cancelRide() {
  const confirmCancel = confirm("Are you sure you want to cancel this ride?");
  if (!confirmCancel) return;

  alert("Ride cancelled.");
  currentRideIndex++;
  renderRide();
}

function reportEmergency() {
  const proceed = confirm("⚠️ Reporting a false emergency will result in 100% penalty. Continue?");
  if (!proceed) return;

  document.getElementById('map').style.display = "none";

  document.getElementById('rideCard').innerHTML = `
    <div class="ride-header">
      <div class="price">⚠️ Emergency Report</div>
    </div>
     <p class="note large-note">You’re canceling a priority ride.<br><strong>There will be a 100% penalty.</strong></p>

    <div class="otp-section">
      <label for="emergencyReason">Select reason</label>
      <select id="emergencyReason">
        <option value="">-- Choose a reason --</option>
        <option value="vehicle">🚗 Vehicle Breakdown</option>
        <option value="health">🤒 Health Issue</option>
        <option value="personal">🏠 Personal Emergency</option>
        <option value="other">❓ Other</option>
      </select>
    </div>

    <div class="buttons">
      <button class="decline" onclick="submitEmergency()">Submit Report</button>
    </div>
  `;
}

function submitEmergency() {
  const reason = document.getElementById('emergencyReason').value;
  if (!reason) {
    alert("Please select a reason.");
    return;
  }

  alert("Emergency reported. The app will now be placed on hold.");
  document.getElementById('rideCard').innerHTML = `
    <div class="ride-header">
      <div class="price">🚫 App On Hold</div>
    </div>
    <p class="note large-note">You have reported an emergency. Please resolve your situation before continuing to use the app.</p>
    <p class="location">Support has been notified. Stay safe. 🕊️</p>
    <button class="accept" onclick="resumeApp()">Resume App</button>
  `;

  document.getElementById('map').style.display = "none";
}

function resumeApp() {
  document.getElementById('map').style.display = "block";
  renderRide();
}

window.addEventListener("load", renderRide);
