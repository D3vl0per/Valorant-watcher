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
  }];
  return inquirer.prompt(questions);
};
