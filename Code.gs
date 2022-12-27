function onOpen() {
 SpreadsheetApp
   .getUi()
   .createMenu("Quiz Creator")
   .addItem("Quiz Creator Sidebar", "showCreatorSidebar")
   .addToUi();
}
function showCreatorSidebar() {
 var widget = HtmlService.createHtmlOutputFromFile("Form.html");
 widget.setTitle("EAZY QUIZ MAKER");
 SpreadsheetApp.getUi().showSidebar(widget);
}

// function callFormsAPI() {    // I'm not sure this does anything at all
//     Logger.log('Calling the Forms API!');
//     var formId = '1SJSpUOk8AkCqXTr21Gpr64pzu48192_OOFYmeM9PnZM';
//     // Get OAuth Token
//    var OAuthToken = ScriptApp.getOAuthToken();
//       Logger.log('OAuth token is: ' + OAuthToken);
//    var formsAPIUrl = 'https://forms.googleapis.com/v1/forms/' + formId + '/' + 'responses';
//       Logger.log('formsAPIUrl is: ' + formsAPIUrl);
//    var options = {
//       'headers': {
//         Authorization: 'Bearer ' + OAuthToken,
//         Accept: 'application/json'
//       },
//       'method': 'get',
//       muteHttpExceptions : false
//     };  
//     var response = UrlFetchApp.fetch(formsAPIUrl, options);
//     Logger.log('Response from forms.responses was: ' + response);
// }

function formatSheet() {   // Label the input rows and identify them with pretty colors
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  if (sheet.getRange('A1').getValue() !== 'Questions') {
    sheet.insertRowBefore('1')               //  Create a title row
    sheet.getRange('A1').setValue('Questions');
    sheet.getRange('B1').setValue('Answers');
    sheet.setFrozenRows(1);  sheet.getRange('1:1').setFontSize(14);
    sheet.getRange('A1:B1').setBackground('#708090');
    sheet.getRange('A1:B1').setFontColor('white'); 
  }
  var answersColumn = sheet.getRange("B2:B");
  var questionsColumn = sheet.getRange("A2:A");
  questionsColumn.setBackground("deepskyblue")
  answersColumn.setBackground("greenyellow")
}

function returnValues() { //Retrieves data from the spreadsheet as an array 
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var range = sheet.getDataRange()
  var values = range.getValues();
      Logger.log(values)
  return values.reverse();    // reverse order because addQuestionsToQuiz() inserts them at [0]
}

function createMultipleSolutions(arr){   // Allows questions with more than one correct answer.  
                                         // It creates an array that is inserted into the JSON 'requests' code
    var correctAnswers = []
    for (let i = 0; i < arr.length; i++) {
          Logger.log('createMultipleCorrectAnswers() : ' + arr[i].toString())
      var answer = arr[i].toString()
      if (answer !== ""){
          object = {value: answer}
          correctAnswers.push(object)}
    }
    Logger.log('multi answers function output:  ' + correctAnswers)
    return correctAnswers
}

function addQuestionToQuiz(formId, values){   // Add questions to the quiz
  var formId = formId
  // Create request body for Google Forms API.
  var problem = values[0].toString();
  if (problem === 'Question') {return ""};
  const url = `https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`;

  //  Dummied out; this would only add one answer to each question.  Replaced by multipleCorrectAnswers function
  // var solution = values[1].toString();
  // const requests = { requests: [{ createItem: { item: { questionItem: { question: { textQuestion: { paragraph: false }, grading: { pointValue: 1, correctAnswers: { answers: [{ value: solution },{value: "pizza"}] } } } }, title: problem }, location: { index: 0 } } }] };

  var multipleSolutions = createMultipleSolutions(values.slice(1));
      Logger.log('solutions:' + multipleSolutions)
      Logger.log(typeof multipleSolutions);
  const requests = { requests: [{ createItem: { item: { questionItem: { question: { textQuestion: { paragraph: false }, grading: { pointValue: 1, correctAnswers: { answers: multipleSolutions } } } }, title: problem }, location: { index: 0 } } }] };

  // Request to Google Forms API.
  const params = {
    method: "post",
    contentType: "application/json",
    headers: { authorization: "Bearer " + ScriptApp.getOAuthToken() },
    payload: JSON.stringify(requests),
    muteHttpExceptions: true
  };
  const res = UrlFetchApp.fetch(url, params);
  console.log(res.getContentText())
}

function createTheQuiz(nameOfForm = 'My New Form', quizName = "", shuffleBool){    
  //This creates the quiz (from FormEntry), adds questions, then calls the alert function
  const formTitle = nameOfForm; 
      Logger.log('creating quiz: ' + formTitle + 'quizName=' + quizName +  ',  shuffleBool = ' + shuffleBool);
  const form = FormApp.create(formTitle).setIsQuiz(true);
  var isShuffle = false;
  if (shuffleBool == 'yes') {
    isShuffle = true};

  form.setTitle(quizName).setShuffleQuestions(isShuffle).setLimitOneResponsePerUser(true);
  const formId = form.getId();

  var values = returnValues();   //Get quiz questions and answers from the spreadsheet
  values.map(x => addQuestionToQuiz(formId, x)) // Add them one at a time
  showAlert(nameOfForm, formId);   // Show a success popup, with option to open new created form.
}

function formEntry(formData) {   //Receives user information from the sidebar, sends it to the quizcreator function
  var fileName = formData[0];
  var secondName = formData[1];
  var isShuffle = formData[2];
    Logger.log('sending data from sidebar for quizname: [' + formData + ']' + fileName +", " + secondName +", " + isShuffle)
  createTheQuiz(fileName, secondName, isShuffle)
}

function testFormEntry() { //Send a test form to formEntry() with the form fields pre-filled, which calls createTheQuiz()
  formData = ['SampleFormName', 'SampleQuizName', 'yes']
  formEntry(formData)
}

function showAlert(title, formId) {   // Make a popup after creating the quiz to show success, and perhaps also to open the created quiz
  var ui = SpreadsheetApp.getUi()
  var result = ui.alert(
     'Quiz "' + title + '" created!',
     'Open form now?',
      ui.ButtonSet.YES_NO);
  if (result == ui.Button.YES) {
    openUrl(formId, title);}
}

function openUrl(formId, title){
// not totally sure how this works; copied from https://stackoverflow.com/questions/10744760/google-apps-script-to-open-a-url/54675103#54675103
  const url = 'https://docs.google.com/forms/d/' + formId
  Logger.log('openUrl. url: ' + url);
  const html = `<html>
                <a id='url' href="${url}">Click here</a>
                <script>
                var winRef = window.open("${url}");
                winRef ? google.script.host.close() : window.alert('Popup blocker prevented opening ${url}') ;
                </script>
                </html>`; 
  var htmlOutput = HtmlService.createHtmlOutput(html).setWidth( 250 ).setHeight( 300 );
  Logger.log('openUrl. htmlOutput: ' + htmlOutput);
  SpreadsheetApp.getUi().showModalDialog( htmlOutput, `Opening created quiz "` + title +'"' ); 
}
