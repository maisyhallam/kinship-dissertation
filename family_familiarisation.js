/* This is the code for Part One of the experiment, the family familiarisation phase.
It builds an introduction trial for each character, as well as a test trial to check the participant's comprehension, in a particular order.
It also shows 10 more test trials at the end in a random order.

******************
*****FUNCTIONS****
******************
*/

// a function that makes an image object, to reduce clutter later
function make_image_object(image){
    var image_object = new Image()
    image_object.src = 'pics/' + image + '.png'
    return image_object}
    
// a function that builds a canvas to introduce the characters and who they are descended from
function build_intro_canvas(canvas,image1,image2) {
    var ctx = canvas.getContext('2d')
    image2 = image2 || 'undefined'
    if(image2==='undefined'){
        var image1 = make_image_object(image1)
        image1.onload = function(){ctx.drawImage(image1,150,75)}}
    else{
    var image1 = make_image_object(image1)
    var image2 = make_image_object(image2)
    var arrow = make_image_object('arrow')
    image2.onload = function(){ctx.drawImage(image2,-50,75)}
    arrow.onload = function(){ctx.drawImage(arrow,420,220)}
    image1.onload = function(){ctx.drawImage(image1,550,75)}}}

// a function that builds a canvas with correct feedback if the participant answers the comprehension test correctly
function feedback_canvas(canvas,image1,image2,image3) {
    var ctx = canvas.getContext('2d')
    image2 = image2 || 'undefined'
    image3 = image3 || 'undefined'
    if(image2 === 'undefined'){
        var image1 = make_image_object(image1)
        image1.onload = function(){ctx.drawImage(image1,0,0)}}
    else{
        var image1 = make_image_object(image1)
        var image2 = make_image_object(image2)
        var image3 = make_image_object(image3)
    image1.onload = function(){ctx.drawImage(image1,0,0)}
    image2.onload = function(){ctx.drawImage(image2,150,0)}
    image3.onload = function(){ctx.drawImage(image3,300,0)}}
}

/*
******************
*******TRIALS*****
******************
*/

// build the instruction screen
var familiarisation_instructions = {
    type: 'instructions',
    pages: ["<h3>Part One: Meeting the family</h3>\
    <p>Welcome to the first phase of this three-part experiment.\
    <p>Please read the following instructions carefully, clicking 'Next' to continue to the next page when you're ready.</p>",

    "<h3>Part One: Meeting the family</h3>\
    <p style='text-align:left'>In this experiment, you are an anthropologist who has discovered a hidden population living in a remote and mountainous area of Europe. You are trying to gather information on this community, by getting to know its members and learning their language.\
    <p style='text-align:left'>The community consists of one extended family of 12 people who all live in the same household. In this first phase of the experiment, you will learn who the members of this community are. \
    <p style='text-align:left'>You will see pictures of these individuals as you are introduced to them. Try to learn who they are. You should pay particular attention to their physical appearance and who they are in relationship to the other members of the community.\
    <p style='text-align:left'>You will also be asked questions about the relationships between individuals to check your comprehension. This phase of the experiment will take about 5-10 minutes.\
    <p style='text-align:left'>Press 'Next' when you are ready to begin.</p>"],
    allow_keys:false,
    show_clickable_nav:true}

// builds the introduction trial
function introduction_trial(image1,prompt,image2){
    image2 = image2 || 'undefined'
    var trial = {type:'canvas-keyboard-response',
             stimulus: function(c){build_intro_canvas(c,image1,image2)},
             canvas_size: [500,770],
             prompt: prompt,
             choices: [],
             trial_duration: 4000}
    return trial
}

// builds a test trial
function make_test_trial(tester,prompt_text,choices,answer,feedback_text){
    // a subtrial that builds the test
    var test = {type:'sidebyside-image-button-response',
                stimulus:'pics/' + tester + '.png',
                prompt: "<p>" + prompt_text,
                choices: choices,
                button_html: '<button class="jspsych-btn"> <img src="pics/%choice%_button_size.png"></button>',
                on_start: function(trial) {
                    var shuffled_buttons = jsPsych.randomization.shuffle(trial.choices)
                    trial.choices = shuffled_buttons
                    trial.data = {block:'familiarisation_test',
                                  button_choices:shuffled_buttons}},
                  on_finish: function(data) {
                    var button_number = data.response
                    var button_pressed = data.button_choices[button_number]
                    data.button_selected = button_pressed
                    data.correct_answer = choices[0]
                    if(button_pressed === choices[0]){data.correct = true} 
                    else {data.correct = false}
                    save_kinship_data(data)}}
    // a subtrial that appears if the participant chooses the wrong character
    var incorrect_feedback = {type:'sidebyside-image-button-response',
                    stimulus: 'pics/' + tester + '.png',
                    prompt: "<p>Incorrect! Try again. " + prompt_text,
                    choices: [],
                    button_html: '<button class="jspsych-btn"> <img src="pics/%choice%_button_size.png"></button>',
                    on_start: function(trial){
                        buttons = jsPsych.data.get().last(1).values()[0].button_choices
                        trial.choices = buttons
                        trial.data = {block:'familiarisation_test_repeat',
                                      button_choices: buttons}},
                    on_finish: function(data){
                        var button_number = data.response
                        var button_pressed = data.button_choices[button_number]
                        data.button_selected = button_pressed
                        data.correct_answer = choices[0]
                        if(button_pressed === choices[0]){data.correct = true}
                        else {data.correct = false}
                        save_kinship_data(data)
                    }}
    // only show incorrect feedback if the most recent trial was answered incorrectly
    var conditional_node = {
        timeline:[incorrect_feedback],
        conditional_function: function(){
            var last_trial_correct = jsPsych.data.get().last(1).values()[0].correct
            if(last_trial_correct){return false} else {return true}
        }}
    // show incorrect feedback as many times as the participant chooses the wrong answer
    var trial = {timeline: [conditional_node],
        loop_function: function(data){
        var last_trial_correct = jsPsych.data.get().last(1).values()[0].correct
        if(last_trial_correct){return false}
        else {return true}}}
    // a subtrial that shows correct feedback
    var correct_feedback = {type:'image-button-response',
            stimulus: 'pics/' + answer + '.png',
            choices:[],
            trial_duration: 3000,
            prompt: "Correct! " + feedback_text}
    var test_timeline = {timeline:[test,trial,correct_feedback]}
    return test_timeline
}

