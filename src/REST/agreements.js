import Axios from './base';

export const GetAgreements = () => Axios().get('Agreements')
export const GetAgreementById = (id) => Axios().get('Agreements/' + id)
export const GetAgreementsByIds = (entity) => Axios().post('AgreementsByIds', entity)
export const AddAgreement = (entity) => Axios().post('Agreements', entity)
export const UpdateAgreement = (id, entity) => Axios('Updated Successfully').put('Agreements/' + id, entity)
export const AddDocument = (id, doc) => Axios().get('Agreements/Document/Add/' + id + '/' + doc)
export const AddRemark = (id, doc) => Axios().get('Agreements/Remark/Add/' + id + '/' + doc)


export const GetAvailable = () => Axios().get('Agreements/PropertyList/All')
export const AddProperty = (id, doc) => Axios(null, 'Property already leased for the period.').get('Agreements/Properties/' + id + '/' + doc)
export const RemoveProperty = (id, doc) => Axios().delete('Agreements/Properties/' + id + '/' + doc)
export const GetCurrent = (id) => Axios().get('Agreements/Properties/' + id)
export const AddSecurityDeposit = (id, prop, entity) => Axios().post('Agreements/Security/' + id + '/' + prop, entity)

export const AddPropRemark = (id, prop, doc) => Axios().get('Agreements/Properties/Remarks/' + id + '/' + prop + '/' + doc)
export const AddPropDocument = (id, prop, doc) => Axios().get('Agreements/Properties/Documents/' + id + '/' + prop + '/' + doc)
export const AddPropInsurace = (id, prop, doc) => Axios().get('Agreements/Properties/Insurances/' + id + '/' + prop + '/' + doc)

export const createAgreementInvoice = (id, entity) => Axios('Created Successfully').post('Agreements/Invoices/' + id, entity)


