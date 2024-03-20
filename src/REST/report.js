import Axios from './base';

export const GetInvoices = (entity) => Axios().post('Reports/Invoices', entity)
export const GetInsurances = (type) => Axios().get('Reports/Insurances/' + type); //type
