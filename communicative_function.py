#############
## This code reads in the .csv files containing participant data from the final block of the interaction game
## or the final block of the test phase. From this, it generates a communicative cost value for each participants'
## final language and the length of the final language. It writes this to a new .csv file with the participant number,
## their pair number, and what condition they were in. We then imported this to R to run analyses on the simplicity
## and informativity of the participants' final languages.
############

import csv
import math
from pandas import *

# open a file in the write mode
f = open('../Data/language_data/real_learning_language_data.csv', 'a')
f2 = open('../Data/language_data/real_communication_language_data.csv','a')


# open the data files for each condition in read mode
learning_data = read_csv("../Data/learning_data.csv")
communication_data = read_csv("../Data/comm_data.csv")

# create the csv writer
writer1 = csv.writer(f)
writer2 = csv.writer(f2)

# build lists of the values in the 'button_selected' and 'pair_no' columns from the data files
all_learning_languages = learning_data['button_selected'].tolist()
all_communication_languages = communication_data['button_selected'].tolist()
pair_numbers = communication_data['pair_no'].tolist()

# empty dictionaries to fill with the participants' numbers as keys and productions as values
learning_languages = {}
communication_languages = {}


# for loops that generate lists of final languages
for j in range(2,42): # forty participants in the learning condition, start counting at 2
    learning_languages[j] = []
    for i in all_learning_languages[0:16]: # each participant has to produce a label for 16 relationships
        learning_languages[j].append(i)
    del all_learning_languages[0:16] # delete this participants' language from the list

for j in range(2,70): # seventy participants in the communication condition, start counting at 2
    communication_languages[j] = []
    for i in all_communication_languages[0:16]:
        communication_languages[j].append(i)
    del all_communication_languages[0:16]


# builds a list of the communicative cost for each label in the input list
def build_loglist(language,condition):
    average = 0
    label_logs = []
    labels = []
    kinship_system = set(language) # any repeated productions removed
    for word in kinship_system:
        labels.append(word)
        count = language.count(word) # how many times was this label produced by this participant
        label_logs.append(-math.log2(1/count))
    length = len(list(set(language)))
    average = sum(label_logs)/length # communicative cost for the language is the average of its labels
    return average

pair_counter = 35 # participants in the learning condition were assigned pair numbers starting from 35
for i in range(2,42):
    participant = str(i-1)
    length = len(list(set(learning_languages[i])))
    pair_counter += 1
    average = build_loglist(learning_languages[i],'learning')
    writer1.writerow([participant,pair_counter,'learning',length,average]) # write a row in a new csv file

index_counter = 0 
for i in range(2,70):
    participant = str(i+39)
    pair = pair_numbers[index_counter]
    index_counter += 16 # to get pair numbers, we need to index the language list at multiples of 16
    length = len(list(set(communication_languages[i])))
    average = build_loglist(communication_languages[i],'communication')
    writer2.writerow([participant,pair,'communication',length,average])

# close the files
f.close()
f2.close()