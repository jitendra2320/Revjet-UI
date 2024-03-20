import Axios from './base';

export const GetPropertyTypes = () => Axios().get('PropertyTypes')
export const AddPropertyType = (entity) => Axios().post('PropertyTypes/add', entity)
export const UpdatePropertyType = (id, entity) => Axios().post('PropertyTypes/update/' + id, entity)
export const RemovePropertyType = (id) => Axios().delete('PropertyTypes/' + id)

export const GetPropertyAttrs = () => Axios().get('PropertyAttributes')
export const GetPropertyAttrsById = (id) => Axios().get('Property/List/Attributes/' + id)
export const AddPropertyAttr = (entity) => Axios().post('PropertyAttributes/add', entity)
export const UpdatePropertyAttr = (entity) => Axios().post('Property/Attributes', entity)

export const GetAreas = () => Axios().get('Property/Areas')
export const AddArea = (entity) => Axios().post('Property/Areas', entity)

export const GetList = () => Axios().get('Property/List')
export const GetPrpList = () => Axios().get('Property/PrpList')
export const GetProperty = (id) => Axios().get('Property/List/' + id)
export const AddProperty = (entity) => Axios().post('Property/List', entity)
export const UpdateProperty = (id, entity) => Axios().put('Property/List/' + id, entity)

export const HeaderImage = (id, entity) => Axios().post('Property/List/Header/' + id, entity)
export const AddImages = (id, entity) => Axios().post('Property/List/Images/' + id, entity)
export const RemoveImages = (id, remove) => Axios().delete('Property/List/Images/' + id + '/' + remove)

export const GetAttrForType = (id) => Axios().get('Property/List/Attributes/' + id)
export const AddDocument = (id, docId) => Axios().get('Property/List/Documents/Add/' + id + '/' + docId)
export const AddRemark = (id, docId) => Axios().get('Property/List/Remarks/Add/' + id + '/' + docId)
export const GetPropertiesForGrid = () => Axios().get('Property/Grid')

export const UpdatePropertyStatus = (id, entity) => Axios().post('/Property/List/Status/' + id, entity)

export const GetAirCrafts = (id, agreement) => Axios().get('Property/Aircrafts/' + id + '/' + agreement)
export const GetAirCraftById = (id) => Axios().get('Property/Aircraft/' + id)
export const AddAirCraft = (id, agreement, entity) => Axios().post('Property/Aircrafts/' + id + '/' + agreement, entity)
export const UpdateAirCraft = (id, agreement, entity) => Axios().put('Property/Aircrafts/' + id + '/' + agreement, entity)
export const DeleteAirCraft = (id) => Axios().delete('Property/Aircrafts/' + id)