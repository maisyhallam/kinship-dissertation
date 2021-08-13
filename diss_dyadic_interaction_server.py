# -*- coding: utf-8 -*-

##############
# This is the code for the python server that interacts with the javascript client.
# In short, it dynamically builds the timeline for the interaction game by building
# trials based on participant input and sends trials to the participant based on their
# partner's choices.
##############

##############
# Libraries
##############

# load the code from the websocket server, and import some necessary packages
from websocket_server import WebsocketServer
import random
import json
import csv
import time
from copy import deepcopy
from timeit import default_timer


# Returns randomised copy of l
def shuffle(l):
    return random.sample(l, len(l))

######################
# Globals to manage experiment progress
######################

# a dictionary to store participant data, such as their client ID, their partner's ID, and where they are in the experiment
# Keys are client_info, partner, role, trial_list, shared_trial_counter
global_participant_data = {}

# a list of client IDs for clients who are in the waiting room waiting to be paired
unpaired_clients = []

# The list of phases in the experiment - clients progress through this list
phase_sequence = ['Start','PairParticipants','Interaction','End']


# Two lists of trials, independently shuffled. Each list is comprised of the 16 possible relationships, as we cycle through these four times
block1_trials = shuffle(['mother','father','maternal-aunt','maternal-uncle','paternal-aunt','paternal-uncle','maternal-grandmother','maternal-grandfather',
'paternal-grandmother','paternal-grandfather','grandson','granddaughter','son','daughter','brother','sister'])

block2_trials = shuffle(['mother','father','maternal-aunt','maternal-uncle','paternal-aunt','paternal-uncle','maternal-grandmother','maternal-grandfather',
'paternal-grandmother','paternal-grandfather','grandson','granddaughter','son','daughter','brother','sister'])

# reverse a list - so we can make sure later than each participant is the matcher twice and director twice for each relationship trial
def reverse(lst):
    return [ele for ele in reversed(lst)]

# the list of character images in a random order
images = shuffle(['1','2','3','4','5','6','7','8','9','10','11','12'])

# four lists of kinship terms, randomised for each participant. All the following data structures are identical to the ones in stims.js
kinship_terms = shuffle(['wiha','kasepiwa','losaku','kumisu','kawopame','pinisahe','wuwoho','kapa'])
kinship_terms_extra = shuffle(['wiha','kasepiwa','losaku','kumisu','kawopame','pinisahe','wuwoho','kapa','pomi','migisafo','wono','mafogeho'])

# kinship_terms = shuffle(['kolufi','gokowu','kasamusi','puwolohu','nimokufe','heko','nefupi','kuli'])
# kinship_terms_extra = shuffle(['kolufi','gokowu','kasamusi','puwolohu','nimokufe','heko','nefupi','kuli','lekoge','hahogi','felenomi','mifenamo'])

#kinship_terms = shuffle(['kapusimu','fola','holepa','pukawini','luguga','gowa','pumilo','kinu'])
#kinship_terms_extra = shuffle(['kapusimu','fola','holepa','pukawini','luguga','gowa','pumilo','kinu','mesaho','wali','hofohu','poho'])

# kinship_terms = shuffle(['lahi','nasike','nehikupa','gowa','powuwani','gewukahu','kifogama','lomufusu'])
# kinship_terms_extra = shuffle(['lahi','nasike','nehikupa','gowa','powuwani','gewukahu','kifogama','lomufusu','gowigi','kipi','sife','homisu'])

kinship_system = {
  'wiha': [['12','6'],['11','6'],['7','1'],['6','1'],['5','1'],['8','3'],['9','3'],['10','3'],['12','5'],['12','7'],['11','5'],['11','7']], # mother and her siblings
  'kasepiwa': [['6','12'],['6','11'],['9','12'],['9','11'],['1','7'],['1','6'],['1','5'],['2','7'],['2','6'],['2','5'],['3','8'],['3','9'],['3','10'],['4','8'],['4','9'],['4','10']], # child
  'losaku': [['12','9'],['11','9'],['7','2'],['6','2'],['5','2'],['8','4'],['9','4'],['10','4'],['12','8'],['12','10'],['11','8'],['11','10']], # father and his siblings
  'kumisu': [['12','11'],['10','8'],['9','8'],['5','6'],['6','5'],['7','6'],['7','5']], # sister
  'kawopame': [['11','12'],['8','9'],['8','10'],['9','10'],['10','9'],['5','7'],['6','7']], # brother
  'pinisahe': [['12','1'],['12','2'],['11','1'],['11','2']], # maternal grandparent
  'wuwoho': [['12','3'],['12','4'],['11','3'],['11','4']], # paternal grandparent
  'kapa': [['1','12'],['1','11'],['2','12'],['2','11'],['3','12'],['3','11'],['4','12'],['4','11']] # grandchild
}

