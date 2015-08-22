angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $state, $ionicLoading, Chats) {
  
  // window.localStorage.removeItem('locations');
  
  
  $scope.windowWidth = window.innerWidth;
  $scope.heightWidth = window.innerHeight - 100;
  var currentUser = Parse.User.current();
  $scope.locations = '';
  $scope.refresh_message = "Answer the pictures above to get more...";
  $ionicLoading.show({
          content: 'Loading',
          animation: 'fade-in',
          showBackdrop: true,
          maxWidth: 200,
          showDelay: 0,
          duration: 5000
        });



  if (currentUser) {

    if ( (window.localStorage['locations']) == undefined ) {
      $scope.locations = getlocations(currentUser);
    }

    else {
        var testObject = JSON.parse(window.localStorage['locations']);

        // If there are still items in localstorage
        if (testObject.length > 0) {
          $scope.locations = testObject;
          $ionicLoading.hide();
        }

        // If there aren't items in localstorage, make a db call
        else {
          $scope.locations == getlocations(currentUser);
        }
        
      }

  } 
  // END OF IF CURRENTUSER EXISTS



  // IF THERE IS NO CURRENT USER
  else {
      // show the signup or login page
      $ionicLoading.hide();
      $state.go('login');
  }
  // END OF IF NO CURRENT USER


  //LOGOUT BUTTON
  $scope.logout = function(item,event){
    Parse.User.logOut();
    window.localStorage.clear();
    $state.go('login');
  };
  // END OF LOGUT BUTTON

  // REFRESH
  $scope.refresh = function () {
        setTimeout(function () {
          window.location.reload(true); 
    }, 750);


  };
  // END OF REFRESH


  // Make db call to get locations
  function getlocations(currentUser){
    var Result = Parse.Object.extend("Result");
    var result_query = new Parse.Query(Result);
    result_query.equalTo("user", currentUser.id);
    result_query.find({

    success: function(results) {

        user_result = [];
        for (var i = 0; i < results.length; i++) {
          var object = results[i];
          user_result.push(object.get('locationId'));
        }


        var CoorList = Parse.Object.extend("CoorList");
        var query = new Parse.Query(CoorList);
        query.descending("createdAt");
        query.notContainedIn("objectId", user_result);
        query.limit(8);
        query.find({
                  
        success: function(locations) {
          
          window.localStorage['locations'] = JSON.stringify(locations);
          var testObject = JSON.parse(window.localStorage['locations']);
          $scope.locations = testObject;

            
          if (locations.length == 0){
            $scope.refresh_message = "You've played all of our pictures. But we'll have more tomorrow so come back...";
          }

          $ionicLoading.hide();
            
        },

        error: function(error){
          alert("Error: " + error.code + " " + error.message);
          $ionicLoading.hide();
        }

      });

      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
        $ionicLoading.hide();
      }
    });
    // END OF PARSE DB QUERY

  }
  // End of getlocations

    $scope.fullscreenImage = function(item_index){
      // $state.go('fullscreen', {objectId:$scope.locations[item_index].objectId , actual_lat:$scope.locations[item_index].Lat , actual_lng:$scope.locations[item_index].Long , image_Link: encodeURI($scope.locations[item_index].imageLink) })
      $state.go('tab.guess', {location_id:$scope.locations[item_index].objectId , actual_lat:$scope.locations[item_index].Lat , actual_lng:$scope.locations[item_index].Long })
  };
  
})
// END OF HOME CONTROLLER

.controller('LoginFormCtrl', function($scope, $state, $cordovaFacebook) {
$scope.data = {
    'username' : '',
    'password' : ''
  };
  

  //Click button to login
  $scope.login = function(item,event){

    Parse.User.logIn('sharataka', 'goldengun', {
      success: function(user) {
        $state.go('tab.dash');
      },
      error: function(user, error) {
        alert(error.message + '. Make sure you enter the right username and password!');

      }
    });

  };
})

