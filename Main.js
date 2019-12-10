var mymap =undefined;
var radius_circle = new L.circle([24.52609, 46.801119],20);
let element ;

// Your web app's Firebase configuration
  // Initialize Firebase
  firebase.initializeApp(config["firebaseConfig"]);

  var messageAppReference = firebase.database();//.ref('MyCollection');
  var pictureRating = messageAppReference.ref('pictureRating');

        // // use the set method to save data to the messages
        // pictureRating.push({
        //   url: "",
        //   rating: 0,
        //    totalPeople:0,
        //    lat:"",
        //    lon:""
        // });
    
        //firebase.app().database().ref("messages").orderByChild("message").equalTo("hello").once("value", snp => console.log(snp.val()))



        function RateIt(id, rating,modelElem, oldElement) {
          console.log(id);
          console.log(rating);
          console.log(modelElem);
          console.log(oldElement);
          
          // update votes property
          if(oldElement != undefined){
            
            console.log("Update older record with id: "+id);
            // find message whose objectId is equal to the id we're searching with
            console.log(
              parseFloat(oldElement[id].rating)+","+
              parseFloat(oldElement[id].totalPeople)+","+
              parseFloat(rating)+","+
              (parseInt(oldElement[id].totalPeople)+1) +", res "+
              (((parseFloat(oldElement[id].rating) * parseFloat(oldElement[id].totalPeople) )) + rating )/ (parseInt(oldElement[id].totalPeople)+1)
              );
            var pRating = firebase.database().ref('pictureRating/' + id);
            let newRating = (((parseFloat(oldElement[id].rating) * parseFloat(oldElement[id].totalPeople) )) + rating )/ (parseInt(oldElement[id].totalPeople)+1);
          pRating.update({
            rating: newRating,// (((parseFloat(oldElement[id].rating) * parseFloat(oldElement[id].totalPeople) )) + rating )/ (parseInt(oldElement[id].totalPeople)+1),
            totalPeople: parseInt(oldElement[id].totalPeople)+1,
            orderScore: -5 * (parseInt(oldElement[id].totalPeople)+1 * newRating)
          })
        }else{
          console.log("Creating a new record");
          // create new record
          pictureRating.push({
          url: modelElem["url"],
          rating: rating,
           totalPeople:1,
           lat:modelElem["lat"],
           lon:modelElem["lon"],
           orderScore: -1*(1 * rating)
        });
        }
        }

