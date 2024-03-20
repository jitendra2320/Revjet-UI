import React from 'react';
import { UploadDocument, UploadFactsheet } from "../../REST/utilities";



export default function Factsheet() {
    return <div>
        Upload Factsheet
        <UploadDoc />
    </div>
}

function UploadDoc() {

    const handleFile = async (evt) => {
        const files = evt.target.files;
        if (files && files.length > 0) {
            const img = {
                preview: URL.createObjectURL(files[0]),
                data: files[0],
            }
            let formData = new FormData()
            formData.append('file', img.data)
            UploadFactsheet(formData)
        }
    }
    return (<div>
        <input type='file' accept='image/*,.pdf' onChange={handleFile} className='form-control' key='inputfile' />
    </div>)
}



