/* This is one part of the code for Phase Three of the experiment for participants in the communication condition.
It contains the functions that build the trials for this communication game, and launches the server that pairs up
the participants and allows them to play the game. The trials are actually built in the diss_dyadic_interaction_server.py file,
as the timeline is built up dynamically depending on participant's responses.

***************
****LAUNCH*****
***************
*/

var my_port_number = 9020

var start_interaction_loop = {type:'call-function',
                              func: interaction_loop} // from the file diss_dyadic_interaction_utilities.js

/*
***************
****TRIALS*****
***************
*/

// builds a canvas with the specified greeter, greetee and greeting
// if it's a feedback trial, also add a tick or a cross
// images have a different placement compared to the canvas-building function in kinship_learning.js 
function build_greeting_canvas_int(canvas,image1,image2,kin_term,feedback_trial=false,last_trial_correct=false){
  var ctx = canvas.getContext("2d")
  ctx.font = '30px Arial';
  ctx.fillText('luha, ' + kin_term,285,95)
  var greeter = make_image_object(image1)
  var greetee = make_image_object(image2)
  var bubble = make_image_object('speechbubble')
  bubble.onload = function(){ctx.drawImage(bubble,190,-5)}
  greeter.onload = function(){ctx.drawImage(greeter,0,80)}
  greetee.onload = function(){ctx.drawImage(greetee,450,80)}
  if(feedback_trial == true) {
    var tick = make_image_object('correct');
    var cross = make_image_object('wrong');
    if(last_trial_correct == true){tick.onload = function(){ctx.drawImage(tick,245,250)}}
    else{cross.onload = function(){ctx.drawImage(cross,245,250)}}
  } else {}}


// build the instruction screen
  var instruction_screen_enter_waiting_room = {
    type: 'instructions',
    pages: ["<h3>Part Three: Communicating with a partner</h3>\
    <p>Welcome to the final phase of the experiment.\
    <p>Please read the following instructions carefully, clicking 'Next' to continue to the next page when you're ready.</p>",

    "<h3>Part Three: Communicating with a partner</h3>\
    <p style='text-align:left'>Back at your research facility, you are working with fellow anthropologists to uncover more information about the language of this remote mountain village community. Together, you practice communicating in their language in order to understand it better.\
    <p style='text-align:left'>In this part of the experiment, you will be paired up with another participant of this experiment to play a communication game.</p>\
    <p style='text-align:left'>In this game, you will see more greetings between members of the community. Like before, sometimes part of the greeting will be obscured, \
    and sometimes the person being greeted will be obscured. </p>",

    "<h3>Part Three: Communicating with a partner</h3>\
    <p style='text-align:left'>The communication game will have 64 rounds. In each round, one partner plays the director role and one plays the matcher role. Roles will swap after each round.\
    <p style='text-align:left'>The director will see the person speaking the greeting and the person being greeted, but part of the greeting will be obscured. It is their job to \
    choose the word that best identifies the person being greeted in this context, and send it to their partner.</p>\
    <p style='text-align:left'>The matcher will then be sent the same greeting image, but with the person being greeted obscured. \
    They will have to choose who was being greeted based on who the greeter is and what word their partner chose to help them identify the greetee.</p>\
    <p style='text-align:left'>Don't worry if you can't remember all of the greetings you learned. If the matcher chooses the correct person, the pair wins the round \
    regardless of which greeting was chosen by the director.</p>\
    <p style='text-align:left'>Both partners will receive feedback after each round, so you'll be able to see what you get right and where you make mistakes.",

    "<h3>Part Three: Communicating with a partner</h3>\
    <p style='text-align:left'>Remember, you will be playing this game with another participant in real time. Please be considerate of your partner by giving your responses promptly, so they don't have to wait for you.</p>\
    <p style='text-align:left'>This phase of the experiment will take about 10-15 minutes. When you are ready to continue, press 'Next' to take you to the waiting room, where you will wait to be automatically paired with another player.</p>"],
    allow_keys:false,
    show_clickable_nav:true
  }