$(function() {
  initSettings();
  
  // With JQuery
$("#radius").slider();
$("#radius").on("slide", function(slideEvt) {
  //searchOptions.radius = slideEvt.value;
	$("#ex6SliderVal").text(slideEvt.value);
});

    var tags_txt = 'landscape';
$("#btnTxt").on('click',function(){
  
  searchOptions.radius =  $("#radius").val();
  searchOptions.tags =  $("#txtArea1").val().split("#").filter(function(el){return el != null && el != ""}).join(",");
    console.log(tags_txt);
});

    function handleResponseSuccess(response) {
      
        // // Clear
        // console.log(searchOptions.radius);
        // console.log(searchOptions.tags);
        $('.images').html("");
        let allData = response.photos.photo; // not a jQuery object, so we have to use $.each below
        $("#totalFoundPictures").html(allData.length);
        $.each(allData, function() {
          // photos without titles may not be carefully tagged, so exclude them 
          let url = this.url_n;

          let title = this.title;
          if (this.title !== '') {
            // let element = $('<img>').attr('src', this.url_n).addClass('image');
            element = $('<img>').attr('src', this.url_n).addClass('image').css("height",'80px').css("width",'80px');
            // element.mouseover(bigImg(element)).mouseout(normalImg(element));
            // element.hover(function(){
            //   $(this).css("height",'25%');
            //   $(this).css("width",'25%');
            //   }, function(){
            //     $(this).css("height",'10%');
            //     $(this).css("width",'10%');
            // });
            element.click(function(){
              $("#myModal").css('display', "block");
              console.log(url);
              
              $("#rateYoModel").val(url);
              $("#rateYoModel").rateYo.rating = 0.0;
              $("#coord").val(searchOptions.lat+","+searchOptions.lon);
              
            $("#img01").attr('src',url);
            $("#caption").html(title);
            });
            $('.images').append(element);
          }
        });
      }
      function initSettings(){
        searchOptions = {
          method: 'flickr.photos.search', // endpoint
          api_key: config.flicker["api_key"], // stored in js/keys.js
          tags:'landscape',
          media: 'photos',
          lat: "24.342",
          lon: "43.454",
          radius: 10,
          radius_units: 'mi',
          format: 'json',
          nojsoncallback: 1,

          extras: 'url_n',
          content_type: 1,
          safe_search: 1,
          sort: 'relevance',
        };
      }

      // ----
      function picture_based_on_location(position){
        console.log("Pos");
          console.log(position);

          // Update the circle on map
          console.log(searchOptions.radius);
      mymap.removeLayer(radius_circle);
      if(marker != undefined)mymap.removeLayer(marker);
      
      radius_circle = new L.circle([position.coords.latitude, position.coords.longitude],parseInt(searchOptions.radius)).addTo(mymap);


        // Now that we have the user's location, let's search the API for landscape photos nearby
        let url = 'https://api.flickr.com/services/rest/?'; // base URL
        // Object storing each key and value we need in our query.
        // This makes it clear what options we're choosing, and makes it easier
        // // to change the values or add/remove options.
        // let searchOptions = {
        //   method: 'flickr.photos.search', // endpoint
        //   api_key: config.flicker["api_key"], // stored in js/keys.js
        //   tags:tags_txt, //'landscape',
        //   media: 'photos',
        //   lat: position.coords.latitude,
        //   lon: position.coords.longitude,
        //   radius: 10,
        //   radius_units: 'mi',
        //   format: 'json',
        //   nojsoncallback: 1,

        //   extras: 'url_n',
        //   content_type: 1,
        //   safe_search: 1,
        //   sort: 'relevance',
        // };

        //searchOptions.api_key = config.flicker["api_key"]; // stored in js/keys.js
        //searchOptions.tags = tags_txt; //'landscape',
        searchOptions.lat= position.coords.latitude;
        searchOptions.lon = position.coords.longitude;
        // loop through the searchOptions object and append each key and value
        // to the url variable to build the full search URL
        for (let key in searchOptions) {
          url += '&' + key + '=' + searchOptions[key];
        }
        console.log(url);
   
        // Now that we've built our URL, we can send our GET request
        $.get(url).done(function(response) {
          console.log(response);
          if (response.stat === 'fail') {
            console.log(response.message); // point out that for end users, we'll want to use DOM manipulation, but this is a quick and dirty
        // way of seeing if there's an error while we're building the app
          } else if (response.photos.photo.length === 0) {
            console.log('No photos found!'); // same as previous
            $("#totalFoundPictures").html(0); // reset
            $('.images').html("No Photos Found Try Another Location!"); // Reset
          } else {
            // Handle the successful response here
            console.log('Request succeeded!');// note that we will replace this with code to handle the data when it's received; this is just
            // to make sure our code is working to this point
            handleResponseSuccess(response);
          }
        });
   
   
    }


    // DOM is now ready
   // check if navigator geolocation is available from the browser
   if (navigator.geolocation) {
    // if it is use the getCurrentPosition method to retrieve the Window's location
    navigator.geolocation.getCurrentPosition(function(position) {
      console.log('lat: ' + position.coords.latitude);
      console.log('lon: ' + position.coords.longitude);


     console.log('lat: ' + position.coords.latitude);
     console.log('lon: ' + position.coords.longitude);
 
 // All code from here on down is new code, including the closing });
picture_based_on_location(position);
})
  } else {
    $('.images').append('Sorry, the browser does not support geolocation');
  }



  // Geo 
  mymap = L.map('mapid', {attributionControl: false}).setView([24.221919, 44.917603], 5);

  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox/streets-v11'
  }).addTo(mymap);

  // L.marker([51.5, -0.09]).addTo(mymap)
  // 	.bindPopup("<b>Hello world!</b><br />I am a popup.").openPopup();

  // L.circle([51.508, -0.11], 500, {
  // 	color: 'red',
  // 	fillColor: '#f03',
  // 	fillOpacity: 0.5
  // }).addTo(mymap).bindPopup("I am a circle.");

  // L.polygon([
  // 	[51.509, -0.08],
  // 	[51.503, -0.06],
  // 	[51.51, -0.047]
  // ]).addTo(mymap).bindPopup("I am a polygon.");


  var popup = L.popup();

  function onMapClick(e) {
      var position={
        "coords":{
            "latitude":e.latlng.lat,
            "longitude":e.latlng.lng,
        }
      }
    picture_based_on_location(position);
      console.log(e);
      popup
          .setLatLng(e.latlng)
          .setContent("You clicked the map at " + e.latlng.toString())
          .openOn(mymap);
  }

  mymap.on('click', onMapClick);




  });