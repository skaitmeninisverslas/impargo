function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}



/*   @ABOVE THIS IS RECOMMENDED
*    DO NOT DELETE */


class AutocompleteDirectionsHandler {
    map;
    originPlaceId;
    destinationPlaceId;
    travelMode;
    directionsService;
    directionsRenderer;
    geocoder;
    originPosition;
    destinationPosition;
    total;
    sec;
    distance;

    constructor(map) {
        this.map = map;
        this.originPlaceId = "";
        this.destinationPlaceId = "";
        this.travelMode = google.maps.TravelMode.DRIVING;
        this.directionsService = new google.maps.DirectionsService();
        this.directionsRenderer = new google.maps.DirectionsRenderer();
        this.directionsRenderer.setMap(map);
        this.geocoder = new google.maps.Geocoder()
        this.originPosition = null
        this.destinationPosition = null
        this.total = 0
        this.sec = 0;
        this.distance = 0;

        // this.setPlaceChangedListenersOnAllInputGroups()
    }

    setupPlaceChangedListener(
        autocomplete,
        mode
    ) {
        autocomplete.bindTo("bounds", this.map);

        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();

            if (!place.place_id) {
                window.alert("Please select an option from the dropdown list.");
                return;
            }

            if (mode === "ORIG") {
                this.originPlaceId = place.place_id;
            } else {
                this.destinationPlaceId = place.place_id;
            }

            this.route();
        });
    }

    route() {
        if (!this.originPlaceId || !this.destinationPlaceId) {
            return;
        }

        this.geocoder.geocode({ placeId: this.originPlaceId })
            .then(({ results }) => {
                if (results[0]) {
                    this.originPosition = {
                        lat : results[0].geometry.location.lat(),
                        lng : results[0].geometry.location.lng()
                    }

                    this.geocoder
                        .geocode({ placeId: this.destinationPlaceId })
                        .then(({ results }) => {
                            if (results[0]) {
                                this.destinationPosition = {
                                    lat : results[0].geometry.location.lat(),
                                    lng : results[0].geometry.location.lng()
                                }
                                console.log(this.originPosition)
                                console.log(this.destinationPosition)

                                let data = JSON.stringify({
                                    "from": this.originPosition,
                                    "to": this.destinationPosition,
                                    "vehicleType": document.querySelector(".axles").value,
                                    "departure_time": 1551541566,
                                    "fuelPrice": 2.79,
                                    "fuelPriceCurrency": "USD",
                                    "fuelEfficiency": {
                                        "city": 24,
                                        "hwy": 30,
                                        "units": "mpg"
                                    },
                                    "driver": {
                                        "wage": 30,
                                        "rounding": 15,
                                        "valueOfTime": 0
                                    },
                                    "hos": {
                                        "rule": 60,
                                        "dutyHoursBeforeEndOfWorkDay": 11,
                                        "dutyHoursBeforeRestBreak": 7,
                                        "drivingHoursBeforeEndOfWorkDay": 11,
                                        "timeRemaining": 60
                                    }
                                });

                                const param = new URLSearchParams();

                                param.append("__api_key__", "hi,-its-eevee. I can do wonderful things in api creation.")
                                param.append("request_payload", data);

                                const getUsers = () => {
                                    axios.post('https://api-impargo.mulum.pk/toll_calculator.php' , param)
                                        .then(response => {
                                            console.log(response);


                                            if (response.data.status === "ERROR") {
                                                console.log("error")
                                                alert(response.data.error.message)
                                                document.querySelectorAll('.toll-div')[0].classList.add("display-none") // todo: recheck for [0]
                                                // document.getElementById("toll-div")
                                            } else {

                                                this.distance = response.data.routes[0].summary.distance.value
                                                this.sec = response.data.routes[0].summary.duration.value
                                                response.data.routes[0].tolls.map(r1 => {
                                                    if (r1 !== null) {
                                                        this.total = r1.cashCost
                                                    }
                                                })

                                                function secondsToDhms(seconds) {
                                                    seconds = Number(seconds);
                                                    let d = Math.floor(seconds / (3600 * 24));
                                                    let h = Math.floor(seconds % (3600 * 24) / 3600);
                                                    let m = Math.floor(seconds % 3600 / 60);
                                                    let s = Math.floor(seconds % 60);

                                                    document.getElementById("distance").innerText = d + " d " + h + " h " + m + " m " + s + " s ";

                                                }

                                                secondsToDhms(this.sec)

                                                document.querySelectorAll('.toll-div')[0].classList.remove("display-none") // todo: recheck
                                                // document.getElementById("toll-div").classList.remove("display-none")
                                                document.getElementById("duration").innerText = (this.distance / 1000).toString() + "km";
                                                document.getElementById("toll").innerText = (this.total.toFixed(2));
                                                console.log((this.distance / 1000).toString())
                                                console.log((new Date(this.sec * 1000).toISOString().substr(11, 8)))
                                                console.log(this.total.toFixed(2))
                                            }

                                        })
                                        .catch(error => console.error(error));
                                };
                                getUsers();

                            } else {
                                window.alert("No results found");
                            }
                        })
                        .catch((e) => window.alert("Geocoder failed due to: " + e));
                } else {
                    window.alert("No results found");
                }
            })
            .catch((e) => window.alert("Geocoder failed due to: " + e));

        const me = this;

        this.directionsService.route(
            {
                origin: { placeId: this.originPlaceId },
                destination: { placeId: this.destinationPlaceId },
                travelMode: this.travelMode,
            },
            (response, status) => {
                if (status === "OK") {
                    me.directionsRenderer.setDirections(response);
                    console.log(response)
                } else {
                    window.alert("Directions request failed due to " + status);
                }
            }
        );
    }
}