// build all the trials individually - this had to be done by hand as we didn't want them randomised
var mimi_gonn_intro = introduction_trial('1and2','<p>This is <b>Mimi</b> and <b>Gonn</b>.')
var lulu_intro = introduction_trial('5','<p>Mimi and Gonn have a child together: <b>Lulu</b>.','1and2')
var rusk_intro = introduction_trial('7','<p>Mimi and Gonn have another child together: <b>Rusk</b>.','1and2')
var kiki_intro = introduction_trial('6','<p>Mimi and Gonn have a third child together: <b>Kiki</b>.','1and2')
var brodd_intro = introduction_trial('6and9','<p>Kiki and <b>Brodd</b> are in love.')
var nene_intro = introduction_trial('11','<p>Kiki and Brodd have a child together: <b>Nene</b>.','6and9')
var pip_intro = introduction_trial('12','<p>Kiki and Brodd have another child together: <b>Pip</b>.','6and9')
var rara_kupp_intro = introduction_trial('9','<p>Brodd lives with his parents, <b>Rara</b> and <b>Kupp</b>.','3and4')
var juju_intro = introduction_trial('8','<p>Rara and Kupp have another child together: <b>Juju</b>.','3and4')
var ferr_intro = introduction_trial('10','<p>Rara and Kupp have a third child together: <b>Ferr</b>.','3and4')

var test1 = make_test_trial('5',"Who is Lulu's parent?",['1','4','6','7'],'1',"Mimi is Lulu's parent.")
var test2 = make_test_trial('2',"Who is Gonn's child?",['7','11','12','1'],'7',"Rusk is Gonn's child.")
var test3 = make_test_trial('1and2',"Who is <b>not</b> Mimi and Gonn's child?",['12','5','6','7'],'567',"Lulu, Rusk and Kiki are Mimi and Gonn's children.")
var test4 = make_test_trial('6','Who does Kiki have children with?',['9','7','2','10'],'9',"Kiki has children with Brodd.")
var test5 = make_test_trial('12',"Who is Pip's parent?",['6','5','1','7'],'6',"Kiki is Pip's parent.")
var test6 = make_test_trial('3','Who does Rara have children with?',['4','2','7','9'],'4',"Rara has children with Kupp.")
var test7 = make_test_trial('8',"Who is Juju's parent?",['3','1','2','5'],'3',"Rara is Juju's parent.")
var test8 = make_test_trial('3and4',"Who is <b>not</b> Rara and Kupp's child?",['11','8','9','10'],'8910',"Juju, Brodd and Ferr are Rara and Kupp's children.")

var test9 = make_test_trial('11and12',"Who are Nene and Pip's parents?",['6and9','3and4','1and2'],'6and9',"Kiki and Brodd are Nene and Pip's parents.") 
var test10 = make_test_trial('6and9',"Who is Kiki and Brodd's child?",['12','5','10','7'],'12',"Pip is Kiki and Brodd's child.")
var test11 = make_test_trial('11',"Who is Nene's parent?",['9','10','5','1'],'9',"Brodd is Nene's parent.")
var test12 = make_test_trial('10',"Who is Ferr's parent?",['4','2','1','6'],'4',"Kupp is Ferr's parent.")
var test13 = make_test_trial('3',"Who is Rara's child?",['8','5','7','12'],'8',"Juju is Rara's child.")
var test14 = make_test_trial('9',"Who does Brodd have children with?",['6','5','8','10'],'6',"Brodd has children with Kiki.")
var test15 = make_test_trial('1',"Who does Mimi have children with?",['2','4','7','9'],'2',"Mimi has children with Gonn.")
var test16 = make_test_trial('6and9',"Who is Kiki and Brodd's child?",['11','5','10','1'],'11',"Nene is Kiki and Brodd's child.")
var test17 = make_test_trial('1',"Who is Mimi's child?",['7','12','8','11'],'7',"Rusk is Mimi's child.")

tests_unshuffled = [].concat(test9,test10,test11,test12,test13,test14,test15,test16,test17)
tests = jsPsych.randomization.shuffle(tests_unshuffled)
all_tests = [].concat(test1,test2,test3,test4,test5,test6,test7,test8,test9,test10,test11,test12,test13,test14,test15,test16,test17) // for randomly selecting refresher tests later

trials = [].concat(mimi_gonn_intro,lulu_intro,test1,
                rusk_intro,test2,
                kiki_intro,test3,
                brodd_intro,nene_intro,test4,
                pip_intro,test5,
                rara_kupp_intro,test6,
                juju_intro,test7,
                ferr_intro,test8,
                tests)

var familiarisation_timeline = [].concat(familiarisation_instructions,
                                    trials)