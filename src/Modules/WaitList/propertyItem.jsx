import React, { useState, useEffect } from 'react';
import { GetProperty, GetAttrForType } from "../../REST/properties"
import { useParams } from 'react-router-dom';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import PhotoGallery from './photoGallery'
import { dateFormat } from '../../helpers/dates';

export default function PropertyItem() {
    const [data, setData] = useState([])
    const [photos, setPhotos] = useState([])

    const { id } = useParams()
    const [attrs, setAttrs] = useState([])

    const { rent } = data
    useEffect(() => {
        (async () => {
            const value = await GetProperty(id)
            const { data } = value
            const attributes = await GetAttrForType(data.propertyType)

            setAttrs(attributes.data.map(each => {
                const f = data.attributes.find(e => each._id === e.name)
                if (f) {
                    return { ...each, value: f.value }
                } else return { ...each, value: ' ' }
            }))
            const { images } = data
            if (images.length) setPhotos(images.map(e => { return { src: process.env.REACT_APP_API_URL + '/api/Property/List/Images/' + e, width: 1, height: 1 } }))
            setData(data)
        })()
    }, [id])



    return (<div className="row h-100 pt-2" style={{ overflow: 'hidden' }}>
        <div className='col-6'>
            <iframe src={process.env.PUBLIC_URL + '/grid.html?property=' + id}
                frameBorder="0"
                marginHeight="0"
                marginWidth="0"
                width="100%"
                height="100%"
                title='Template Editor'
                scrolling="auto" />
        </div>
        <div className='col-6'>
            <h3 className="font-weight-bold text-primary clearfix">
                {data.name}
                <small className="float-right">
                    <Link component="button" variant="body2">   </Link>
                </small>
            </h3>
            <Divider />
            <small style={{ float: 'right' }}>Available Start Date:  {(data && data.availableDate && dateFormat(data.availableDate)) || ''}</small><br />
            <div style={{ float: 'right' }}>$ {rent} / Month</div>
            {attrs.map((each, idx) => {
                return <div key={idx + each.name} className='mt-2'>
                    <h5 className="font-weight-bold text-primary clearfix" >
                        {each.name}
                    </h5>
                    <div >{each.value == null || "" ? "Not Available" : each.value}</div>
                </div>

            })}

            <div className='mt-3'>
                {photos.length && <PhotoGallery photos={photos} />}
            </div>

        </div>


    </div>




    )
}