let autoCompleteDirectionsHandler = null;

// function addInputGroupAndTollOptionToStopInputGroups() {
//     const stopInputGroup = document.querySelector('.stop-input-group');
//
//     const heavyInput = document.querySelector('#heavy-input').cloneNode(true);
//     const heavyToll = document.querySelector('#heavy-toll').cloneNode(true);
//
//     heavyInput.removeAttribute('id');
//     heavyToll.removeAttribute('id');
//
//     heavyInput.classList.remove('display-none');
//     heavyToll.classList.remove('display-none');
//
//     heavyInput.querySelector('.close-btn').addEventListener('click', (e) => {
//         stopInputGroup.removeChild(heavyInput);
//         stopInputGroup.removeChild(heavyToll);
//     });
//
//     heavyInput.querySelector('.origin-input').addEventListener('change', (e) => {
//         console.log(e.target.value);
//     })
//
//     const length = stopInputGroup.children.length
//
//     console.log(stopInputGroup.children.length);
//
//     stopInputGroup.appendChild(heavyInput);
//     stopInputGroup.appendChild(heavyToll);
//     console.log(stopInputGroup.children.length);
// }

// addInputGroupAndTollOptionToStopInputGroups()


// function main() {
//     initMap()
//     // displayInputs()
// }


function initMap() {
    const map = new google.maps.Map(
        document.getElementById("map"),
        {
            mapTypeControl: false,
            center: { lat: 13.8688, lng: 101.2195 },
            zoom: 4,
        }
    );

    autoCompleteDirectionsHandler = new AutocompleteDirectionsHandler(map);
}

// document.querySelector('.axles').addEventListener('change', (e) => {
//     autoCompleteDirectionsHandler.route();
//     //main();
//     console.log(e.target.value);
// });
//
// document.getElementById("optimize").addEventListener(('click') , e => {
//     autoCompleteDirectionsHandler.route();
// });


// * API Calls here */


let pdfButtons = document.querySelectorAll('.download-pdf');

pdfButtons.forEach(btn => {
    btn.addEventListener('click' , e => {

        let stops = locations.map( l => l.formatted_address)

        let obj = {
            stops : stops
        }

        let day = Math.floor(totalDuration / (3600 * 24));
        let hours = Math.floor(totalDuration % (3600 * 24) / 3600);
        let min = Math.floor(totalDuration % 3600 / 60);

        const param = new URLSearchParams();

        param.append("__api_key__", "hi,-its-eevee. I can do wonderful things in api creation.")
        param.append("total_kilometer", (totalDistance/1000).toString());
        param.append("total_duration" , day + "d " + hours + "h " + min + "m");
        param.append("company" , "Dummy Company");
        param.append("vehicle" , "E.g. 40t tanker");
        param.append("driver" , "E.g. Germany (short/medium haul)");
        param.append("total_cost" , totalToll);
        param.append("stops" , JSON.stringify(obj));

        console.log(JSON.stringify(obj))


        axios.post('https://api-impargo.mulum.pk/test_pdf.php' , param)
            .then(response => {
                console.log(response.data.data.data.link)
                window.open(response.data.data.data.link)
            })
            .catch(error => console.error(error));
    })
})



// * API Calls here */


function routingOptions() {
    document.getElementById("body").classList.toggle("display-none")
    console.log("hello")
}


document.getElementById("toggle-edit-vehicle").addEventListener("click", e => {
    document.getElementById("edit-vehicle").classList.remove("display-none")
});