.controller('LoginCtrl', function($scope, $state, $cordovaFacebook) {

// Calculate left margin on buttons
var buttonlength = .7 * window.innerWidth;
$scope.left_margin = (window.innerWidth - buttonlength) / 2;

$scope.height = window.innerHeight;


// Data bind the username and password fields
$scope.data = {
    'username' : '',
    'password' : ''
  };
  

  //Click button to login
  $scope.login = function(item,event){

    Parse.User.logIn('sharataka', 'goldengun', {
      success: function(user) {
        $state.go('tab.dash');
      },
      error: function(user, error) {
        alert(error.message + '. Make sure you enter the right username and password!');

      }
    });

  };
  
  


$scope.loginFacebook = function(){
 
  //Browser Login
  if(!(ionic.Platform.isIOS() || ionic.Platform.isAndroid())){
 
    Parse.FacebookUtils.logIn(null, {
      success: function(user) {
        console.log(user);
        if (!user.existed()) {
          $state.go('tab.dash');
        } else {
          $state.go('tab.dash');
        }
      },
      error: function(user, error) {
        alert("User cancelled the Facebook login or did not fully authorize.");
      }
    });
 
  }

  //Native Login
  else {
  
    $cordovaFacebook.login(["public_profile", "email"]).then(function(success){
 
      //Need to convert expiresIn format from FB to date
      var expiration_date = new Date();
      expiration_date.setSeconds(expiration_date.getSeconds() + success.authResponse.expiresIn);
      expiration_date = expiration_date.toISOString();
 
      var facebookAuthData = {
        "id": success.authResponse.userID,
        "access_token": success.authResponse.accessToken,
        "expiration_date": expiration_date
      };
 
      Parse.FacebookUtils.logIn(facebookAuthData, {
        success: function(user) {
          console.log(user);
          if (!user.existed()) {
            $state.go('tab.dash');
          } else {
            $state.go('tab.dash');
          }
        },
        error: function(user, error) {
          alert("User cancelled the Facebook login or did not fully authorize.");
        }
      });
 
    }, function(error){
      alert('error');
    });
 
  }
 
};



})

.controller('SignupCtrl', function($scope, $state) {

    // Data bind the username and password fields
    $scope.data = {
        'username' : '',
        'password' : '',
        'email'    : ''
      };

  //Click button to signup
  $scope.signup = function(item,event){

    var user = new Parse.User();
    user.set("username", $scope.data.username);
    user.set("password", $scope.data.password);
    
    // IF EMAIL IS BLANK, LEAVE EMAIL AS UNDEFINED. IF YOU DON'T HAVE THIS, EMAIL IS ''
    if ($scope.data.email == ''){
    } else {
      user.set("email", $scope.data.email);  
    }
    

    // other fields can be set just like with Parse.Object
    // user.set("phone", "415-392-0202");

    user.signUp(null, {
      success: function(user) {
        // Hooray! Let them use the app now.
        $state.go('tab.dash');
      },
      error: function(user, error) {
        // Show the error message somewhere and let the user try again.
        alert("Error: " + error.code + " " + error.message);
      }
    });

  };

})