// build a trial that puts participants in a waiting room to be paired
// after five minutes the trial ends and please_return() is called, giving participants instructions for ending the experiment
function waiting_room(){
var waiting_room_trial = {type:'html-keyboard-response',
                          stimulus:"<h3>You are in the waiting room</h3>\
                          <p>Please wait here to be paired with another participant to play the communication game.</p>\
                          <p>This may take a few minutes - we really appreciate your patience at this point.\
                          <p>If you are not paired after five minutes, you will be automatically redirected and given further instructions to claim payment.",
                          choices:[],
                          trial_duration: 300000,
                          on_start:function(trial){
                            var start = performance.now()
                            trial.data = {start_time: start}
                            console.log(start)
                          },
                          on_finish:function(data) {
                            data.end_time = performance.now()
                            console.log(data.start_time)
                            console.log(data.end_time)
                            console.log(data.end_time - data.start_time)
                            if(data.end_time - data.start_time < 300000){
                            data.wait = true
                            jsPsych.pauseExperiment()}
                            else{please_return()}}
                          }
  jsPsych.addNodeToEndOfTimeline(waiting_room_trial)
  jsPsych.resumeExperiment()
}

// gives participants further instructions if they aren't paired within five minutes
function please_return(){
end_waiting() //end any current waiting trial
var return_screen = {type: 'html-keyboard-response',
                    stimulus: "<h3>We couldn't find you a partner</h3>\
                    <p>We were unable to find a partner for you to complete the interaction game with. We're sorry about that, but you will still be compensated for your time.</p>\
                    <p>Please <b>return the experiment</b> and contact the researcher. <b>Do not submit with NOCODE</b>. After you inform the researcher that you were not paired, you will be paid £4 for completing the language training.</p>",
                    choices: [],
                    on_start:function(data){
                      data.trial_type = 'no_partner'
                    },
                    on_finish:function(data){
                            save_kinship_data(data)
                            jsPsych.pauseExperiment()}}
  jsPsych.addNodeToEndOfTimeline(return_screen)
end_experiment_early()
}

// informs a participant that it's their partner's turn to complete a trial
function waiting_for_partner() {
  end_waiting() 
  var waiting_trial = {type:'html-keyboard-response',
                       stimulus:"<h3>Waiting for partner</h3>\
                       <p>It's your partner's move! Please wait for them to respond.</p>",
                       choices:[],
                       on_finish:function(data) {
                         data.wait = true
                         jsPsych.pauseExperiment()}}
  jsPsych.addNodeToEndOfTimeline(waiting_trial)
  jsPsych.resumeExperiment()
}

// forcibly ends any infinite waiting trial
function end_waiting() {
  if (jsPsych.currentTrial().wait=true) {
    jsPsych.finishTrial()}
}

// after participants are paired, inform them they are paired
function show_interaction_instructions() {
  end_waiting()
  var instruction_screen_interaction = {type: 'html-button-response',
                                        stimulus: "<h3>Connected!</h3>\
                                                  <p>You've been paired with another player!</p>\
                                                  <p>Press the button below to begin the game.</p>",
                                        choices: ['Continue'],
                                        on_finish:function() {
                                          send_to_server({response_type:"INTERACTION_INSTRUCTIONS_COMPLETE"})
                                          jsPsych.pauseExperiment()
                                        }
                                      }
  jsPsych.addNodeToEndOfTimeline(instruction_screen_interaction)
  jsPsych.resumeExperiment()
}

// if a participant's partner drops out, give them further instructions for finishing the experiment
function partner_dropout() {
  end_waiting()
  var stranded_screen = {type: 'html-button-response',
                         stimulus: "<h3>Oh no, something has gone wrong!</h3>\
                                    <p style='text-align:left'>Unfortunately, it looks like your partner has dropped out. This means you won't be able to complete the full experiment.</p>\
                                    <p style='text-align:left'>We're sorry about that, but you will still be compensated for your time.</p>\
                                    <p style='text-align:left'>Please <b>return the experiment</b> and contact the researcher. <b>Do not submit with NOCODE</b>. After you have informed the researcher that your partner dropped out, you will receive a payment of £4.</p>", // check with kenny!!!
                         choices: [],
                         on_finish: function(){
                           jsPsych.endCurrentTimeline()
                         }}
  jsPsych.addNodeToEndOfTimeline(stranded_screen)
end_experiment_early()
}

