/* This is the code that builds the trials for Part Two, the language training part of the experiment.
It builds four blocks of 64 trials for the participant to complete, with a few seconds of feedback between each trial.
It also gives the participants two blocks of five questions about the family and how they are related, to refresh their memory

******************
*****FUNCTIONS****
******************
*/

// returns a random element from a list
function pick_random(list) {
  var random = list[Math.floor(Math.random()*list.length)];
  return random}

// build a canvas with the specified greeter, greetee, and greeting
// if it's a feedback subtrial, add a tick or cross
function build_greeting_canvas(canvas,image1,image2,kin_term,feedback_trial=false,last_trial_correct=false){
  var ctx = canvas.getContext("2d")
  ctx.font = '30px Arial';
  ctx.fillText('luha, ' + kin_term,235,95)
  var greeter = make_image_object(image1)
  var greetee = make_image_object(image2)
  var bubble = make_image_object('speechbubble')
  bubble.onload = function(){ctx.drawImage(bubble,140,-5)}
  greeter.onload = function(){ctx.drawImage(greeter,-50,80)}
  greetee.onload = function(){ctx.drawImage(greetee,400,80)}
  if(feedback_trial == true) {
    var tick = make_image_object('correct');
    var cross = make_image_object('wrong');
    if(last_trial_correct == true){tick.onload = function(){ctx.drawImage(tick,865,100)}}
    else{cross.onload = function(){ctx.drawImage(cross,865,100)}}
  } else {}}

/*
****************
*****TRIALS*****
****************
*/

// build the instruction screen
var instruction_screen_learning = {
  type: 'instructions',
  pages: ["<h3>Part Two: Learning a new language</h3>\
  <p>Welcome to the second phase of the experiment.\
  <p>Please read the following instructions carefully, clicking 'Next' to continue to the next page when you're ready.</p>",

  "<h3>Part Two: Learning a new language</h3>\
  <p style='text-align:left'>During your research on this remote community, you have noticed that different members of the community greet each other in different ways.</p>\
  <p style='text-align:left'>In fact, you have discovered it is very important to greet everyone appropriately, according to the relationship between the people who are greeting each other.</p>\
  <p style='text-align:left'>In this phase of the experiment, your goal is to learn the greeting system of this community.</p>",

  "<h3>Part Two: Learning a new language</h3>\
  <p style='text-align:left'>You will see images of these individuals greeting each other using the greeting 'luha', which means something like 'hello' in English, and another word. This second word expresses the relationship between the individuals.</p>\
  <p style='text-align:left'>Your training will consist of four blocks, with 32 questions in each block. There are two kinds of questions:</p>\
  <p style='text-align:left'>Sometimes, when you see one member of the community greet another, part of the greeting will be obscured. You will have to complete the greeting by clicking on the correct word.</p>\
  <p style='text-align:left'>Other times, you will see one person say a greeting, but the recipient of the greeting will be obscured. You will have to guess who is being greeted by clicking on the correct person.",

  "<h3>Part Two: Learning a new language</h3>\
  <p style='text-align:left'>The task will be very difficult initially, but you will learn by trial and error. Don't worry if you get everything wrong at the start - we expect you to make mistakes! Things will get easier as you learn the language and greeting system of the community, \
  and we will give you feedback after each question so you can learn from your mistakes.</p>\
  <p style='text-align:left'>Each word you learn can be used to refer to more than one person - remember, these words refer to the relationships between individuals, not the individuals themselves. Additionally, some words have more than one meaning and may be used by the same individual to refer to more than one person. In other words, there may be more than one correct response to each question!</p>\
  <p style='text-align:left'>Try to keep in mind the relationships between individuals. After the first and second block, you will get a quick refresher on the community and how they are related to one another.</p>\
  <p style='text-align:left'>This phase of the experiment will take about 20-25 minutes.</p>\
  <p style='text-align:left'>Press 'Next' when you are ready to begin.</p>"],
  allow_keys:false,
  show_clickable_nav:true}

