import Axios from './base';

export const GetInvoices = () => Axios().get('Invoices')
export const GetInvoiceById = (id) => Axios().get('Invoices/' + id)
export const UpdateLineItem = (id, entity) => Axios().post('Invoices/LineItems/' + id, entity)
export const AddLineItem = (id, entity) => Axios('Added Successfully').post('Invoices/LineItems/Add/' + id, entity)
export const RemoveLineItem = (id, uid) => Axios().delete('Invoices/LineItems/' + id + '/' + uid)
export const PayLineItem = (id, entity) => Axios().put('Invoices/LineItems/' + id, entity)
export const CancelInvoice = (id) => Axios().put('Invoices/Cancel/' + id)

export const GetReceipts = (entity) => Axios().post('Invoices/Receipts', entity)

export const CreateWaitlistInvoice = (receipt, waitlist) => Axios('Added to WaitList').post('Invoices/WaitList', {
    receipt, waitlist
})

export const AddRemark = (id, doc) => Axios().get('Invoices/Remarks/Add/' + id + '/' + doc)

export const CreateTieDown = (id, entity) => {
    if (id)
        return Axios().post('Invoices/TieDown/' + id, entity)
    return Axios().post('Invoices/TieDown', entity)
}

export const GetCompany = (user) => Axios().post('Invoices/User/Details', user)
export const GetTieDowns = () => Axios().get('Invoices/List/TieDowns')


export const AddInvoice = (entity) => Axios('Created Invoice Successfully').post('Invoices', entity)

export const UpdateComments = (id, entity) => Axios('Added Successfully').post('Invoices/Comments/' + id, entity)