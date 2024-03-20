import Axios from './base';

// export const GetAgreements = () => Axios().get('Agreements')
// export const GetAgreementById = (id) => Axios().get('Agreements/' + id)
// export const AddAgreement = (entity) => Axios().post('Agreements', entity)
// export const UpdateAgreement = (id, entity) => Axios().put('Agreements/' + id, entity)
// export const AddDocument = (id, doc) => Axios().get('Agreements/Document/Add/' + id + '/' + doc)
// export const AddRemark = (id, doc) => Axios().get('Agreements/Remark/Add/' + id + '/' + doc)

// export const GetAvailable = () => Axios().get('Agreements/PropertyList/All')
// export const AddProperty = (id, doc) => Axios().get('Agreements/Properties/' + id + '/' + doc)
// export const GetCurrent = (id) => Axios().get('Agreements/Properties/' + id)
// export const AddSecurityDeposit = (id, prop, entity) => Axios().post('Agreements/Security/' + id + '/' + prop, entity)

// export const AddPropRemark = (id, prop, doc) => Axios().get('Agreements/Properties/Remarks/' + id + '/' + prop + '/' + doc)
// export const AddPropDocument = (id, prop, doc) => Axios().get('Agreements/Properties/Documents/' + id + '/' + prop + '/' + doc)
// export const AddPropInsurace = (id, prop, doc) => Axios().get('Agreements/Properties/Insurances/' + id + '/' + prop + '/' + doc)

//WaitList
export const AddWaitList = (entity) => Axios().post('WaitList/add', entity)
export const GetWaitLists = () => Axios().get('WaitList/List')
export const GetWaitListById = (id) => Axios().get('WaitList/' + id)
export const ModifyWaitListApplicant = (entity) => Axios('Status Updated Successfully').put('WaitList', entity)
export const DeleteWaitListApplicant = (id) => Axios().delete('WaitList/' + id)
export const AddDocument = (id, docId) => Axios().get('WaitList/Document/' + id + '/' + docId)
export const AddRemark = (id, docId) => Axios().get('WaitList/Remark/' + id + '/' + docId)
export const CreateAccount = (entity) => Axios('Account Has Been Created').post('WaitList/createAccount', entity)

export const GetWaitListByType = (id) => Axios().get('WaitList/Type/' + id)