# kinship_system = {
#   'kolufi': [['12','6'],['11','6'],['7','1'],['6','1'],['5','1'],['8','3'],['9','3'],['10','3'],['12','5'],['12','7'],['11','5'],['11','7']], # mother and her siblings
#   'gokowu': [['6','12'],['6','11'],['9','12'],['9','11'],['1','7'],['1','6'],['1','5'],['2','7'],['2','6'],['2','5'],['3','8'],['3','9'],['3','10'],['4','8'],['4','9'],['4','10']], # child
#   'kasamusi': [['12','9'],['11','9'],['7','2'],['6','2'],['5','2'],['8','4'],['9','4'],['10','4'],['12','8'],['12','10'],['11','8'],['11','10']], # father and his siblings
#   'puwolohu': [['12','11'],['10','8'],['9','8'],['5','6'],['6','5'],['7','6'],['7','5']], # sister
#   'nimokufe': [['11','12'],['8','9'],['8','10'],['9','10'],['10','9'],['5','7'],['6','7']], # brother
#   'heko': [['12','1'],['12','2'],['11','1'],['11','2']], # maternal grandparent
#   'nefupi': [['12','3'],['12','4'],['11','3'],['11','4']], # paternal grandparent
#   'kuli': [['1','12'],['1','11'],['2','12'],['2','11'],['3','12'],['3','11'],['4','12'],['4','11']] # grandchild
# }

# kinship_system = {
#   'kapusimu': [['12','6'],['11','6'],['7','1'],['6','1'],['5','1'],['8','3'],['9','3'],['10','3'],['12','5'],['12','7'],['11','5'],['11','7']], # mother and her siblings
#   'fola': [['6','12'],['6','11'],['9','12'],['9','11'],['1','7'],['1','6'],['1','5'],['2','7'],['2','6'],['2','5'],['3','8'],['3','9'],['3','10'],['4','8'],['4','9'],['4','10']], # child
#   'holepa': [['12','9'],['11','9'],['7','2'],['6','2'],['5','2'],['8','4'],['9','4'],['10','4'],['12','8'],['12','10'],['11','8'],['11','10']], # father and his siblings
#   'pukawini': [['12','11'],['10','8'],['9','8'],['5','6'],['6','5'],['7','6'],['7','5']], # sister
#   'luguga': [['11','12'],['8','9'],['8','10'],['9','10'],['10','9'],['5','7'],['6','7']], # brother
#   'gowa': [['12','1'],['12','2'],['11','1'],['11','2']], # maternal grandparent
#   'pumilo': [['12','3'],['12','4'],['11','3'],['11','4']], # paternal grandparent
#   'kinu': [['1','12'],['1','11'],['2','12'],['2','11'],['3','12'],['3','11'],['4','12'],['4','11']] # grandchild
# }

# kinship_system = {
#   'lahi': [['12','6'],['11','6'],['7','1'],['6','1'],['5','1'],['8','3'],['9','3'],['10','3'],['12','5'],['12','7'],['11','5'],['11','7']], # mother and her siblings
#   'nasike': [['6','12'],['6','11'],['9','12'],['9','11'],['1','7'],['1','6'],['1','5'],['2','7'],['2','6'],['2','5'],['3','8'],['3','9'],['3','10'],['4','8'],['4','9'],['4','10']], # child
#   'nehikupa': [['12','9'],['11','9'],['7','2'],['6','2'],['5','2'],['8','4'],['9','4'],['10','4'],['12','8'],['12','10'],['11','8'],['11','10']], # father and his siblings
#   'gowa': [['12','11'],['10','8'],['9','8'],['5','6'],['6','5'],['7','6'],['7','5']], # sister
#   'powuwani': [['11','12'],['8','9'],['8','10'],['9','10'],['10','9'],['5','7'],['6','7']], # brother
#   'gewukahu': [['12','1'],['12','2'],['11','1'],['11','2']], # maternal grandparent
#   'kifogama': [['12','3'],['12','4'],['11','3'],['11','4']], # paternal grandparent
#   'lomufusu': [['1','12'],['1','11'],['2','12'],['2','11'],['3','12'],['3','11'],['4','12'],['4','11']] # grandchild
# }

