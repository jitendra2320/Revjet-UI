import React, { Fragment, useEffect, useState, useImperativeHandle, forwardRef, createRef, useRef } from 'react'
import Button from '@mui/material/Button'
import { useForm, Controller, useFormState } from "react-hook-form";
import { useParams } from 'react-router-dom'
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import NativeSelect from '@mui/material/NativeSelect';
import FormHelperText from '@mui/material/FormHelperText';
import { yupResolver } from '@hookform/resolvers/yup';
import { GetAreas, GetPropertyTypes, GetAttrForType, UpdateProperty } from '../../REST/properties'
import * as yup from "yup";
import MapSelectView from './location';
import SaveIcon from '@mui/icons-material/Save';
import {DateTimeControl} from '../../Utils/datetimelocale';
import { DatePicker } from '@mui/x-date-pickers';
import { handleErr } from '../../helpers/errors';


export default function PropertyEditView({ listing, onRefresh }) {
    const { id } = useParams()
    const [attr, setAttr] = useState([])
    const [area, setArea] = useState([])
    const [type, setType] = useState([])

    const schema = yup.object({
        name: yup.string().trim().required(),
        description: yup.string().trim().required(),
        area: yup.string().trim().required(),
        rent: yup.number().required(),
        propertyType: yup.string().trim().required(),
        address: yup.string().trim().required()
    })

    const {register, control, handleSubmit, setError, formState: { errors }, clearErrors, reset, getValues } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: '',
            description: '',
            rent: '',
            address: '',
            area: '',
            propertyType: '',
            availableDate: '',
            visibletoExternal: true
        }
    });

    const { isDirty } = useFormState({ control })

    const isError = (val) => val !== undefined && val !== null && typeof val === 'object'

    useEffect(() => {
        (async () => {
            if (listing && listing.propertyType) {
                const attrs = await GetAttrForType(listing.propertyType)
                const areas = await GetAreas()
                const types = await GetPropertyTypes()
                setArea(x => areas.data)
                setType(y => types.data)
                if (Array.isArray(attrs.data)) {
                    setAttr(attrs.data)
                }
                reset(listing)
            }
            clearErrors()
        })()
    }, [listing, clearErrors, reset, id])

    useEffect(() => {
        reset(getValues())
    }, [isDirty, getValues, reset])

    const onSubmit = data => {
        console.log(data)
        const result = { ...data, availableDate: data.availableDate ? data.availableDate : '' }
        //if (elementRef && elementRef.current) {
            const attrResult =  elementRef && elementRef.current ? elementRef.current.save() : []
            Promise.all(attrResult).then(async (each) => {

                if(each.length > 0)
                {
                    result.attributes = attr.map((e, idx) => {
                        const label = toCamelCaseString(e.name)
                        return { name: e._id, value: each[idx][label] }
                    })
                }  
                else result.attributes = []

                const resp = await UpdateProperty(id, result).catch((err) => {
                    handleErr(err, setError)
                })
                if (resp) onRefresh()
            }).catch(ex => {
                console.log(ex)
            })
        //}
    }


    const getOptions = (opts = []) => {
        return [<option key='temp'>Select One</option>].concat(opts.map((e, idx) => {
            return <option key={idx} value={e._id}>{e.name}</option>
        }))
    }

    const elementRef = useRef(null)

    return (
        <>
            <Controller name="name" control={control} render={({ field }) => <TextField variant='standard' margin='dense' required error={isError(errors.name)} helperText={errors.name && errors.name.message} fullWidth label='Name' {...field} />} />
            <Controller name="description" control={control} render={({ field }) => <TextField variant='standard' margin='dense' required error={isError(errors.description)} helperText={errors.description && errors.description.message} fullWidth label='Description' {...field} />} />
            <Controller name="area" control={control} render={({ field }) => <FormControl error={isError(errors.area)} variant='standard' required margin='dense' fullWidth><InputLabel shrink >Area</InputLabel><NativeSelect {...field} >{getOptions(area)}</NativeSelect>{errors.area && <FormHelperText>{errors.area.message}</FormHelperText>}</FormControl>} />
            <Controller name="rent" control={control} render={({ field }) => <TextField variant='standard' margin='dense' required error={isError(errors.rent)} helperText={errors.rent && errors.rent.message} fullWidth label='Rental Amount' type='number' {...field} />} />
            <Controller name="propertyType" control={control} render={({ field }) => <FormControl error={isError(errors.propertyType)} required variant='standard' margin='dense' fullWidth><InputLabel shrink>Property Type</InputLabel><NativeSelect {...field}>{getOptions(type)}</NativeSelect>{errors.propertyType && <FormHelperText>{errors.propertyType.message}</FormHelperText>}</FormControl>} />
             <Controller name="availableDate"    control={control} 
                       render={({ field }) => 
                  <DateTimeControl label='Availability' register={register}  errors={errors} field={field} />} />
            <Controller name="address" control={control} render={({ field }) => <TextField variant='standard' margin='dense' required error={isError(errors.address)} helperText={errors.address && errors.address.message} fullWidth label='Address' {...field} />} />
            <Controller name="visibletoExternal" control={control} render={({ field }) => <FormControlLabel {...field} control={<Checkbox checked={field.value} />} label="Visible to External?" />} />
            <MapSelectView text={listing.location && listing.location.coordinates} refresh={onRefresh} />
            {attr && attr.length > 0 && <AttributeGroupRefView data={listing.attributes} attributes={attr} ref={elementRef} />}
            < Button variant='outlined' startIcon={<SaveIcon />} onClick={handleSubmit(onSubmit)}>Save</Button>
        </>
    )

}