document.getElementById("close-edit-vehicle").addEventListener("click", e => {
    document.getElementById("edit-vehicle").classList.add("display-none")
});

document.getElementById("save-edit-vehicle").addEventListener("click", e => {
    document.getElementById("edit-vehicle").classList.add("display-none")
});

document.getElementById("toggle-edit-driver").addEventListener("click", e => {
    document.getElementById("edit-driver").classList.remove("display-none")
});

document.getElementById("close-edit-driver").addEventListener("click", e => {
    document.getElementById("edit-driver").classList.add("display-none")
});

document.getElementById("save-edit-driver").addEventListener("click", e => {
    document.getElementById("edit-driver").classList.add("display-none")
});




let locations = [];
// let tolls = [];
let totalDistance = 0;
let totalDuration = 0;
let totalToll = 0;
let fuelPrice = 2.79;

document.querySelector('#reset').addEventListener("click" , e => {
    locations = [];
    initialize();
})

document.querySelector('.optimized-option').addEventListener('click' , e => {
    shuffle(locations);
    console.log(locations)
    createInputs()
    initialize();
})

function createInputs() {

    totalDistance = 0;
    totalDuration = 0;
    totalToll = 0;

    let container = document.querySelector('.input-container')

    for (let i = 0 ; i < locations.length ; i++) {
        let id = "#inputRow" + i.toString();
        let input = document.querySelector(id);
        input.remove();
    }

    container.innerHTML = ""

    let inputdivs = [];

    for(let i = 0 ; i< locations.length + 1 ; i++) {

        const heavyInput = document.querySelector('#inputRow').cloneNode(true);

        heavyInput.removeAttribute("id");

        let rowId = "inputRow" + i.toString();

        heavyInput.setAttribute("id" , rowId);

        heavyInput.classList.remove("display-none");
        const input = heavyInput.querySelector("input")

        let inputId = "input" + i.toString();

        input.setAttribute("id" , inputId);

        if (locations.length !== 0) {
            if (i <= locations.length-1) {
                let value = locations[i].formatted_address;

                input.setAttribute("value" , value)
            }
        }

        inputdivs.push(heavyInput)

        container.appendChild(inputdivs[i])

        let closeBtn = heavyInput.querySelector(".close-btn-rare");

        closeBtn.removeAttribute("id");
        closeBtn.setAttribute("id" , "Btn" + i.toString())
    }



    for (let i = 0; i< inputdivs.length-2 ; i++) {
        const heavyToll = document.querySelector('.toll-div').cloneNode(true);

        // * calculate toll * /

        let toll = 0;
        let duration = 0;
        let distance = 0

        let originPosition = locations[i].latLng;
        let destinationPosition = locations[i + 1].latLng;

        let data = JSON.stringify({
            "from": originPosition,
            "to": destinationPosition,
            "vehicleType": document.querySelector(".axles").value,
            "departure_time": 1551541566,
            "fuelPrice": fuelPrice,
            "fuelPriceCurrency": "USD",
            "fuelEfficiency": {
                "city": 24,
                "hwy": 30,
                "units": "mpg"
            },
            "driver": {
                "wage": 30,
                "rounding": 15,
                "valueOfTime": 0
            },
            "hos": {
                "rule": 60,
                "dutyHoursBeforeEndOfWorkDay": 11,
                "dutyHoursBeforeRestBreak": 7,
                "drivingHoursBeforeEndOfWorkDay": 11,
                "timeRemaining": 60
            }
        });

        const param = new URLSearchParams();

        param.append("__api_key__", "hi,-its-eevee. I can do wonderful things in api creation.")
        param.append("request_payload", data);

        axios.post('https://api-impargo.mulum.pk/toll_calculator.php', param)
            .then(response => {

                console.log(response)
                if (response.data.status === "ERROR") {
                    console.log("error")
                    alert(response.data.error.message)
                    document.querySelectorAll('.toll-div')[0].classList.add("display-none") // todo: recheck for [0]
                    // document.getElementById("toll-div")
                } else {

                    heavyToll.classList.remove("display-none");

                    let tollId = "toll" + i.toString();

                    heavyToll.setAttribute("id", tollId)

                    let id = "#inputRow" + i.toString();

                    let parentInput = document.querySelector(id)

                    parentInput.insertAdjacentElement("afterend", heavyToll)


                    distance = response.data.routes[0].summary.distance.value
                    duration = response.data.routes[0].summary.duration.value
                    response.data.routes[0].tolls.map(r1 => {
                        if (r1 !== null) {
                            toll = toll + r1.cashCost
                        }
                    })

                    function secondsToDhms(seconds) {
                        seconds = Number(seconds);
                        let d = Math.floor(seconds / (3600 * 24));
                        let h = Math.floor(seconds % (3600 * 24) / 3600);
                        let m = Math.floor(seconds % 3600 / 60);
                        let s = Math.floor(seconds % 60);

                        heavyToll.querySelector(".duration").innerText = d + " d " + h + " h " + m + " m " + s + " s ";
                    }

                    secondsToDhms(duration)

                    heavyToll.querySelector(".distance").innerHTML = distance / 1000 + "km";
                    heavyToll.querySelector('.toll').innerHTML = toll + "$"

                    // document.querySelectorAll('.toll-div')[0].classList.remove("display-none") // todo: recheck
                    // // document.getElementById("toll-div").classList.remove("display-none")
                    // document.getElementById("duration").innerText = (this.distance / 1000).toString() + "km";
                    // document.getElementById("toll").innerText = (this.total.toFixed(2));
                    // console.log((this.distance / 1000).toString())
                    // console.log((new Date(this.sec * 1000).toISOString().substr(11, 8)))
                    // console.log(this.total.toFixed(2))


                }

                totalToll = totalToll + toll;
                totalDistance = totalDistance + distance;
                totalDuration = totalDuration + duration;

                console.log("total_Distance : " + totalDistance + " total_duration : " + totalDuration + " total_toll : " + totalToll)


                let footer = document.querySelector(".footer-data")

                function secondsToDhmsForFooter(seconds) {
                    seconds = Number(seconds);
                    let d = Math.floor(seconds / (3600 * 24));
                    let h = Math.floor(seconds % (3600 * 24) / 3600);
                    let m = Math.floor(seconds % 3600 / 60);
                    let s = Math.floor(seconds % 60);

                    footer.querySelector(".total-time").innerText = d + " d " + h + " h " + m + " m " + s + " s ";
                }

                secondsToDhmsForFooter(totalDuration)

                footer.querySelector('.total-distance').innerHTML = ((totalDistance/1000).toFixed(2)).toString();
                footer.querySelector('.total-toll').innerHTML = totalToll;
                footer.querySelector('.total-cost-per-km').innerHTML = fuelPrice.toString();
                footer.querySelector('.total-cost').innerHTML = (fuelPrice * (totalDistance/1000)).toString()


            })
            .catch(error => console.error(error));

        // * calculate toll * /

    }


    locations.length !== 0 ? initialize() : null

}