kinship_dictionary = {'mother': 'wiha',
'maternal-aunt':'wiha',
'maternal-uncle':'wiha',
'father':'losaku',
'paternal-aunt':'losaku',
'paternal-uncle':'losaku',
'son':'kasepiwa',
'daughter':'kasepiwa',
'sister':'kumisu',
'brother':'kawopame',
'grandson':'kapa',
'granddaughter':'kapa',
'maternal-grandmother': 'pinisahe',
'maternal-grandfather':'pinisahe',
'paternal-grandmother':'wuwoho',
'paternal-grandfather':'wuwoho'}

# kinship_dictionary = {'mother': 'kolufi',
# 'maternal-aunt':'kolufi',
# 'maternal-uncle':'kolufi',
# 'father':'kasamusi',
# 'paternal-aunt':'kasamusi',
# 'paternal-uncle':'kasamusi',
# 'son':'gokowu',
# 'daughter':'gokowu',
# 'sister':'puwolohu',
# 'brother':'nimokufe',
# 'grandson':'kuli',
# 'granddaughter':'kuli',
# 'maternal-grandmother': 'heko',
# 'maternal-grandfather':'heko',
# 'paternal-grandmother':'nefupi',
# 'paternal-grandfather':'nefupi'}

# kinship_dictionary = {'mother': 'kapusimu',
# 'maternal-aunt':'kapusimu',
# 'maternal-uncle':'kapusimu',
# 'father':'holepa',
# 'paternal-aunt':'holepa',
# 'paternal-uncle':'holepa',
# 'son':'fola',
# 'daughter':'fola',
# 'sister':'pukawini',
# 'brother':'luguga',
# 'grandson':'kinu',
# 'granddaughter':'kinu',
# 'maternal-grandmother': 'gowa',
# 'maternal-grandfather':'gowa',
# 'paternal-grandmother':'pumilo',
# 'paternal-grandfather':'pumilo'}

# kinship_dictionary = {'mother': 'lahi',
# 'maternal-aunt':'lahi',
# 'maternal-uncle':'lahi',
# 'father':'nehikupa',
# 'paternal-aunt':'nehikupa',
# 'paternal-uncle':'nehikupa',
# 'son':'nasike',
# 'daughter':'nasike',
# 'sister':'gowa',
# 'brother':'powuwani',
# 'grandson':'lomufusu',
# 'granddaughter':'lomufusu',
# 'maternal-grandmother': 'gewukahu',
# 'maternal-grandfather':'gewukahu',
# 'paternal-grandmother':'kifogama',
# 'paternal-grandfather':'kifogama'}

relationships = {'mother': [['12','6'],['11','6'],['7','1'],['6','1'],['5','1'],['8','3'],['9','3'],['10','3']],
'maternal-aunt': [['12','5'],['11','5']],
'maternal-uncle': [['12','7'],['11','7']],
'father': [['12','9'],['11','9'],['7','2'],['6','2'],['5','2'],['8','4'],['9','4'],['10','4']],
'paternal-aunt': [['12','8'],['11','8']],
'paternal-uncle': [['12','10'],['11','10']],
'son': [['1','7'],['2','7'],['3','10'],['4','10'],['3','9'],['4','9'],['6','12'],['9','12']],
'daughter': [['1','5'],['1','6'],['2','5'],['2','6'],['3','8'],['4','8'],['6','11'],['9','11']],
'sister': [['5','6'],['6','5'],['7','5'],['7','6'],['9','8'],['10','8'],['12','11']],
'brother': [['5','7'],['6','7'],['8','9'],['8','10'],['9','10'],['10','9'],['11','12']],
'grandson': [['1','12'],['2','12'],['3','12'],['4','12']],
'granddaughter': [['1','11'],['2','11'],['3','11'],['4','11']],
'maternal-grandmother': [['12','1'],['11','1']],
'maternal-grandfather': [['12','2'],['11','2']],
'paternal-grandmother': [['12','3'],['11','3']],
'paternal-grandfather': [['12','4'],['11','4']]
}

# picks a random pair of characters from a list of such pairs
def pick_pair(relationships,relationship):
    pair = random.choice(relationships[relationship])
    return pair


