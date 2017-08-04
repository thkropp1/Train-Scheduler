

    // Initialize Firebase

  	var config = {
	    apiKey: "AIzaSyDuS8q4TzGPv3f1IxDHFCOqy5rHs5QXqt0",
	    authDomain: "in-class-demo-62eaa.firebaseapp.com",
	    databaseURL: "https://in-class-demo-62eaa.firebaseio.com",
	    projectId: "in-class-demo-62eaa",
	    storageBucket: "in-class-demo-62eaa.appspot.com",
	    messagingSenderId: "119386114995"
  	};
  	firebase.initializeApp(config);

    // Create a variable to reference the database
    var database = new firebase.database();

    // Initial Values
    var trainName = "";
    var dest = "";
    var time = "00:00";
    var freq = 0;
    var childKey;
    var getKey = '';
    var nextTrain = "00:00";
    var tMinutesTillTrain = 0;


    // Capture Button Click
    $("#add-train").on("click", function(event) {
      // Don't refresh the page!
      event.preventDefault();

      // Grab the user inputs and assign them to variables
      trainName = $("#name-input").val().trim();
      trainDest = $("#dest-input").val().trim();
      trainTime = $("#time-input").val().trim();
      trainFreq = parseInt($("#freq-input").val().trim());
      
      // Creates local "temporary" object for holding train schedule data
      var newTrain = {
        name: trainName,
        dest: trainDest,
        time: trainTime,
        freq: trainFreq
      };
      
      // Uploads train schedule data to the database
      database.ref().push(newTrain);

      // Logs everything to console
      console.log("Input Train name: " + newTrain.name);
      console.log("Input Destination: " + newTrain.dest);
      console.log("Input Start time: " + newTrain.time);
      console.log("Input Frequency(min): " + newTrain.freq);

      // Alert
      //alert("New train schedule successfully added!");

      // Clears all of the text-boxes
      $("#name-input").val("");
      $("#dest-input").val("");
      $("#time-input").val("");
      $("#freq-input").val("");

    });

    // auto-refresh page every 3 min - see corresponding code in body tag in index.html
    function AutoRefresh(t) {
    setTimeout("location.reload(true);", t);
    }

     // Create Firebase event for adding train schedule to the database and add a row in the html when a user adds an entry
     database.ref().on("child_added", function(childSnapshot, prevChildKey) { 
        
        //Tie this key to the remove button
        childKey = childSnapshot.key;
        console.log("childSnapshot.key: " + childKey);
        
        var cs = childSnapshot.val(); 

        // Log everything that's coming out of snapshot
        console.log("FB Train name: " + cs.name);
        console.log("FB Destination: " + cs.dest);
        console.log("FB Start time: " + cs.time);
        console.log("FB Frequency: " + cs.freq);

        // Call the function to calculate next train arrival time and minutes away and display in html
        calcTrainArrival(cs.time, cs.freq);

        // convert to AM/PM format
        nextTrain = moment(nextTrain).format("h:mm a");

        console.log("Next arrival: " + nextTrain);
        console.log("Minutes away: " + tMinutesTillTrain);

        // Display train schedules in the table on the page
        // Add each train's data into the table
        $("#train-table > tbody").append("<tr><td>" + cs.name + "</td><td>" + cs.dest + "</td><td>" +
        cs.freq + "</td><td>" + nextTrain + "</td><td>" + tMinutesTillTrain + "</td><td><button class='remove'>Delete</button></td></tr>");

        // Handle the errors
      }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });
  

     // Delete the entry when user clicks on the Delete button
     $(document).on("click", ".remove", function() { 
        console.log("Delete the entry with key#: " + childKey); 
        $(this).closest ('tr').remove();
        getKey = $(this).parent().parent().attr(childKey);
        database.child(getKey).remove(); // removes from html, but reload page it still appears.
     });

    // Call the function to calculate next train arrival time and minutes away
    function calcTrainArrival(startTime, freqInput) {

        var firstTime = startTime;
        var tFrequency = freqInput

        // First Time (pushed back 1 year to make sure it comes before current time)
        var firstTimeConverted = moment(firstTime, "hh:mm").subtract(1, "years");
        console.log("CONVERT START TIME: " + firstTimeConverted);

        // Current Time
        var currentTime = moment();
        console.log("CURRENT TIME: " + moment(currentTime).format("hh:mm"));

        // Difference between the times
        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
        console.log("DIFFERENCE IN TIME: " + diffTime);

        // Time apart (remainder)
        var tRemainder = diffTime % tFrequency;
        console.log("REMAINDER: " + tRemainder);

        // Minute Until Train
        tMinutesTillTrain = tFrequency - tRemainder;
        console.log("MINUTES AWAY: " + tMinutesTillTrain);

        // Next Train
        nextTrain = moment().add(tMinutesTillTrain, "minutes");
        console.log("NEXT ARRIVAL: " + moment(nextTrain).format("hh:mm"));

    }

    //Recalculate the Next Arrival and Minutes Away data once every 1 minute
    //setInterval(calcTrainArrival, 60000);