.controller('GuessCtrl', function($scope, $state, $stateParams, $ionicPopup) {

  // Calculate left margin on buttons
  var buttonlength = .7 * window.innerWidth;
  $scope.left_margin = (window.innerWidth - buttonlength) / 2;
  $scope.heightWidth = window.innerHeight;

  //Click button to make a guess
  $scope.onTouch = function(item,event){
    if ($scope.coordinates == null) {
      $ionicPopup.alert({
                        title: "You haven't made a guess",
                        content: "Tap on the map to drop a pin and make a guess."
                    })
    }
    else {
      $state.go('tab.result', { location_id: $stateParams.location_id, actual_lat:$stateParams.actual_lat, actual_lng:$stateParams.actual_lng });
    } 
  };

  $scope.initialise = function() {
    var myLatlng = new google.maps.LatLng(37.758446, -122.411789);
    var markersArray = [];

    //Initial settings for the map
    var mapOptions = {
            center: myLatlng,
            zoom: 2,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

    //Load the initial map
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);

    //Event listener to add a marker      
    google.maps.event.addListener(map, 'click', function(e) {
      clearOverlays();
      placeMarker(e.latLng, map);
      $scope.coordinates = e.latLng;
      localStorage.userLat = $scope.coordinates.lat();
      localStorage.userLong = $scope.coordinates.lng();
    });

    //Actual function to add a marker
    function placeMarker(position, map) {
      var marker = new google.maps.Marker({
        position: position,
        map: map
      });
      map.panTo(position);
      markersArray.push(marker);
    }

    function clearOverlays() {
      for (var i = 0; i < markersArray.length; i++ ) {
        markersArray[i].setMap(null);
      }
      markersArray.length = 0;
    }

    $scope.map=map;

  };

  google.maps.event.addDomListener(document.getElementById("map"), 'load', $scope.initialise());

      // DISPLAY IMAGE AGAIN
    

      var CoorList = Parse.Object.extend("CoorList");
      var query = new Parse.Query(CoorList);
      query.equalTo("objectId", $stateParams.location_id);
      query.find({
        success: function(results) {

          localStorage.image = results[0].attributes.imageLink;
          localStorage.answer = results[0].attributes.Answer;

        },
        error: function(error) {
          alert("Error: " + error.code + " " + error.message);
        }
      });
      // END OF DISPLAY IMAGE

})

.controller('ResultCtrl', function($scope, $state, $stateParams) {


      // //Calc user's score
      // var maxScore = 500;
      // var earthCircumference = 40075;
      // var maxDistance = earthCircumference / 2;
      // var distance = google.maps.geometry.spherical.computeDistanceBetween(actualGoogCoor, userGoogCor) / 1000;
      // var score = (-1 * maxScore / maxDistance) * distance + maxScore;
      // score = score.toFixed(0);
      // score = numberWithCommas(score);    
      // $scope.score = score;
    $scope.windowWidth = window.innerWidth;
    
    $scope.initialise = function() {
      var guessCoor = new google.maps.LatLng(localStorage.userLat, localStorage.userLong);
      var actualCoor = new google.maps.LatLng($stateParams.actual_lat, $stateParams.actual_lng);

      //Initial settings for the map
      var mapOptions = {
              center: guessCoor,
              zoom: 2,
              mapTypeId: google.maps.MapTypeId.ROADMAP
          };

      //Load the initial map
      var map = new google.maps.Map(document.getElementById("map_result"), mapOptions);

      var marker = new google.maps.Marker({
          position: guessCoor,
          map: map,
          title: 'Your guess'
        });

      var marker2 = new google.maps.Marker({
        position: actualCoor,
        map: map,
      });


      // Add circle overlay
      var circle = new google.maps.Circle({
        map: map,
        center: actualCoor,
        radius: 500000,  //500km away
        strokeColor:"#0000FF",
        strokeOpacity:0.8,
        strokeWeight:2,
        fillColor:"#0000FF",
        fillOpacity:0.4
      });


      var infowindow = new google.maps.InfoWindow({
          content: 'Your guess'
      });

      google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map,marker);
      });


      var flightPlanCoordinates = [guessCoor, actualCoor];
      var flightPath = new google.maps.Polyline({
        path: flightPlanCoordinates,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });

      flightPath.setMap(map);

      $scope.map=map;



      //Calc distance between 2 points
      var actualGoogCoor = new google.maps.LatLng($stateParams.actual_lat, $stateParams.actual_lng);
      var userGoogCor = new google.maps.LatLng(localStorage.userLat, localStorage.userLong);
      var distance_number = google.maps.geometry.spherical.computeDistanceBetween(actualGoogCoor, userGoogCor) / 1000;
      if (distance_number<501) {
        $scope.round_status = "Correct"
      } else {
        $scope.round_status = "Incorrect"
      }
      distance = distance_number.toFixed(0);
      distance = numberWithCommas(distance);
      $scope.distance = distance;

      // SAVE SCORE TO DATABASE
      var Result = Parse.Object.extend("Result");
      var result = new Result();
      
      result.set("distance", distance_number);
      result.set("user", Parse.User.current().id);
      result.set("locationId", $stateParams.location_id);
      result.set("guessLat", Number(localStorage.userLat));
      result.set("guessLong", Number(localStorage.userLong));
      
      result.save(null, {
        success: function(result) {
          
        },
        error: function(result, error) {
          alert('Failed to create new object, with error code: ' + error.message);
        }
      });
      // END OF SAVING SCORE TO DATABASE

      $scope.image = localStorage.image;
      $scope.answer = localStorage.answer;

       $scope.morePictures = function () {
          window.open('https://www.google.com/images?q=' + $scope.answer +'', 'blank');
        }

        $scope.moreInfo = function () {
          window.open('https://www.google.com/search?q=' + $scope.answer +'', 'blank');
        }



      // Remove object from locations localstorage, for use on home feed
      var testObject = JSON.parse(window.localStorage['locations']);
      for (var i = 0; i < testObject.length; i++) {
        if ( testObject[i].objectId == $stateParams.location_id ) {
          testObject.splice(i,1);
        }
      }
      window.localStorage['locations'] = JSON.stringify(testObject);



    };
    
    google.maps.event.addDomListener(document.getElementById("map_result"), 'load', $scope.initialise());


    
    //Format number with comma
    function numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, $ionicLoading, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('OfflineCtrl', function($scope, $stateParams, $ionicPopup) {
    
    $ionicPopup.alert({
                    title: "You're offlne!",
                    content: "Make sure you're connected to the internet and then tap the button to get going again!"
                })

    $scope.tryAgain = function(item,event){
     if(navigator.onLine){
        window.location.href = '#/dash';
     } 
     else {
      $ionicPopup.alert({
                      title: "You're still not connected!",
                      content: "Make sure you're connected to the internet and then tap the button to get going again!"
                  })

     }

    }

})