##############
# Utility functions
##############

# Converts message string to JSON string and sends to client_id.
def send_message_by_id(client_id,message):
    client = global_participant_data[client_id]['client_info']
    server.send_message(client,json.dumps(message))

# Checks that all clients listed in list_of_ids are still connected to the server
def all_connected(list_of_ids):
    connected_status = [id in global_participant_data for id in list_of_ids]
    if sum(connected_status)==len(list_of_ids):
        return True
    else:
        return False

# Called when a client drops out to notify any clients who are still connected
def notify_stranded(list_of_ids):
    for id in list_of_ids:
        if id in global_participant_data:
            #this will notify the participant and cause them to disconnect
            send_message_by_id(id,{"command_type":"PartnerDropout"})



######################
# Handling clients connecting, disconnecting, sending messages
######################

# Called for every client connecting, adds that client's data to global_participant_data, 
# then sends them to the "Start" phase of the experiment
def new_client(client, server):
    client_id = client['id']
    print("New client connected and was given id %d" % client_id)
    global_participant_data[client_id] = {'client_info':client}
    #give them the instructions for the first phase
    enter_phase(client_id,"Start")


# Called for every client disconnecting
# Remove the client from unpaired_clients if appropriate and remove the client from global_participant_data
def client_left(client, server):
    client_id = client['id']
    print("Client(%d) disconnected" % client['id'])
    if client_id in unpaired_clients:
        unpaired_clients.remove(client_id)
    # If they have a partner, and if you are not leaving because you are at the End state,
    # notify partner that they have been stranded
    if 'partner' in global_participant_data[client_id]:
        if global_participant_data[client_id]['phase']!='End':
            partner = global_participant_data[client_id]['partner']
            notify_stranded([partner])
    del global_participant_data[client_id]


# Called when the server receives a message from the client.
# Prses the message to a dictionary using json.loads, reads off the response_type, and passes to handle_client_response
def message_received(client, server, message):
	print("Client(%d) said: %s" % (client['id'], message))
	#OK, now we have to handle the various possible responses
	response = json.loads(message)
	response_code =  response['response_type']
	handle_client_response(client['id'],response_code,response)


##########################
# Management of phases
##########################

# Look up the client's current phase and moves them to the next phase
def progress_phase(client_id):
	current_phase = global_participant_data[client_id]['phase']
	current_phase_i = phase_sequence.index(current_phase)
	next_phase_i = current_phase_i+1
	next_phase = phase_sequence[next_phase_i]
	enter_phase(client_id,next_phase)

# Triggers actions associated with each phase.
def enter_phase(client_id,phase):
    # Update the phase info for this client in the global dictionary
    global_participant_data[client_id]['phase']=phase

    # Nothing actually happens here, but in some experiments we will need to set stuff up
    # when the participant starts the experiment
    if phase=='Start':
        progress_phase(client_id)

    # Attempts to pair this client with anyone already in the waiting room
    elif phase=='PairParticipants':
        #send message to the client sending them to waiting room
        send_message_by_id(client_id,{"command_type":"WaitingRoom"})
        unpaired_clients.append(client_id) #add to the unpaired clients list
        start = time.time()
        end = time.time() - start
        while (len(unpaired_clients)%2 == 1):
            end = time.time() - start
            if end > 300.0: # if the time at the end of the trial is greater than 300 seconds, it's because the participant wasn't paired. Remove them from unpaired clients.
                stranded = unpaired_clients[0]
                unpaired_clients.remove(stranded)
        # If they can be immediately paired, do so and progress to next phase
        if (len(unpaired_clients)%2 == 0) and len(unpaired_clients) >= 2: #If there are exactly 2 people now in unpaired_clients, pair them
            unpaired_one = unpaired_clients[0]
            unpaired_two = unpaired_clients[1]
            #remove from unpaired list
            unpaired_clients.remove(unpaired_one)
            unpaired_clients.remove(unpaired_two)
            # Link them - mark them as each others' partner in global_participant_data
            global_participant_data[unpaired_one]['partner']=unpaired_two
            global_participant_data[unpaired_two]['partner']=unpaired_one

            # Both participants will work through a shared target list, so store that info
            # with both clients, then move them to the next phase
            shuffled_trials = block1_trials + reverse(block1_trials) + block2_trials + reverse(block2_trials)
            for c in [unpaired_one,unpaired_two]:
                global_participant_data[c]['trial_list'] = shuffled_trials
                global_participant_data[c]['shared_trial_counter'] = 0
                progress_phase(c)
    # Once paired with a partner clients will end up here; Interaction phase starts with instructions,
    # so just send those instructions to the client
    elif phase=='Interaction':
        print('Initalising for interaction')
        send_instructions(client_id,phase)

    # When they hit the end phase, the EndExperiment command will instruct the clients to end the experiment.
    elif phase=='End':
        send_message_by_id(client_id,{"command_type":"EndExperiment"})



