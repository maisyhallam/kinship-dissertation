/*
******************
*****STIMS********
******************
*/

// character images are saved as files numbered 1 to 12. they are presented in a random order for each participant
images = jsPsych.randomization.shuffle(['1','2','3','4','5','6','7','8','9','10','11','12'])

// four sets of kinship terms. Participants were run in batches of 10-20 and the kinship system was changed each time and the order randomised for each participant
kinship_terms = jsPsych.randomization.shuffle(['wiha','kasepiwa','losaku','kumisu','kawopame','pinisahe','wuwoho','kapa'])
kinship_terms_extra = jsPsych.randomization.shuffle(['wiha','kasepiwa','losaku','kumisu','kawopame','pinisahe','wuwoho','kapa','pomi','migisafo','wono','mafogeho'])

// kinship_terms = jsPsych.randomization.shuffle(['kolufi','gokowu','kasamusi','puwolohu','nimokufe','heko','nefupi','kuli'])
// kinship_terms_extra = jsPsych.randomization.shuffle(['kolufi','gokowu','kasamusi','puwolohu','nimokufe','heko','nefupi','kuli','lekoge','hahogi','felenomi','mifenamo'])

//kinship_terms = jsPsych.randomization.shuffle(['kapusimu','fola','holepa','pukawini','luguga','luwa','pumilo','kinu'])
//kinship_terms_extra = jsPsych.randomization.shuffle(['kapusimu','fola','holepa','pukawini','luguga','luwa','pumilo','kinu','mesaho','wali','hofohu','poho'])

// kinship_terms = jsPsych.randomization.shuffle(['lahi','nasike','nekikupa','gowa','powuwani','gewukahu','kifogama','lomufusu'])
// kinship_terms_extra = jsPsych.randomization.shuffle(['lahi','nasike','nehikupa','gowa','powuwani','gewukahu','kifogama','lomufusu','gowigi','kipi','sife','homisu'])

// four dictionaries containing the kinship terms and who can call who by which term; each list in the values array is a pair of characters between whom that relationship holds
var kinship_system = {
  'wiha': [['12','6'],['11','6'],['7','1'],['6','1'],['5','1'],['8','3'],['9','3'],['10','3'],['12','5'],['12','7'],['11','5'],['11','7']], // mother and her siblings
  'kasepiwa': [['6','12'],['6','11'],['9','12'],['9','11'],['1','7'],['1','6'],['1','5'],['2','7'],['2','6'],['2','5'],['3','8'],['3','9'],['3','10'],['4','8'],['4','9'],['4','10']], //child
  'losaku': [['12','9'],['11','9'],['7','2'],['6','2'],['5','2'],['8','4'],['9','4'],['10','4'],['12','8'],['12','10'],['11','8'],['11','10']], // father and his siblings
  'kumisu': [['12','11'],['10','8'],['9','8'],['5','6'],['6','5'],['7','6'],['7','5']], // sister
  'kawopame': [['11','12'],['8','9'],['8','10'],['9','10'],['10','9'],['5','7'],['6','7']], // brother
  'pinisahe': [['12','1'],['12','2'],['11','1'],['11','2']], // maternal grandparent
  'wuwoho': [['12','3'],['12','4'],['11','3'],['11','4']], // paternal grandparent
  'kapa': [['1','12'],['1','11'],['2','12'],['2','11'],['3','12'],['3','11'],['4','12'],['4','11']] // grandchild
}

// var kinship_system = {
//   'kolufi': [['12','6'],['11','6'],['7','1'],['6','1'],['5','1'],['8','3'],['9','3'],['10','3'],['12','5'],['12','7'],['11','5'],['11','7']], // mother and her siblings
//   'gokowu': [['6','12'],['6','11'],['9','12'],['9','11'],['1','7'],['1','6'],['1','5'],['2','7'],['2','6'],['2','5'],['3','8'],['3','9'],['3','10'],['4','8'],['4','9'],['4','10']], //child
//   'kasamusi': [['12','9'],['11','9'],['7','2'],['6','2'],['5','2'],['8','4'],['9','4'],['10','4'],['12','8'],['12','10'],['11','8'],['11','10']], // father and his siblings
//   'puwolohu': [['12','11'],['10','8'],['9','8'],['5','6'],['6','5'],['7','6'],['7','5']], // sister
//   'nimokufe': [['11','12'],['8','9'],['8','10'],['9','10'],['10','9'],['5','7'],['6','7']], // brother
//   'heko': [['12','1'],['12','2'],['11','1'],['11','2']], // maternal grandparent
//   'nefupi': [['12','3'],['12','4'],['11','3'],['11','4']], // paternal grandparent
//   'kuli': [['1','12'],['1','11'],['2','12'],['2','11'],['3','12'],['3','11'],['4','12'],['4','11']] // grandchild
// }

// var kinship_system = {
//   'kapusimu': [['12','6'],['11','6'],['7','1'],['6','1'],['5','1'],['8','3'],['9','3'],['10','3'],['12','5'],['12','7'],['11','5'],['11','7']], // mother and her siblings
//   'fola': [['6','12'],['6','11'],['9','12'],['9','11'],['1','7'],['1','6'],['1','5'],['2','7'],['2','6'],['2','5'],['3','8'],['3','9'],['3','10'],['4','8'],['4','9'],['4','10']], //child
//   'holepa': [['12','9'],['11','9'],['7','2'],['6','2'],['5','2'],['8','4'],['9','4'],['10','4'],['12','8'],['12','10'],['11','8'],['11','10']], // father and his siblings
//   'pukawini': [['12','11'],['10','8'],['9','8'],['5','6'],['6','5'],['7','6'],['7','5']], // sister
//   'luguga': [['11','12'],['8','9'],['8','10'],['9','10'],['10','9'],['5','7'],['6','7']], // brother
//   'luwa': [['12','1'],['12','2'],['11','1'],['11','2']], // maternal grandparent
//   'pumilo': [['12','3'],['12','4'],['11','3'],['11','4']], // paternal grandparent
//   'kinu': [['1','12'],['1','11'],['2','12'],['2','11'],['3','12'],['3','11'],['4','12'],['4','11']] // grandchild
// }