function map() {

    let travelMode = google.maps.TravelMode.DRIVING;
    let directionsService = new google.maps.DirectionsService();
    let directionsRenderer = new google.maps.DirectionsRenderer();

    const map = new google.maps.Map(
        document.querySelector("#map"), {
            mapTypeControl: false,
            center: { lat: 13.8688, lng: 101.2195 },
            zoom: 4,
        }
    );

    let points = locations.map( m => m) ;


    directionsRenderer.setMap(map);

    let originPlace = points.shift();

    let destinationPlace = points.pop();

    let waypoints = points.map( p => {
        return {
            location: p.latLng,
            stopover: true,
        }
    })

    if (locations.length > 1 ) {

        directionsService.route(
            {
                origin: originPlace.latLng,
                destination: destinationPlace.latLng,
                waypoints : waypoints,
                travelMode: travelMode,
            },
            (response, status) => {
                if (status === "OK") {
                    directionsRenderer.setDirections(response);
                } else {
                    window.alert("Directions request failed due to " + status);
                }
            }
        );
    }
}

function initialize() {

    map();

    locations.length === 0 ? createInputs() : null;

    let inputContainer = document.querySelector('.input-container')

    var inputArr = inputContainer.querySelectorAll("input")

    inputArr.forEach( input => {

        var autocomplete = new google.maps.places.Autocomplete(input);

        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            map()

            lastInputId = "input" + (locations.length).toString()

            let place = autocomplete.getPlace();

            let meta = {
                formatted_address : place.formatted_address,
                latLng : {
                    lat : place.geometry.location.lat(),
                    lng : place.geometry.location.lng()
                }
            }

            if (input.id === lastInputId) {

                console.log(locations.length);

                locations.push(meta)
                console.log(locations);
            }else {
                let index = input.id.split("t")[1];
                locations[index] = meta
                console.log(locations)
            }

            createInputs();

        });

    })

    let btnArr = document.querySelectorAll(".close-btn-rare")


    btnArr.forEach( btn => {
        if (btn.id !== "default-btn-rare") {
            document.querySelector("#" + btn.id).addEventListener("click" , e => {

                let index = btn.id.split("n")[1];

                locations = locations.filter((m , i) => i !== parseInt(index))

                createInputs();
                initialize();
            })
        }
    })

}