// build the instruction screen for when participants see extra familiarisation trials
var instruction_screen_retest = {
  type: 'html-button-response',
  stimulus: "<h3>Time for a refresher</h3>\
  <p style='text-align:left'>Before you continue learning how the community greet each other, refresh your memory on how these characters are related by answering a few questions about them.\
  <p style='text-align:left'>You've already done this once: you will be asked questions about the relationships between individuals in the community, just like in Phase One. There will only be five questions this time.\
  <p style='text-align:left'>Click the button below when you are ready to continue.",
  choices: ["Continue"]
}

// builds a production training trial with feedback
function make_production_trial(relationship,person1,person2,correct_label,labels,block) {
  var trial = {type:'sidebyside-canvas-button-response',
               stimulus:function (c) {build_greeting_canvas(c,person1,person2,'_______')}, // the label will always be blank
               canvas_size: [500,625],
               prompt: "<p>Choose a word to finish the greeting.</p>",
               //show two labelled buttons and have the participant select
               timeline: [{choices: labels,
                          //randomise the left-right order of the labels and note that randomisation in data
                           on_start: function(trial) {
                              trial.data = {block:'learning', 
                                            block_number: block,
                                            type:'production',
                                            button_choices:labels,
                                            correct_answer:correct_label,
                                            relationship: relationship}},
                            //figure out which label they selected, and add that to data
                            on_finish: function(data) {
                              var button_number = data.response
                              var button_pressed = data.button_choices[button_number]
                              data.button_selected = button_pressed
                              data.greeter = person1
                              data.greetee = person2
                              data.label = "?"
                              if(button_pressed === correct_label){data.correct = true;} 
                              else {data.correct = false;}
                              save_kinship_data(data)}},
                          // now provide feedback on participant response
                          {stimulus:function(c) {
                              // find out if the last trial was answered correctly and rebuild the stim with feedback set to True
                              var last_trial_correct = jsPsych.data.get().last(1).values()[0].correct
                              build_greeting_canvas(c,person1,person2,correct_label + '!',true,last_trial_correct)},
                           canvas_size: [500,1500],
                           choices:labels,
                           button_html:'<button style="visibility: hidden;" class="jspsych-btn">%choice%</button>',
                           trial_duration: 3000,
                           prompt:function(){
                              var last_trial_correct = jsPsych.data.get().last(1).values()[0].correct
                              var mistake = jsPsych.data.get().last(1).values()[0].button_selected
                              // if correct, print correct. if incorrect, show them the correct response
                              if(last_trial_correct){return "<p><br>Correct! <b>" + correct_label + "</b> is the right greeting."} 
                              else {return "<p><br>Incorrect! You chose <b>"+ mistake + "</b>, but the correct greeting is <b>" + correct_label + "</b>."}},
                          }
              ]}
  return trial}

// builds a comprehension trial with feedback
function make_comprehension_trial(relationship,person1,correct_answers,correct_response,stims,label,block) {
  var trial = {type:'sidebyside-canvas-img-button-response',
               stimulus:function (c) {build_greeting_canvas(c,person1,'mysteryperson',label + '!')},
               canvas_size: [500,625],
               prompt: "<p>Choose who is being greeted.</p>",
               timeline: [{choices: stims,
                           button_html: '<button class="jspsych-btn"> <img src="pics/%choice%_tiny_button_size.png"></button>', // buttons are images
                           on_start: function(trial) {
                              trial.data = {block:'learning',
                                            block_number: block,
                                            type:'comprehension',
                                            button_choices:stims,
                                            correct_answer:correct_answers,
                                            relationship: relationship}},
                            on_finish: function(data) {
                              var button_number = data.response
                              var button_pressed = data.button_choices[button_number]
                              data.button_selected = button_pressed
                              data.greeter = person1
                              data.greetee = "?"
                              data.label = label
                              if(correct_answers.includes(button_pressed,0) === true){data.correct = true}
                              else{data.correct = false}
                              save_kinship_data(data)}},
                          {stimulus:function(c) {
                              var last_trial_correct = jsPsych.data.get().last(1).values()[0].correct
                              var button_pressed = jsPsych.data.get().last(1).values()[0].button_selected
                              if(last_trial_correct){build_greeting_canvas(c,person1,button_pressed,label + '!',true,last_trial_correct)}
                              else{build_greeting_canvas(c,person1,correct_response,label + '!',true,last_trial_correct)}},
                           canvas_size: [500,1500],
                           choices: stims,
                           button_html:'<button style="visibility: hidden;" class="jspsych-btn">%choice%</button>',
                           trial_duration: 3000,
                           prompt:function(){
                              var last_trial_correct = jsPsych.data.get().last(1).values()[0].correct
                              if(last_trial_correct){return "<p><br>Correct! See the full correct greeting on the left."} 
                              else {return "<p><br>Incorrect! See the full correct greeting on the left."}},
                            on_start: function(trial){
                              choices = jsPsych.data.get().last(1).values()[0].button_choices
                              trial.choices = choices
                            }
                           }
              ]}
  return trial}

