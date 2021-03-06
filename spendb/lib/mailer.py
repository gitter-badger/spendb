from flask import current_app
from flask.ext.babel import lazy_gettext as _
from flask.ext.mail import Message

from spendb.core import mail, url_for


RESET_MESSAGE = '''You have requested your password on %(site_title)s to be reset.

Please click the following link to confirm this request:

   %(reset_link)s
'''


def add_msg_niceties(recipient_name, body, sender_name):
    return _(u"Dear %(name)s,", name=recipient_name) \
        + u"\r\n\r\n%s\r\n\r\n" % body \
        + u"--\r\n%s" % sender_name


def mail_account(recipient, subject, body, headers=None):
    site_title = current_app.config.get('SITE_TITLE')
    if (recipient.email is not None) and len(recipient.email):
        msg = Message(subject, recipients=[recipient.email])
        msg.body = add_msg_niceties(recipient.display_name, body, site_title)
        mail.send(msg)


def get_reset_body(account):
    reset_link = url_for('account.do_reset',
                         email=account.email,
                         token=account.token)
    return _(RESET_MESSAGE, reset_link=reset_link,
             site_title=current_app.config.get('SITE_TITLE'))


def send_reset_link(account):
    body = get_reset_body(account)
    mail_account(account, _('Reset your password'), body)
