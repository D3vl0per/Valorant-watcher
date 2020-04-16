const inquirer = require('inquirer');
exports.askLogin = () => {
  const questions = [{
    name: 'token',
    type: 'password',
    message: 'Enter your auth-token from twitch.tv 🔑:',
    validate: function(value) {
      if (value.length) {
        return true;
      } else {
        return 'Please enter your valid token!';
      }
    }
  }, {
    name: 'exec',
    type: 'input',
    message: 'Enter the chromium executable path (usually /usr/bin/chromium-browser or /usr/bin/chromium):',
    validate: function(value) {
      if (value.length) {
        return true;
      } else {
        return 'Please enter your valid path!';
      }
    }
  }];
  return inquirer.prompt(questions);
};
