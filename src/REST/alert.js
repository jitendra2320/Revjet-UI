import Axios from './base';

export const GetAlerts = () => Axios().get('Alerts')
export const GetAlertById = (id) => Axios().get('Alerts/Item/' + id)
export const CreateAlerts = (entity) => Axios().post('Alerts', entity)
export const DeleteAlert = (id) => Axios().delete('Alerts/' + id)
export const GetUsers = (type = 'NONE') => Axios().get('Alerts/Users/' + type)
export const DownloadAlerts = (entity) => Axios().post('Alerts/Download', entity)
export const SendEmail = (entity) => Axios('Email Sent').post('Alerts/Email', entity)

export const SendInvite = (entity) => Axios('Invite Sent').post('Waitlist/Invite', entity)