// build a list of the correct answers for each trial (there may be more than one)
function find_correct_answers(list,greeter){
  var correct_answers = []
    for(var j of list){
    if(j[0] === greeter){
    correct_answers.push(j[1])}}
  return correct_answers}

// builds an array of production trials, one for each relationship, randomising stims and choices
function build_production_trials(stims,relationships,kinship_dictionary,block) {
  var production_trials = []
  for(i of Object.keys(relationships)){
    var pair = pick_random(relationships[i])
    production_trials = [].concat(production_trials,make_production_trial(i,pair[0],pair[1],kinship_dictionary[i],stims,block))}  
  return production_trials}

// builds an array of comprehension trials, one for each relationship, randomising stims and choices
function build_comprehension_trials(stims,relationships,kinship_dictionary,kinship_system,block){
  var comprehension_trials = []
  for(var i of Object.keys(relationships)){
    var pair = pick_random(relationships[i])
    var greeting = kinship_dictionary[i]
    correct_answers = find_correct_answers(kinship_system[greeting],pair[0])
    var choices = stims.filter(function(e) {return e !== pair[0]}) // avoids duplicate buttons by filtering the correct person from the distractors
    comprehension_trials = [].concat(comprehension_trials,make_comprehension_trial(i,pair[0],correct_answers,pair[1],choices,greeting,block))}
  return comprehension_trials}

// builds an array of alternating production and comprehension trials
function interleave(array1,array2){
  var result = array1.reduce(function(arr,v,i){
    return arr.concat(v,array2[i])}, [])
  return result
  }

var block1_prod = jsPsych.randomization.shuffle(build_production_trials(kinship_terms_extra,relationships,kinship_dictionary,'1'))
var block1_comp = jsPsych.randomization.shuffle(build_comprehension_trials(images,relationships,kinship_dictionary,kinship_system,'1'))
var block1 = interleave(block1_prod,block1_comp)

var block2_prod = jsPsych.randomization.shuffle(build_production_trials(kinship_terms_extra,relationships,kinship_dictionary,'2'))
var block2_comp = jsPsych.randomization.shuffle(build_comprehension_trials(images,relationships,kinship_dictionary,kinship_system,'2'))
var block2 = interleave(block2_prod,block2_comp)

var block3_prod = jsPsych.randomization.shuffle(build_production_trials(kinship_terms_extra,relationships,kinship_dictionary,'3'))
var block3_comp = jsPsych.randomization.shuffle(build_comprehension_trials(images,relationships,kinship_dictionary,kinship_system,'3'))
var block3 = interleave(block3_prod,block3_comp)

var block4_prod = jsPsych.randomization.shuffle(build_production_trials(kinship_terms_extra,relationships,kinship_dictionary,'4'))
var block4_comp = jsPsych.randomization.shuffle(build_comprehension_trials(images,relationships,kinship_dictionary,kinship_system,'4'))
var block4 = interleave(block4_prod,block4_comp)

// builds a random array of familiarisation tests from the full array defined in family_familiarisation.js
function retests(list){
  test_list = []
  for(i = 0; i < 5; i++){
    var test = pick_random(list)
    list = list.filter(function(e) {return e !== test})
    test_list = [].concat(test_list,test)}
  return test_list
}

retest1 = retests(all_tests)
retest2 = retests(all_tests)

var learning_timeline = [].concat(
    instruction_screen_learning,
    block1,
    instruction_screen_retest,
    retest1,
    block2,
    instruction_screen_retest,
    retest2,
    block3,
    block4)
