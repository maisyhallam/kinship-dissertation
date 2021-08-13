//create a global websocket variable that we can access everywhere
var ws;

function interaction_loop() {
  //pause the timeline to stop us progressing past this point - incoming commands
  //from the server will unpause
  jsPsych.pauseExperiment()
  ws = new WebSocket("wss://blake4.ppls.ed.ac.uk/ws20/" + my_port_number)
  //when establishing connection for first time, send over the participant id
  ws.onopen = function() {
    console.log("opening websocket");
    details = JSON.stringify({response_type:'CLIENT_INFO',client_info:participant_id})
    ws.send(details) //send the encoded string to the server via the websocket
  };

  // when a message from the server is received, handle the command
  ws.onmessage = function(e) {
    // e.data contains received string.
    console.log("received message: " + e.data);
    var cmd = JSON.parse(e.data) //parse into a js object
    var cmd_code =  cmd.command_type
    handle_server_command(cmd_code,cmd) //handle the command
  }

  //when the server tells you to close the connection, close
  ws.onclose = function() {
    console.log("closing websocket");
    ws.close();
  };

  // when there is an error from the socket, calls partner_dropout()
  ws.onerror = function(e) {
    console.log(e)
    partner_dropout()
  };
}


// calls the appropriate function from dyadic_interaction.js depending on the command the server sent
function handle_server_command(command_code,command) {
  var possible_commands = ["PartnerDropout","EndExperiment","WaitingRoom","PleaseReturn",
                            "Instructions","Director","WaitForPartner","Matcher","MatcherFeedback","DirectorFeedback"]
  if (possible_commands.indexOf(command_code) == -1) { // if command is not in the list
    console.log("Received invalid code")
  }
  //if the received code is valid
  else {
    switch (command_code) {
      case "PartnerDropout": //PartnerDropout: your partner has dropped out
        partner_dropout() 
        break;
      case "EndExperiment": //EndExperiment: you have finished the experiment
        end_experiment() 
        break;
      case "WaitingRoom": //WaitingRoom: puts client in waiting room
        waiting_room()
        break;
      case "PleaseReturn":
        please_return()
        break;
      case "Instructions": //Instructions: Show instructions
        show_interaction_instructions() 
        break;
      case "WaitForPartner": //WaitForPartner: infinite waiting
        waiting_for_partner()
        break;
      case "Director": //Director: director trial
        director_trial(command.relationship,command.person1,command.person2,command.correct_label,command.kinship_terms_extra,command.partner_id,command.block)
        break;
      case "Matcher": //Matcher: matcher trial
        matcher_trial(command.relationship,command.person1,command.correct_person,command.images,command.label,command.partner_id,command.block)
        break;
      case "MatcherFeedback": //MatcherFeedback: feedback for matcher
        display_matcher_feedback(command.score,command.person1,command.correct_person,command.kin_term)
        break;
      case "DirectorFeedback": // DirectorFeedback: feedback for director
        display_director_feedback(command.score,command.person1,command.matcher_choice,command.kin_term)
        break;
      default: //this only fires if none of the above fires
        console.log('oops, default fired')
        break;
    }
  }
}

// if the websocket connection is open, send a message to the server and use JSON.stringify to convert the message object to a JSON string
// the python server can convert it from JSON to a python dictionary
function send_to_server(message_object) {
  if (ws.readyState === ws.OPEN) {ws.send(JSON.stringify(message_object))}
}

function close_socket() {
  ws.onclose()
}
