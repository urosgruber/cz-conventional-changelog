"format cjs";

var wrap = require('word-wrap');
var map = require('lodash.map');
var find = require('lodash.find');
var longest = require('longest');
var rightPad = require('right-pad');
var branch = require('git-branch');

var filter = function(array) {
  return array.filter(function(x) {
    return x;
  });
};

// This can be any kind of SystemJS compatible module.
// We use Commonjs here, but ES6 or AMD would do just
// fine.
module.exports = function (options) {

  var maxLineWidth = 72;
  var defaultStream = "COM";
  var defaultTicket = null;

  var branchName = branch.sync();

  var types = options.types;
  var streams = [
    {
      "name": "MEM: Memberships",
      "value": "MEM"
    },
    {
      "name": "CON: Content",
      "value": "CON"
    },
    {
      "name": "MOB: Mobile",
      "value": "MOB"
    },
    {
      "name": "CAR: Careers",
      "value": "CAR"
    },
    {
      "name": "PLA: Platform, Infrastructure",
      "value": "PLA"
    },
    {
      "name": "COM: Community",
      "value": "COM"
    },{
      "name": "CFE: Community Frontend",
      "value": "CFE"
    },
    {
      "name": "JET: Jet Ski",
      "value": "JET"
    },
    {
      "name": "CHN: China",
      "value": "CHN"
    }
  ];


  var featureName = branchName.substring(branchName.indexOf("/")+1);

  var streamGuess = find(streams, {"value": featureName.substring(0,3).toUpperCase()});
  if (streamGuess) {
    defaultStream = streamGuess.value;
  } 

  var ticketFound = featureName.match(/\d+/);
  if (ticketFound) {
    defaultTicket = ticketFound[0];
  } 

  var length = longest(Object.keys(types)).length + 1;
  var choices = map(types, function (type, key) {
    return {
      name: rightPad(key + ':', length) + ' ' + type.description,
      value: key
    };
  });

  return {
    // When a user runs `git cz`, prompter will
    // be executed. We pass you cz, which currently
    // is just an instance of inquirer.js. Using
    // this you can ask questions and get answers.
    //
    // The commit callback should be executed when
    // you're ready to send back a commit template
    // to git.
    //
    // By default, we'll de-indent your commit
    // template and will keep empty lines.
    prompter: function(cz, commit) {
      console.log('\nSubject will be cropped at ' + maxLineWidth + ' characters. Body will be wrapped after ' + maxLineWidth + ' characters.\n');

      // Let's ask some questions of the user
      // so that we can populate our commit
      // template.
      //
      // See inquirer.js docs for specifics.
      // You can also opt to use another input
      // collection library if you prefer.
      cz.prompt([
        {
          type: 'list',
          name: 'stream',
          message: 'Select the stream of change that you\'re committing:',
          choices: streams,
          default: defaultStream
        }, {
          type: 'input',
          name: 'issue',
          message: 'Add ticket number (e.g. "123" or press enter to skip):\n',
          default: defaultTicket
        }, {
          type: 'list',
          name: 'type',
          message: 'Select the type of change that you\'re committing:',
          choices: choices
        }, {
          type: 'input',
          name: 'subject',
          message: 'Write a short, imperative tense description of the change:\n'
        }, {
          type: 'input',
          name: 'body',
          message: 'Provide a longer description of the change: (press enter to skip)\n'
        }
      ]).then(function(answers) {

        var wrapOptions = {
          trim: true,
          newline: '\n',
          indent:'',
          width: maxLineWidth
        };

        var issue = answers.issue ? '[' + answers.stream + '-' + answers.issue.trim() + '] ' : '[' + answers.stream + '] ';
        
        // Hard limit this line
        var head = (issue + answers.type + ': ' + answers.subject.trim()).slice(0, maxLineWidth);

        // Wrap these lines at 100 characters
        var body = wrap(answers.body, wrapOptions);

        commit(head + '\n\n' + body );
      });
    }
  };
};
