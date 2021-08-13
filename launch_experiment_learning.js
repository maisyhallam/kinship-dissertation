/* This is the code that builds the experiment for participants in the learning only condition.
It contains everything that needs to run before the experiment begins, like preloading the images in advance.
It builds the timeline of trials - each individual section's timeline is built in the code file for that phase of the experiment */

// get the participant's prolific ID
var participant_id = jsPsych.data.getURLVariable('PROLIFIC_PID')

// build a list of all the image stimuli we'll need
function list_of_stims() {
    stims = []
    for(i=1;i<13;i++) {
      stims.push('pics/' + i + '.png')
      stims.push('pics/' + i + '_button_size.png')
      stims.push('pics/' + i + '_tiny_button_size.png')}
    stims.push('pics/mysteryperson.png','pics/speechbubble.png','pics/wrong.png','pics/correct.png', 'pics/arrow.png', 'pics/567.png', 'pics/8910.png',
    'pics/1and2.png','pics/3and4.png','pics/6and9.png', 'pics/1and2_button_size.png','pics/3and4_button_size.png','pics/6and9_button_size.png')
    return stims
  }
  
// a trial that preloads all the necessary images
  var preload = {
    type: 'preload',
    images: list_of_stims(),
    message: '<p>Loading experiment...',
    error_message: '<p>The experiment failed to load. Please refresh the page to try again.'
  }

// a trial that obtains the participants' consent
var consent_screen = {
    type: 'html-button-response',
    stimulus: "<h3>Welcome to the experiment</h3> \
    <p style='text-align:left'>This is an experiment about family relationships, and how we express them through language. It should take around 45 minutes\
    to complete, and you will be paid £6 for your participation.\
    <p style='text-align:left'> This experiment is being conducted by Maisy Hallam at The University of Edinburgh as part of a Masters dissertation project. \
    It has been granted ethical approval by the School of Philosophy, Psychology and Language Sciences Ethics Board.\
    <p style='text-align:left'> Before you begin, please take a moment to read <a href='./consent_form_cond_1.pdf' target='_blank' rel='noopener noreferrer'>this information letter</a>, which explains your rights and the terms of your participation.</p> \
    <p style='text-align:left'>By pressing the button below, you are confirming that: \
    <p style='text-align:left'> 1. You are over the age of 18.\
    <p style='text-align:left'> 2. You have read the information letter.\
    <p style='text-align:left'> 3. You voluntarily agree to participate, and understand you can stop participation at any time. \
    <p style='text-align:left'> 4. You agree that your anonymous data may be kept permanently by The University of Edinburgh archives and may be used by \
    qualified researchers for teaching and research purposes. </p>",
    choices: ['Yes, I consent to participate'],
}

// build the full timeline
var full_timeline = [].concat(preload, consent_screen,
    familiarisation_timeline,
    learning_timeline,
    test_timeline)
    
var PROLIFIC_COMPLETION_CODE = "4A73774A" //needed for submission by redirect at end

// initialise jsPsych
jsPsych.init({
timeline: full_timeline
   });