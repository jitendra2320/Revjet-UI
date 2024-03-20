import Axios from './base';

export const GetList = (type) => Axios().get('Crud/' + type)
export const GetById = (type, id) => Axios().get('Crud/' + type + '/' + id)
export const AddItem = (type, entity) => Axios().post('Crud/' + type, entity)
export const UpdateItem = (type, id, entity) => Axios().put('Crud/' + type + '/' + id, entity)
export const DeleteItem = (type, id) => Axios().delete('Crud/' + type + '/' + id)