// build the final screen for the experiment
function end_experiment() {
  var final_screen = {type: 'survey-text',
                      preamble: "<h3>Finished!</h3>\
                      <p style='text-align:left'>You completed the experiment - well done! Thank you for participating in this study.</p>\
                      <p style='text-align:left'>When you click 'Submit and end experiment', you will finish the experiment and be redirected back to Prolific to submit your completion code. When this is done, you will be able to receive your payment.</p>\
                      <p style='text-align:left'>Before you go, please feel free to leave any thoughts or feedback on the experiment in the text box below if you would like to. If you took notes, you could also tell us here what kind of things you wrote down. For any direct queries, complaints or concerns \
                      please contact the researcher or email Maisy at M.Hallam@sms.ed.ac.uk.</p>",
                      questions: [{prompt:"Please leave any feedback below.",required:false,rows:5,columns:40,name:'comments'}],
                      button_label: "Submit and end experiment",
                      on_finish:function(data) {
                                var comments = (data.response.comments).replace(/,/g, "");
                                var demo_data = {comments: comments}
                                save_demographics_data(demo_data)
                                close_socket()
                                jsPsych.endCurrentTimeline()
                                window.location = "https://app.prolific.co/submissions/complete?cc=" + PROLIFIC_COMPLETION_CODE;}}
  jsPsych.addNodeToEndOfTimeline(final_screen)
  jsPsych.resumeExperiment()
}

// build the final screen for the experiment if the participant has to finish early e.g. due to partner drop out
function end_experiment_early() {
  var final_screen = {type: 'survey-text',
                      preamble: "<h3>Finished!</h3>\
                      <p style='text-align:left'>Thank you for participating in this study. We're sorry that technical difficulties prevented you from completing it fully.</p>\
                      <p style='text-align:left'>Please make sure to <b>return this study</b> now and message the researcher to claim your £4 payment. Do not submit with NOCODE - your submission will be rejected if you do!</p>\
                      <p style='text-align:left'>Before you go, please feel free to leave any thoughts or feedback on the experiment in the text box below if you would like to. If you took notes, you could also tell us here what kind of things you wrote down. For any direct queries, complaints or concerns \
                      please contact the researcher or email Maisy at M.Hallam@sms.ed.ac.uk.</p>",
                      questions: [{prompt:"Please leave any feedback below.",required:false,rows:5,columns:40,name:'comments'}],
                      button_label: "Submit and end experiment",
                      on_finish:function(data) {
                                var comments = (data.response.comments).replace(/,/g, "");
                                var demo_data = {comments: comments}
                                save_demographics_data(demo_data)
                                close_socket()
                                jsPsych.endCurrentTimeline()}}
  jsPsych.addNodeToEndOfTimeline(final_screen)
  jsPsych.resumeExperiment()
}

/*
***************
**INTERACTION**
***************
*/

// build a director trial
function director_trial(relationship,person1,person2,correct_label,kinship_terms_extra,partner_id,block) {
    end_waiting()
    var trial = {type:'sidebyside-canvas-button-response',
                     stimulus:function(c){build_greeting_canvas(c,person1,person2,'_______')},
                     canvas_size: [500,625],
                     prompt:'<p>Choose a word to finish the greeting.</p>\
                     <p>Your partner will have to guess who is being greeted based on your choice.</p>',
                     choices: kinship_terms_extra,
                     on_start: function(trial) {
                                  trial.data = {choices: kinship_terms_extra,
                                                block:'interaction',
                                                block_number: block,
                                                relationship:relationship,
                                                type: "director",
                                                partner_id: partner_id,
                                                greeter: person1,
                                                greetee: person2,
                                                label: "?",
                                                correct_label: correct_label}},
                     on_finish: function(data) {
                         var button_number = data.response
                         var label_pressed = data.choices[button_number]
                         data.button_selected = label_pressed
                         save_kinship_data(data)
                         send_to_server({response_type:'RESPONSE',
                                         participant:participant_id,
                                         partner:partner_id,
                                         role:'Director',
                                         person1: person1,
                                         person2: person2,
                                         correct_label: correct_label,
                                         relationship:relationship,
                                         response: data.button_selected,
                                         block: block})
                        jsPsych.pauseExperiment()}}
    jsPsych.addNodeToEndOfTimeline(trial)
    jsPsych.resumeExperiment()}

