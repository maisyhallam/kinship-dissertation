/* This is the code for the trials in Part Three of the experiment for participants in the learning only condition.
It builds 64 test trials for the participant to complete without receiving any feedback. 


****************
*****TRIALS*****
****************
*/

// build the instruction screen
var instruction_screen_no_interaction = {
    type: 'instructions',
    pages: ["<h3>Part Three: Practicing the language</h3>\
    <p>Welcome to the final phase of the experiment.\
    <p>Please read the following instructions carefully, clicking 'Next' to continue to the next page when you're ready.</p>",

    "<h3>Part Three: Practicing the language</h3>\
    <p style='text-align:left'>You should now be quite familiar with how different members of this community greet each other. Before you wrap up your research in this \
    remote mountain village, let's just test what you have learned about this community and their language.</p>\
    <p style='text-align:left'>This phase of the experiment will look much like the previous one. This time, there will be 64 questions in total. You will be asked two kinds of questions:\
    <p style='text-align:left'>Sometimes, you will see one member of the community greet another. Part of the greeting will be obscured, and you will have to complete the greeting by clicking on the correct word. \
    <p style='text-align:left'>Other times, you will see one person say a greeting, but the recipient of the greeting will be obscured. You will have to guess who they are greeting by clicking on the correct person.",

    "<h3>Part Three: Practicing the language</h3>\
    <p style='text-align:left'>This time, you will not receive any feedback on your answers. Just do your best! Keep in mind the relationships between members of the community.\
    <p style='text-align:left'>This part of the experiment should take 5-10 minutes.\
    <p style='text-align:left'>Press 'Next' when you are ready to begin.</p>"], // include how long it takes, 5 minutes
    allow_keys:false,
    show_clickable_nav:true
  }

// build the end of experiment screen
var final_screen = {type: 'survey-text',
                      preamble: "<h3>Finished!</h3>\
                      <p style='text-align:left'>You completed the experiment - well done! Thank you for participating in this study.</p>\
                      <p style='text-align:left'>When you click 'Submit and end experiment', you will finish the experiment and be redirected back to Prolific to submit your completion code. When this is done, you will be able to receive your payment.</p>\
                      <p style='text-align:left'>Before you go, please feel free to leave any thoughts or feedback on the experiment in the text box below if you would like to. If you took notes, you could also tell us here what kind of things you wrote down. For any direct queries, complaints or concerns \
                      please email Maisy at M.Hallam@sms.ed.ac.uk.</p>",
                      questions: [{prompt:"Please leave any feedback below.",required:false,rows:5,columns:40,name:'comments'}],
                      button_label: "Submit and end experiment",
                      on_finish:function(data) {
                                var comments = (data.response.comments).replace(/,/g, "");
                                var demo_data = {comments: comments}
                                save_demographics_data(demo_data)
                                window.location = "https://app.prolific.co/submissions/complete?cc=" + PROLIFIC_COMPLETION_CODE;}} // redirect to prolific

// build a production test trial, where participants must select the correct label
function production_test_trial(relationship,person1,person2,correct_label,labels,block) {
    var trial = {type:'sidebyside-canvas-button-response',
                     stimulus:function(c){build_greeting_canvas(c,person1,person2,'_______')},
                     canvas_size: [500,625],
                     prompt:'<p>Choose a word to finish the greeting.</p>',
                     choices:labels,
                     on_start: function(trial) {
                                  trial.data = {block:'test',
                                                block_number:block,
                                                type: "production",
                                                choices:labels,
                                                greeter: person1,
                                                greetee: person2,
                                                correct_answer: correct_label,
                                                relationship: relationship}},
                     on_finish: function(data) {
                         var button_number = data.response
                         var label_pressed = data.choices[button_number]
                         data.button_selected = label_pressed // work out what label was on the button the participant chose
                         data.label = "?"
                         if(data.button_selected === correct_label){data.correct = true}
                         else{data.correct = false}
                         save_kinship_data(data)}}
    return trial}

// build a comprehension test trial, where participants must select the correct greetee
function comprehension_test_trial(relationship,person1,correct_answers,images,label,block) {
  var trial = {type:'sidebyside-canvas-img-button-response',
               stimulus: function (c){build_greeting_canvas(c,person1,'mysteryperson',label + '!')},
               canvas_size: [500,625],
               choices: images,
               button_html: '<button class="jspsych-btn"> <img src="pics/%choice%_tiny_button_size.png"></button>', // buttons are images
               prompt: "<p>Who is being greeted?</p>",
               on_start: function(trial){
                          trial.data = {choices: images,
                                        type: 'comprehension',
                                        block: 'test',
                                        block_number: block,
                                        greetee: '?',
                                        greeter: person1,
                                        label: label,
                                        correct_answer:correct_answers,
                                        relationship:relationship}
               },
               on_finish: function(data) {
                  var button_number = data.response
                  data.button_selected = data.choices[button_number] // work out which image the participant chose
                  if(correct_answers.includes(data.button_selected) === true){data.correct = true}
                  else{data.correct = false}
                  console.log(correct_answers)
                  console.log(data.button_selected)
                  save_kinship_data(data)}}
    return trial}

// build an array of production tests, one for each possible relationship
function build_production_tests(relationships,kinship_dictionary,kinship_terms_extra,block){
  var production_tests = []
  for(var i of Object.keys(relationships)){
    var pair = pick_random(relationships[i])
    production_tests = [].concat(production_tests,production_test_trial(i,pair[0],pair[1],kinship_dictionary[i],kinship_terms_extra,block))}
  return production_tests
}

// build an array of comprehension tests, one for each possible relationship
function build_comprehension_tests(relationships,kinship_dictionary,images,block){
  var comprehension_tests = []
  for(var i of Object.keys(relationships)){
    var pair = pick_random(relationships[i])
    var label = kinship_dictionary[i]
    correct_answers = find_correct_answers(kinship_system[label],pair[0])
    var choices = images.filter(function(e) {return e !== pair[0]}) // avoids duplicate buttons by filtering the greeter from the distractors
    comprehension_tests = [].concat(comprehension_tests,comprehension_test_trial(i,pair[0],correct_answers,choices,label,block))}
  return comprehension_tests
}

// concatenate two arrays of test trials as generated by the above functions, to get 64 test trials total, and randomise the order
var production_tests = [].concat(jsPsych.randomization.shuffle(build_production_tests(relationships,kinship_dictionary,kinship_terms_extra,'1')),jsPsych.randomization.shuffle(build_production_tests(relationships,kinship_dictionary,kinship_terms_extra,'2')))
var comprehension_tests = [].concat(jsPsych.randomization.shuffle(build_comprehension_tests(relationships,kinship_dictionary,images,'1')),jsPsych.randomization.shuffle(build_comprehension_tests(relationships,kinship_dictionary,images,'2')))

// alternate production trials with comprehension trials
function interleave(array1,array2){
  var result = array1.reduce(function(arr,v,i){
    return arr.concat(v,array2[i])}, [])
  return result
  }

var test_trials = interleave(production_tests,comprehension_tests)

test_timeline = [].concat(instruction_screen_no_interaction,
  test_trials,
  final_screen)