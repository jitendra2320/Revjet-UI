import Axios from './base';

export const GetCompanies = () => Axios().get('Company')
export const GetActiveCompanies = () => Axios().get('Company/Active')
export const GetCompanyById = (id) => Axios().get('Company/' + id)
export const AddCompany = (entity) => Axios('Company Created Successfully').post('Company', entity)
export const UpdateCompany = (id, entity) => Axios('Updated Successfully').put('Company/' + id, entity)
export const AddDocument = (id, doc) => Axios().get('Company/Document/Add/' + id + '/' + doc)
export const AddRemark = (id, doc) => Axios().get('Company/Remark/Add/' + id + '/' + doc)
export const GetCompanyInvoices = (id) => Axios().get('Company/Invoices/' + id)
export const GetCompanyAgreements = (id) => Axios().get('Company/Agreements/' + id)

export const GetCompanyBalances = (id) => Axios().get('Company/Balances/' + id)
export const AddBalance = (entity) => Axios().post('Company/Balances', entity)
export const GetUnpaidItems = (id) => Axios().get('Company/UnpaidBalance/' + id)

export const UpdateInvoiceItems = (entity) => Axios('Payment Successful').post('Company/UpdateInvoiceItems', entity)


export const GetUsers = (id) => Axios().get('Company/Users/' + id)
export const CreateUser = (id, entity) => Axios('Added Successfully').post('Company/Users/' + id, entity)
export const UpdateUser = (id, entity) => Axios('Updated Successfully').put('Company/Users/' + id, entity)



