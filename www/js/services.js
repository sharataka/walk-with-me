angular.module('starter.services', [])


.factory('Maps', function($ionicLoading) {
    
})

.factory('Chats', function($ionicLoading) {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
  }];

  return {
    
    all: function() {
      return chats;
    },
    
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    },


    getlocations: function(currentUser){


          var CoorList = Parse.Object.extend("CoorList");
          var query = new Parse.Query(CoorList);
          query.descending("createdAt");
          query.limit(7);
          query.find({
            success: function(locations) {

                var Result = Parse.Object.extend("Result");
                var result_query = new Parse.Query(Result);
                result_query.equalTo("user", currentUser.id);
                result_query.find({
                  
                  success: function(results) {

                    // Get list of locations that user has answered
                    user_result = [];
                    for (var i = 0; i < results.length; i++) {
                      var object = results[i];
                      user_result.push(object.get('locationId'));
                    }

                    // Get list of all locations
                    location_array = [];
                    // Do something with the returned Parse.Object values
                    for (var i = 0; i < locations.length; i++) {
                      var object = locations[i];
                      location_array.push(object.id);
                    }

                    // Get matching locations
                    mathching_locations_index = [];
                    for (var i = user_result.length; i >= 0 ; i--) {
                      var location_index = location_array.indexOf(user_result[i]);
                      mathching_locations_index.push(location_index);
                    }

                    // Sort matching locations by descending order
                    mathching_locations_index.sort(function(a,b){return b-a});
                    
                    // Remove items from locations array of objects
                    for (var i = 0; i < mathching_locations_index.length; i++) {
                      if (mathching_locations_index[i] > -1) {
                        locations.splice(mathching_locations_index[i],1);
                      }
                    }

                    

                    window.localStorage['locations'] = JSON.stringify(locations);
                    var testObject = JSON.parse(window.localStorage['locations']);
                    console.log(window.localStorage['locations']);
                      
                    if (locations.length == 0){
                      $scope.refresh_message = "You've played all of our pictures. But we'll have more tomorrow so come back...";
                    }

                    $ionicLoading.hide(); 

                    return testObject; 
                    

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
    // end of getlocations

  };
  // end of return


});
