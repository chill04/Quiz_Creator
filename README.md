# Quiz_Creator

This is a script that works with GoogleSheets and GoogleForms.  

PROBLEM:
GoogleForms allows you to create quizzes, but the interface is very tedious and involves a lot of clicking to add each question.  Suppose you wanted 
to add 50 questions, it would take a lot of time.
However, there is a way to add questions in bulk through Google Extensions (https://developers.google.com/apps-script/reference/forms/form-app).  This lets you
put a bunch of questions and answers into a spreadsheet and create quizzes much more quickly.  Unfortunately, it does not offer the option of short-answer questions, 
like one would want for creating a spelling test.   It only allows the creation of multiple-choice questions and quizzes.  

SOLUTION:
The ability to create short-answer questions IS available through the GoogleForms API!  So that is what I made here, with HTML and GoogleScript.  In GoogleSheets, you can 
input questions/answers, use the HTML sidebar to name it and call the functions to create the quiz.

The script has 11 functions:
onOpen() - Adds app to Toolbar
showCreatorSidebar() - Opens app sidebar
formatSheet() - Adds formatting to Sheet, to identify columns
returnValues() - Reads data from GoogleSheet
createMultipleSolutions() - Creates answer arrays
addQuestionToQuiz() - Adds questions, one by one, to quiz *This does most of the work
createTheQuiz() - Creates the GoogleForm, sets form settings
formEntry() - Takes user information from the sidebar
testFormEntry() - For testing; pretends information is being sent from sidebar
showAlert() - After form is created, creates a success popup
openUrl() - Links user to the newly created form
 