.controller('FullscreenCtrl', function($scope, $stateParams, $ionicLoading) {
  // Calculate left margin on buttons
  var buttonlength = .7 * window.innerWidth;
  $scope.left_margin = (window.innerWidth - buttonlength) / 2;

  $scope.height = window.innerHeight;

  $scope.objectId = $stateParams.objectId;
  $scope.actual_lat = $stateParams.actual_lat;
  $scope.actual_lng = $stateParams.actual_lng;
  $scope.imageLink = $stateParams.image_Link;

})

.controller('ResultfullscreenCtrl', function($state, $scope, $stateParams, $ionicLoading, $ionicHistory) {
  
  // Calculate left margin on buttons
  var buttonlength = .7 * window.innerWidth;
  $scope.left_margin = (window.innerWidth - buttonlength) / 2;

  $scope.height = window.innerHeight;

  $scope.objectId = $stateParams.objectId;
  $scope.imageLink = $stateParams.image_Link;
  $scope.answer = $stateParams.answer;
  $scope.icon = $stateParams.icon;
  $scope.distance =  Number($stateParams.distance).toFixed(0);

  $scope.goToAccount = function(item,event) {
    $state.go('tab.account');
  }

})

.controller('AccountCtrl', function($state, $scope, $http, $ionicLoading, $stateParams) {


    // REFRESH
  $scope.refresh = function (){
        setTimeout(function () {
          window.location.reload(true); 
    }, 750);

      };
      // end of refresh

  $scope.windowWidth = window.innerWidth;
  $scope.leftMarginProfilePicture = window.innerWidth / 2 - 25;
  $scope.windowDividedBy3 = $scope.windowWidth / 3;


  $ionicLoading.show({
          content: 'Loading',
          animation: 'fade-in',
          showBackdrop: true,
          maxWidth: 200,
          showDelay: 0,
          duration: 5000
        });


  var currentUser = Parse.User.current();
  getlocations(currentUser);
  

  // Make db call to get locations played
  function getlocations(currentUser){
    var Result = Parse.Object.extend("Result");
    var result_query = new Parse.Query(Result);
    result_query.equalTo("user", currentUser.id);
    result_query.find({

    success: function(results) {

        user_result = [];
        $scope.distances = [];
        $scope.correct = 0;
        $scope.incorrect = 0;
        $scope.best_guess = 50000;
        for (var i = 0; i < results.length; i++) {
          var object = results[i];
          user_result.push(object.get('locationId'));
          
          // Counts wins and losses
          if (object.get('distance') < 501) {
            $scope.correct = $scope.correct + 1;
          } else {
            $scope.incorrect = $scope.incorrect +1 ;
          }
          // End of counting wins and losses

          // Best guess
          if (object.get('distance') < $scope.best_guess) {
            $scope.best_guess = object.get('distance');
            $scope.best_guess = $scope.best_guess.toFixed(0);
          }
          // End of best guess

          $scope.distances.push(object.get('distance'));
        }

      


        var CoorList = Parse.Object.extend("CoorList");
        var query = new Parse.Query(CoorList);
        query.containedIn("objectId", user_result);
        query.ascending("createdAt");
        query.find({
                  
        success: function(locations) {
          
          window.localStorage['played_locations'] = JSON.stringify(locations);
          var testObject = JSON.parse(window.localStorage['played_locations']);
          $scope.played_locations = testObject;
          $ionicLoading.hide();
            
        },

        error: function(error){
          alert("Error: " + error.code + " " + error.message);
          $ionicLoading.hide();
        }

      });

      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
        $ionicLoading.hide();
      }
    });
    // END OF PARSE DB QUERY

  }
  // End of getlocations


  // TAP TO GO TO FULLSCREEN
  $scope.fullscreenImage = function (item,event) {
    var imageObject = $scope.played_locations[item];
    var distance = $scope.distances[item];
    if (distance < 501) {
      var icon = 'checkmark';
    } else {
      var icon = 'close';
    }
    $state.go('resultfullscreen', {image_Link: encodeURI(imageObject.imageLink), answer: imageObject.Answer, distance: distance, icon: icon }) 
  }
  // END OF BUTTON TO GO FULLSCREEN



  $scope.deletedata = function () {
    var Result = Parse.Object.extend("Result");
    var result_query = new Parse.Query(Result);
    result_query.equalTo("user", currentUser.id);
    result_query.find({

    success: function(results) {

        
        for (var i = 0; i < results.length; i++) {

                results[i].destroy({
                  success: function(myObject) {
                    // The object was deleted from the Parse Cloud.
                    console.log('success');
                  },
                  error: function(myObject, error) {
                    // The delete failed.
                    // error is a Parse.Error with an error code and message.
                    console.log('error');
                  }
                });
        }

      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
        $ionicLoading.hide();
      }
    });
    // END OF PARSE DB QUERY
  }

  // FACEBOOK STUFF
  var access_token = currentUser._serverData.authData.facebook.access_token;
  // console.log(currentUser._serverData.authData.facebook);
  var fb_prof_json_link = 'https://graph.facebook.com/me?fields=id,name,email,picture{url,height,is_silhouette,width}&access_token='+access_token;

   $http.get(fb_prof_json_link).then(function(resp) {
    // For JSON responses, resp.data contains the result
    // console.log(resp.data);
    $scope.profile_image = resp.data.picture.data.url;
    $scope.username = resp.data.name;

  }, function(err) {
    console.error('ERR', err);
    // err.status will contain the status code
  })
  // End of facebook stuff

});
