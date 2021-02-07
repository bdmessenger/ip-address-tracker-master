const states = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AS": "American Samoa",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "DC": "District Of Columbia",
    "FM": "Federated States Of Micronesia",
    "FL": "Florida",
    "GA": "Georgia",
    "GU": "Guam",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MH": "Marshall Islands",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "MP": "Northern Mariana Islands",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PW": "Palau",
    "PA": "Pennsylvania",
    "PR": "Puerto Rico",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VI": "Virgin Islands",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming"
};

const cardElement = document.getElementById('card');
const ipAddressElement = document.getElementById('ip-address');
const locationElement = document.getElementById('location');
const timezoneElement = document.getElementById('timezone');
const ispElement = document.getElementById('isp');
const inputElement = document.getElementById('search');
const buttonElement = document.querySelector('button');

const clientData = JSON.parse(localStorage.getItem('ip_tracker_client'));

const MAP = L.map('mapid', {
    zoomControl: false
});

const myIcon = L.icon({
    iconUrl: './images/icon-location.svg',
    iconSize: [40, 50],
    iconAnchor: [20, 54],
});

async function fetchGeoData(ipAddress = '', domain = '') {
    try {
        const res = await fetch(`https://geo.ipify.org/api/v1?apiKey=at_yYscW5heIXH7O9HxZ1A5kMsOdtnTV&ipAddress=${ipAddress}&domain=${domain}`);
        const data = await res.json();

        if(!data.hasOwnProperty('code')) {
            const { ip, location, isp } = data;
            const geoData = {
                ip,
                location,
                isp
            };
            return geoData;
        }
    } catch (e) {
        console.error(e);
    }

    window.alert('Invalid IP Address / Domain');
    return null;
}

function updateMapView(data) {
    if (data !== null) {
        const { city, region, postalCode, lat, lng, timezone } = data.location;
        const location = `${city}, ${Object.keys(states).find(key => states[key] === region)} ${postalCode}`;
        const UTC_TIMEZONE = 'UTC ' + timezone;

        MAP.setView([lat, lng], 13);
        MAP.panBy(new L.Point(0, -60));
        const marker = L.marker([lat, lng], {icon: myIcon}).addTo(MAP);
        marker.bindPopup(`<b>${city}</b><br>${region}`);

        updateMapInfo(data.ip, location, UTC_TIMEZONE, data.isp);

        return true;
    }

    return false;
}

function updateMapInfo(ip = '--', location = '--', timezone = '--', isp = '--') {
    ipAddressElement.innerText = ip;
    locationElement.innerText = location;
    timezoneElement.innerText = timezone;
    ispElement.innerText = isp;
}

async function showCurrentPosition() {
    let geoData = clientData; 
    if(clientData === null || clientData.ip === null || clientData.ip === '') {
        const res = await fetch('https://api.ipify.org/?format=json');
        const { ip } = await res.json();
        geoData = await fetchGeoData(ip);
        localStorage.setItem('ip_tracker_client', JSON.stringify(geoData));
    }

    return updateMapView(geoData);
}

function initialProcess() {
    if (window.navigator.geolocation) {
        window.navigator.geolocation.getCurrentPosition(showCurrentPosition, async () => {
            console.log('Geolocation request was denied.');
            localStorage.removeItem("ip_tracker_client");
            const geoData = await fetchGeoData('', 'google.com');
            updateMapView(geoData);
        });
    }
}

initialProcess();

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoicGF1bG9lLW1lIiwiYSI6ImNrZzd6bzZldjBjZGUyeXFubmtvN3NycDkifQ.-P495y88So4PLt3wz4QPNQ'
}).addTo(MAP);

document.querySelector('form').addEventListener('submit', e => {
    e.preventDefault();
    inputElement.disabled = true;
    buttonElement.disabled = true;
    const value = inputElement.value;
    let ipAddress = '', domain = '';

    if(value.match(/\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}/)) {
        ipAddress = value;
    } else {
        domain = value;
    }

    (async () => {
        const geoData = await fetchGeoData(ipAddress, domain);
        updateMapView(geoData);
        e.target.reset();
        inputElement.disabled = false;
        buttonElement.disabled = false;
    })();
});

document.getElementById('collapse-toggle').addEventListener('click', (e) => {
    cardElement.classList.toggle("active");
    if(cardElement.className === 'active') {
        e.target.innerText = 'CLOSE';
    } else {
        e.target.innerText = 'OPEN';
    }
});

L.control.zoom({
    position: 'bottomleft'
}).addTo(MAP);