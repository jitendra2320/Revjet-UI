import Axios from './base';

export const CreateInspectionBuilder = (entity) => Axios().post('CreateInspections', entity)

export const simulateMyInspection = (entity) => Axios().post('SimulateInspection', entity)

export const getInspectionBuilder = () => Axios().get('GetInspections')

export const UpdateInspectionBuilder = (id, entity) => Axios('Updated Successfully').put('UpdateInspections/' + id, entity)

export const getInspectionsById = (id) => Axios(null,"Invalid Id").get('getInspectionsById/' + id,)
export const getMyInspection = (id) => Axios().get('GetMyInspections/' + id)

export const UploadFile = (entity) => Axios().post('uploadfile', entity)
export const DownloadFile = (key) => Axios(null, null, { responseType: 'blob' }).get('downloadfile/' + key)
