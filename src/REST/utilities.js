import Axios from './base';
import rawaxios from 'axios';
import authorize from '../Utils/authorize';
 

const URL = process.env.REACT_APP_API_URL

export const GetDocuments = () => Axios().get('Attachments')
export const GetDocumentList = (entity) => Axios().post('Attachments/List', entity)
export const UploadDocument = (entity) => Axios().post('Attachments', entity)
export const DownloadDocument = (key) => Axios(null, null, { responseType: 'blob' }).get('Attachments/' + key)
export const DownloadDocumentById = (id) => Axios(null, null, { responseType: 'blob' }).get('Attachments/Id/' + id)
export const DeleteDocument = (id) => Axios().delete('Attachments/' + id)

export const UploadFactsheet = (entity) => Axios('Fact Sheet Uploaded Successfully').post('factsheet', entity)

export const GetDocumentTypes = () => Axios().get('AttachmentTypes')
export const AddDocumentType = (entity) => Axios().post('AttachmentTypes', entity)
export const DeleteDocumentType = (id) => Axios().delete('AttachmentTypes/' + id)
 
export const GetNotifcationFields = () => Axios().get('Notifications/Fields')

export const GetNotices = () => Axios().get('Notices')
export const AddNotice = (entity) => Axios().post('Notices', entity)
export const RemoveNotice = (id) => Axios().delete('Notices/' + id)
export const GetNoticeFields = () => Axios().get('Notices/Fields')

export const GetInsuranceTypes = () => Axios().get('InsuranceTypes')
export const AddInsuranceType = (entity) => Axios().post('InsuranceTypes', entity)
export const DeleteInsuranceType = (id) => Axios().delete('InsuranceTypes/' + id)

export const GetInvoiceCycles = () => Axios().get('InvoiceCycles')
export const AddInvoiceCyle = (entity) => Axios().post('InvoiceCyle/add', entity)
export const DeleteInvoiceCycle = (id) => Axios().delete('InvoiceCyle/' + id)

export const GetPaymentTypes = () => Axios().get('PaymentTypes')
export const AddPaymentType = (entity) => Axios().post('PaymentType/add', entity)
export const DeletePaymentType = (id) => Axios().delete('PaymentType/' + id)

export const GetRemarks = (entity) => Axios().post('Remarks/List', entity)
export const AddRemark = (entity) => Axios().post('Remarks', entity)
export const DeleteRemark = (id) => Axios().delete('Remarks/' + id)
export const AddRemarkDoc = (id, doc) => Axios().get('Remarks/Add/Document/' + id + '/' + doc)

export const GetInsurancesList = (entity) => Axios().post('Insurances', entity)
export const GetInsurance = (id) => Axios().get('Insurance/' + id)
export const AddInsurance = (entity) => Axios().post('Insurance/add', entity)
export const UpdateInsurance = (id, entity) => Axios().put('Insurance/update/' + id, entity)
export const DeleteInsurance = (id) => Axios().delete('Insurance/' + id)


export const PayWithBalance = (id, entity) => Axios('Payment Successful', 'Payment Failed').post('Receipt/AccountBalance/' + id, entity)
export const PayWithCard = (id, entity) => Axios('Payment Successful', 'Payment Failed').post('Receipt/' + id, entity)
export const AddReceipt = (entity) => Axios().post('Receipt/Create', entity)

export const GetAccount = () => Axios().get('Accounts')
export const AddAccount = (type, entity) => Axios().post('Accounts', entity)

export const GetMessages = (id) =>  {
  return rawaxios.get(URL+'/api/Messages/' + id,{headers: {
        'Authorization': 'Bearer ' + authorize.getToken(),
        'Grant': authorize.getIdToken()
    }})
} 
export const AddMessage = (id, entity) => Axios().post('Messages/' + id, entity)

export const GetSkuTypes = () => Axios().get('SkuTypes')
export const AddSkuType = (entity) => Axios().post('SkuTypes', entity)

export const SendNotices = (entity) => Axios().post('SendNotices', entity)

export const GetReports = () => Axios().get('Reports')


export const GetSystemSettings = () => Axios().get('Getsettings')
 