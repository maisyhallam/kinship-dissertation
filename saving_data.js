/*
*********************
*****SAVING DATA*****
*********************
*/

// a function to save data to the correct file
function save_data(name, data_in){
    console.log(name,data_in)
    var url = 'save_data.php';
    var data_to_send = {filename: name, filedata: data_in};
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(data_to_send),
        headers: new Headers({
                'Content-Type': 'application/json'
        })
    });
  }

// once the headers have been written once, we don't want them to be written again
var HEADERS_WRITTEN = false

// a function that specifies what data we want to save at each trial, and calls save_data to save it
function save_kinship_data(data) {
    if(data.correct_answer instanceof Array){var correct_answer = data.correct_answer.join(" ")} else{var correct_answer = data.correct_answer}
    if(data.correct == true){var correct_binary = '1'} else{var correct_binary = '0'}
    var data_to_save = [
        participant_id,
        data.partner_id,
        data.block,
        data.block_number,
        data.type,
        data.trial_index,
        data.greeter,
        data.greetee,
        data.label,
        data.relationship,
        data.button_selected,
        correct_answer,
        data.correct,
        correct_binary,
        data.time_elapsed
    ];
    var line = data_to_save.join(',')+"\n";
    if(!HEADERS_WRITTEN) {
        HEADERS_WRITTEN=true
        var headers = "participant_id,partner_id,block,block_number,trial_type,trial_index,greeter,greetee,label,relationship,\
        button_selected,correct_answer(s),correct_or_not,correct_binary,time_elapsed\n"
        line = headers+line}
    filename = 'kinship_' + participant_id + '.csv'
    save_data(filename,line);
}

// a function that lets us save the participant input from the comment box at the end of the experiment
function save_demographics_data(demograpics_data) {
    var filename = 'comments_kinship_' + participant_id + '.csv'
    var headers = "participant_id,comments\n"
    var data_to_save = [participant_id,
    demograpics_data.comments]
    var data_line = data_to_save.join(',')+"\n";
    save_data(filename,headers+data_line)
    }