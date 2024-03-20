import Axios from './base';

export const GetCharts = (data) => Axios().post('Ktrm', data)