#################
# Client loop, handling various client responses
#################

def handle_client_response(client_id,response_code,full_response):
    print('handle_client_response',client_id,response_code,full_response)

    # client is passing in a unique ID, simply associate that with this client
    if response_code=='CLIENT_INFO':
        global_participant_data[client_id]['participantID']=full_response['client_info']

    #interaction, instructions complete, can initiate actual interaction
    elif response_code=='INTERACTION_INSTRUCTIONS_COMPLETE':
        initiate_interaction(client_id)

    #response returned from director or matcher respectively
    elif response_code=='RESPONSE' and full_response['role']=='Director':
        handle_director_response(client_id,full_response)
    elif response_code=='RESPONSE' and full_response['role']=='Matcher':
        handle_matcher_response(client_id,full_response)

    #interaction feedback complete, next trial please
    elif response_code=='FINISHED_FEEDBACK':
        swap_roles_and_progress(client_id)

    #client reporting a non-responsive partner
    elif response_code=='NONRESPONSIVE_PARTNER':
        pass #not doing anything special with this - the participant reporting
		#the problem leaves, so for their partner it will be as if they have
		#dropped out



#################
# Interaction, handles trial progression etc
#################

# Runs when participants click to continue to the interaction phase.
def initiate_interaction(client_id):
    partner_id = global_participant_data[client_id]['partner']
    list_of_participants = [client_id,partner_id]
    #checking both players are still connected
    if not(all_connected(list_of_participants)):
        notify_stranded(list_of_participants)
    else:
        send_message_by_id(client_id,{"command_type":"WaitForPartner"})
        partner_role = global_participant_data[partner_id]['role']
        # check if your partner is ready to go before starting
        if partner_role=='ReadyToInteract':
            print('Starting interaction')
            # allocate random director and matcher, and run start_interaction_trial for both clients
            for client, role in zip(list_of_participants,shuffle(["Director", "Matcher"])):
                global_participant_data[client]['role'] = role
            start_interaction_trial(list_of_participants)
        else: # else mark you as ready to go, so you will wait for partner
            global_participant_data[client_id]['role']='ReadyToInteract'
            




# Interaction trial - sends director trial instruction to director and wait instruction to matcher
def start_interaction_trial(list_of_participants):
    #check everyone is still connected!
    if not(all_connected(list_of_participants)):
        notify_stranded(list_of_participants)
    else:
        #figure out who is the director
        director_id = [id for id in list_of_participants if global_participant_data[id]['role']=='Director'][0]
        #retrieve their trial list and trial counter
        trial_counter = global_participant_data[director_id]['shared_trial_counter']
        trial_list = global_participant_data[director_id]['trial_list']
        ntrials = len(trial_list)
        #check that the director has more trials to run - if not, move to next phase
        if trial_counter>=ntrials:
            for c in list_of_participants:
                progress_phase(c)
        else: #otherwise, if there are still trials to run
            # work out if we're in block 1 or block 2, to make the data handling easier later
            if trial_counter < 32:
                block = '1'
            else:
                block = '2'
            matcher_id = global_participant_data[director_id]['partner']
            matcher_participant_id = global_participant_data[matcher_id]['participantID']
            # work out some variables to build the trial with
            relationship = trial_list[trial_counter] # the relationship for this trial
            correct_label = kinship_dictionary[relationship] # the correct label for this relationship
            pair = pick_pair(relationships,relationship) # a random pair who have this relationship
            person1 = pair[0]
            person2 = pair[1]
            for c in list_of_participants:
                this_role = global_participant_data[c]['role']
                if this_role=='Director': #send the appropriate instruction to the Director
                    instruction_string = {"command_type":"Director",
                                            "relationship": relationship,
                                            "person1":person1,
                                            "person2":person2,
                                            "correct_label":correct_label,
                                            "kinship_terms_extra":kinship_terms_extra,
                                            "partner_id":matcher_participant_id,
                                            "block": block}
                else: #and tell the matcher to wait
                    instruction_string = {"command_type":"WaitForPartner"}
                send_message_by_id(c,instruction_string)


