
import sendMail from './sendMail';
import loadTemplate from 'synbiohub/loadTemplate';
import config from 'synbiohub/config';

function sendResetPasswordMail(user) {

    sendMail(user, 'Reset your password', loadTemplate('mail/resetPassword.txt', {

        link: config.get('instanceUrl') + 'resetPassword/token/' + user.resetPasswordLink

    }))

}

export default sendResetPasswordMail;