function AttributeGroupView({ attributes = [], data = [] }, ref) {

    useImperativeHandle(ref, () => ({
        save: () => {
            const attrResult = attributes.map((e, idx) => {
                return dRefs.current[idx].current.save()
            })
            return attrResult
        }
    }))

    const getVal = (idx) => {
        if (data && data.length && data[idx])
            return data[idx].value || 'NA'
        else
            return 'NA'
    }

    const dRefs = useRef(attributes.map(e => createRef()))

    return attributes.map((e, idx) => {
        return <AttributeRefView value={getVal(idx)} key={idx} type={e.attributeType} ref={dRefs.current[idx]} label={e.name} />
    })
}

const AttributeGroupRefView = forwardRef(AttributeGroupView)

function AttributeView({ label, value = '', type }, ref) {

    const schema = yup.object({
        [toCamelCaseString(label)]: yup.string().trim().required()
    })

    const {register, control, handleSubmit, formState: { errors }, clearErrors, reset } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            [toCamelCaseString(label)]: value
        }
    });

    const isError = (val) => val !== undefined && val !== null && typeof val === 'object'

    useEffect(() => {
        clearErrors()
        reset({ [toCamelCaseString(label)]: value })
    }, [clearErrors, reset, value, label])

    useImperativeHandle(ref, () => ({
        save: () => {
            const promise = new Promise((resolve, reject) => {
                handleSubmit((data) => {
                    console.log(data)
                    resolve(data)
                })()
            })
            return promise
        }
    }));

    return <Fragment>
        {type === 'Text' && <Controller name={toCamelCaseString(label)} control={control} render={({ field }) => <TextField InputLabelProps={{
            shrink: true,
        }} variant='standard' margin='dense' required error={isError(errors[label])} helperText={errors[label] && errors[label].message} fullWidth label={label} {...field} />} />}
        {type === 'Numeric' && <Controller name={toCamelCaseString(label)} control={control} render={({ field }) => <TextField InputLabelProps={{
            shrink: true,
        }} variant='standard' type='number' margin='dense' required error={isError(errors[label])} helperText={errors[label] && errors[label].message} fullWidth label={label} {...field} />} />}
        {type === 'Date' &&  
              
            <Controller name={toCamelCaseString(label)}    control={control} 
                       render={({ field }) => 
                   <DateTimeControl label={label} register={register}  errors={errors} field={field} />} />
        }
    </Fragment>
}


const AttributeRefView = forwardRef(AttributeView)

function convertToString(input) {
    if (input) {
        if (typeof input === "string") {
            return input;
        }
        return String(input);
    }
    return '';
}

function toWords(input) {
    input = convertToString(input);
    var regex = /[A-Z\xC0-\xD6\xD8-\xDE]?[a-z\xDF-\xF6\xF8-\xFF]+|[A-Z\xC0-\xD6\xD8-\xDE]+(?![a-z\xDF-\xF6\xF8-\xFF])|\d+/g;
    return input.match(regex);
}

function toCamelCase(inputArray) {
    let result = "";
    for (let i = 0, len = inputArray.length; i < len; i++) {
        let currentStr = inputArray[i];
        let tempStr = currentStr.toLowerCase();
        if (i !== 0) {
            tempStr = tempStr.substr(0, 1).toUpperCase() + tempStr.substr(1);
        }
        result += tempStr;
    }
    return result;
}

function toCamelCaseString(input) {
    let words = toWords(input);
    return toCamelCase(words);
}