// var kinship_system = {
//   'lahi': [['12','6'],['11','6'],['7','1'],['6','1'],['5','1'],['8','3'],['9','3'],['10','3'],['12','5'],['12','7'],['11','5'],['11','7']], // mother and her siblings
//   'nasike': [['6','12'],['6','11'],['9','12'],['9','11'],['1','7'],['1','6'],['1','5'],['2','7'],['2','6'],['2','5'],['3','8'],['3','9'],['3','10'],['4','8'],['4','9'],['4','10']], //child
//   'nehikupa': [['12','9'],['11','9'],['7','2'],['6','2'],['5','2'],['8','4'],['9','4'],['10','4'],['12','8'],['12','10'],['11','8'],['11','10']], // father and his siblings
//   'gowa': [['12','11'],['10','8'],['9','8'],['5','6'],['6','5'],['7','6'],['7','5']], // sister
//   'powuwani': [['11','12'],['8','9'],['8','10'],['9','10'],['10','9'],['5','7'],['6','7']], // brother
//   'gewukahu': [['12','1'],['12','2'],['11','1'],['11','2']], // maternal grandparent
//   'kifogama': [['12','3'],['12','4'],['11','3'],['11','4']], // paternal grandparent
//   'lomufusu': [['1','12'],['1','11'],['2','12'],['2','11'],['3','12'],['3','11'],['4','12'],['4','11']] // grandchild
// }

// four dictionaries that contain the 16 possible relationships and which kinship term is used to encode that relationship
var kinship_dictionary = {'mother': 'wiha',
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

// var kinship_dictionary = {'mother': 'kolufi',
// 'maternal-aunt':'kolufi',
// 'maternal-uncle':'kolufi',
// 'father':'kasamusi',
// 'paternal-aunt':'kasamusi',
// 'paternal-uncle':'kasamusi',
// 'son':'gokowu',
// 'daughter':'gokowu',
// 'sister':'puwolohu',
// 'brother':'nimokufe',
// 'grandson':'kuli',
// 'granddaughter':'kuli',
// 'maternal-grandmother': 'heko',
// 'maternal-grandfather':'heko',
// 'paternal-grandmother':'nefupi',
// 'paternal-grandfather':'nefupi'}

// var kinship_dictionary = {'mother': 'kapusimu',
// 'maternal-aunt':'kapusimu',
// 'maternal-uncle':'kapusimu',
// 'father':'holepa',
// 'paternal-aunt':'holepa',
// 'paternal-uncle':'holepa',
// 'son':'fola',
// 'daughter':'fola',
// 'sister':'pukawini',
// 'brother':'luguga',
// 'grandson':'kinu',
// 'granddaughter':'kinu',
// 'maternal-grandmother': 'luwa',
// 'maternal-grandfather':'luwa',
// 'paternal-grandmother':'pumilo',
// 'paternal-grandfather':'pumilo'}

// var kinship_dictionary = {'mother': 'lahi',
// 'maternal-aunt':'lahi',
// 'maternal-uncle':'lahi',
// 'father':'nehikupa',
// 'paternal-aunt':'nehikupa',
// 'paternal-uncle':'nehikupa',
// 'son':'nasike',
// 'daughter':'nasike',
// 'sister':'gowa',
// 'brother':'powuwani',
// 'grandson':'lomufusu',
// 'granddaughter':'lomufusu',
// 'maternal-grandmother': 'gewukahu',
// 'maternal-grandfather':'gewukahu',
// 'paternal-grandmother':'kifogama',
// 'paternal-grandfather':'kifogama'}

// a dictionary of all the possible relationships and which characters they hold between
var relationships = {
  'mother': [['12','6'],['11','6'],['7','1'],['6','1'],['5','1'],['8','3'],['9','3'],['10','3']],
  'father': [['12','9'],['11','9'],['7','2'],['6','2'],['5','2'],['8','4'],['9','4'],['10','4']],
  'maternal-aunt': [['11','5'],['12','5']],
  'maternal-uncle': [['11','7'],['12','7']],
  'paternal-aunt': [['11','8'],['12','8']],
  'paternal-uncle': [['11','10'],['12','10']],
  'son': [['6','12'],['9','12'],['1','7'],['2','7'],['3','9'],['3','10'],['4','9'],['4','10']],
  'daughter': [['6','11'],['9','11'],['1','5'],['1','6'],['2','5'],['2','6'],['3','8'],['4','8']],
  'sister': [['6','5'],['5','6'],['7','6'],['7','5'],['10','8'],['9','8'],['12','11']],
  'brother': [['6','7'],['5','7'],['8','9'],['8','10'],['9','10'],['10','9'],['11','12']],
  'grandson': [['1','12'],['2','12'],['3','12'],['4','12']],
  'granddaughter': [['1','11'],['2','11'],['3','11'],['4','11']],
  'maternal-grandmother': [['12','1'],['11','1']],
  'maternal-grandfather': [['12','2'],['11','2']],
  'paternal-grandmother': [['12','3'],['11','3']],
  'paternal-grandfather': [['12','4'],['11','4']]
}
