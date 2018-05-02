import sendMail from './sendMail';
import loadTemplate from 'synbiohub/loadTemplate';
import config from 'synbiohub/config';

function sendCreatePasswordMail(user, administrator) {

    sendMail(user, 'Your SynBioHub Account', loadTemplate('mail/resetPassword.txt', {

        link: config.get('instanceUrl') + 'resetPassword/token/' + user.resetPasswordLink,
        administrator: administrator.name,
        username: user.username,

    }))

}

export default sendCreatePasswordMail;