# sends matcher trial instruction to matcher and wait instruction to director
def handle_director_response(director_id,director_response):
    print('handle_director_response',director_response)
    matcher_id = global_participant_data[director_id]['partner']
    if not(all_connected([matcher_id])):
        notify_stranded([director_id])
    else:
        #note that director_response['response'] is the clue word the director sent
        director_participant_id=global_participant_data[director_id]['participantID']
        send_message_by_id(director_id,{"command_type":"WaitForPartner"})
        person1 = director_response['person1'] # person 1 is the same greeter from the director's trial
        person2 = director_response['person2'] # and person 2 is the same greetee
        choices = [x for x in images if x != person1] # remove the greetee from the button choices
        send_message_by_id(matcher_id,
                            {"command_type":"Matcher",
                                "relationship": director_response['relationship'],
                                "person1":person1,
                                "correct_person":person2,
                                "images":choices,
                                "label": director_response['response'],
                                "partner_id":director_participant_id,
                                "block": director_response['block']})

# When the matcher responds with their guess, send feedback to matcher + director.
def handle_matcher_response(matcher_id,matcher_response):
    print("in handle_matcher_response")
    director_id = global_participant_data[matcher_id]['partner']
    if not(all_connected([director_id,matcher_id])):
        notify_stranded([director_id,matcher_id])
    else:
        #easiest way to access what the target was is to look it up in the director's trial list
        trial_n = global_participant_data[director_id]['shared_trial_counter']
        target = global_participant_data[director_id]['trial_list'][trial_n]
        #info on the clue the director provided and the matcher's guess are included in the matcher's response
        target = matcher_response['correct_person']
        guess = matcher_response['response']
        person1 = matcher_response['person1']
        if target==guess:
            score=1
        else:
            score=0
        # send the necessary information to build the feedback trials
        matcher_feedback = {"command_type":"MatcherFeedback",
                            "score":score,
                            "person1":person1,
                            "correct_person":matcher_response["correct_person"],
                            "kin_term":matcher_response['label']}
        director_feedback = {"command_type":"DirectorFeedback",
                            "score":score,
                            "person1":person1,
                            "matcher_choice":guess,
                            "kin_term":matcher_response['label']}
        send_message_by_id(matcher_id,matcher_feedback)
        send_message_by_id(director_id,director_feedback)



# swaps the roles after the feedback trial ends
def swap_roles_and_progress(client_id):
    print('swap roles',client_id)
    partner_id = global_participant_data[client_id]['partner']
    if not(all_connected([client_id,partner_id])):
        notify_stranded([client_id,partner_id])
    else:
        #increment global counter - both participants will do this independently when they reach this point
        global_participant_data[client_id]['shared_trial_counter']+=1

        this_client_role = global_participant_data[client_id]['role']
        partner_role = global_participant_data[partner_id]['role']
        #If your partner is already ready, then switch roles and progress
        if partner_role=='WaitingToSwitch':
            if this_client_role=='Director': #if you were director for this trial then
                global_participant_data[client_id]['role'] = "Matcher" #next time you will be Matcher...
                global_participant_data[partner_id]['role'] = "Director" #..and your partner will be Director
            else:
                global_participant_data[client_id]['role'] = "Director" #otherwise the opposite
                global_participant_data[partner_id]['role'] = "Matcher"
            #next trial
            start_interaction_trial([client_id,partner_id])
        #Otherwise your partner is not yet ready, so just flag up that you are
        else:
            global_participant_data[client_id]['role'] = "WaitingToSwitch"



####################
# Instructions between blocks
####################

# send over a command_type Instructions message to the client, with instructon_type set to "Interaction"
def send_instructions(client_id,phase):
    if phase=='Interaction':
        #set role
        global_participant_data[client_id]['role'] = "ReadingInstructions"
        send_message_by_id(client_id,{"command_type":"Instructions","instruction_type":"Interaction"})

#######################
# Start up server
#######################

PORT=9020 #this will run on port 9020

#standard stuff here from the websocket_server code
print('starting up')
server = WebsocketServer(PORT,'0.0.0.0')
server.set_fn_new_client(new_client)
server.set_fn_client_left(client_left)
server.set_fn_message_received(message_received)
server.run_forever()