// builds a matcher trial
function matcher_trial(relationship,person1,correct_person,images,label,partner_id,block) {
  end_waiting()
  var trial = {type:'sidebyside-canvas-img-button-response',
               stimulus: function (c){build_greeting_canvas(c,person1,'mysteryperson',label + '!')},
               canvas_size: [500,625],
               choices: images,
               button_html: '<button class="jspsych-btn"> <img src="pics/%choice%_tiny_button_size.png"></button>',
               prompt: "<p>Who is being greeted?</p>\
               <p>Your partner chose the word <b>" + label + "</b> to help you decide.</p>",
               on_start: function(trial) {
                            trial.data = {choices: images,
                                          block:"interaction",
                                          block_number: block,
                                          type: "matcher",
                                          partner_id: partner_id,
                                          relationship: relationship,
                                          greetee: "?",
                                          label: label,
                                          correct_answer: correct_person,
                                          }},
               on_finish: function(data) {
                  var button_number = data.response
                  data.button_selected = data.choices[button_number]
                  if(data.button_selected===correct_person){data.correct = true} else{data.correct = false}
                  save_kinship_data(data)
                  send_to_server({response_type:'RESPONSE',
                           participant:participant_id,partner:partner_id,
                           role:'Matcher',
                           person1:person1,
                           label:label,
                           correct_person:correct_person,
                           response:data.button_selected})
                  jsPsych.pauseExperiment()}}
  jsPsych.addNodeToEndOfTimeline(trial)
  jsPsych.resumeExperiment()}


/*
**************
***FEEDBACK***
**************
*/

// builds a feedback trial for the matcher
function display_matcher_feedback(score,person1,correct_person,kin_term) {
  end_waiting()
  if (score==1) {
    var prompt = "<p><br>Well done! You successfully understood who was being greeted."
    var last_trial_correct = true} 
  else {
    var prompt = "<p><br>You did not successfully understand who was being greeted. Here is the full correct greeting."
    var last_trial_correct = false}
  var feedback_trial = {type:'canvas-keyboard-response',
                        stimulus: function(c){build_greeting_canvas_int(c,person1,correct_person,kin_term + '!',true,last_trial_correct)},
                        canvas_size: [500,770],
                        prompt: prompt,
                        choices:[],
                        trial_duration:3000,
                        on_finish: function() {
                          send_to_server({response_type:'FINISHED_FEEDBACK'})
                          jsPsych.pauseExperiment()}}
    jsPsych.addNodeToEndOfTimeline(feedback_trial)
    jsPsych.resumeExperiment()
  }

// builds a feedback trial for the director
function display_director_feedback(score,person1,matcher_choice,kin_term) {
    end_waiting()
    if (score==1) {
      var prompt = "<p><br>Well done! You successfully conveyed who was being greeted."
      var last_trial_correct = true} 
    else {
      var prompt = "<p><br>You did not successfully convey who was being greeted - your partner chose the wrong person.</p>\
      <p>This is the greeting your partner thought you were trying to express.</p>"
      var last_trial_correct = false}
    var feedback_trial = {type:'canvas-keyboard-response',
                          stimulus: function(c){build_greeting_canvas_int(c,person1,matcher_choice,kin_term + '!',true,last_trial_correct)},
                          canvas_size: [500,770],
                          prompt: prompt,
                          choices:[],
                          trial_duration:3000,
                          on_finish: function() {
                            send_to_server({response_type:'FINISHED_FEEDBACK'})
                            jsPsych.pauseExperiment()}}
      jsPsych.addNodeToEndOfTimeline(feedback_trial)
      jsPsych.resumeExperiment()
    }

/*
***************
***TIMELINE****
***************
*/

// starts the timeline, which is then added to dynamically by diss_dyadic_interaction_server.py
var interaction_timeline = [].concat(instruction_screen_enter_waiting_room,
                              start_interaction_loop)

