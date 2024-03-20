import React, { useEffect, useState, Fragment, createRef } from "react";
import { FormEditor } from "@bpmn-io/form-js-editor";

import { Button } from '@mui/material';
import { FormTypes } from "../configs/formTypes";
import { useLocation, useNavigate } from "react-router-dom";
import BackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';

import ArrowForward from '@mui/icons-material/ArrowForward';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import InputLabel from '@mui/material/InputLabel';

import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import SaveOutlined from '@mui/icons-material/SaveOutlined';
import { useForm, Controller } from "react-hook-form";
import Cron from 'react-cron-generator';
import 'react-cron-generator/dist/cron-builder.css'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import DialogContent from '@mui/material/DialogContent';
import Access from '../../../Utils/authorize';
import Scheduler from "material-ui-cron";
import NativeSelect from '@mui/material/NativeSelect';
import FormHelperText from '@mui/material/FormHelperText';

import { CreateInspectionBuilder, UpdateInspectionBuilder, getInspectionsById } from '../../../REST/inspections'
import CrudView from "../../../Utils/crud";
import { Checkbox, FormControlLabel } from "@material-ui/core";




const CreateInspection = (props) => {
	const navigate = useNavigate()
	const location = useLocation()


	const isAddMode = location.pathname === "/settings/inspection/createInspection";
	const id = isAddMode ? null : location.pathname.replace("/settings/inspection/createInspection/", "")
	useEffect(() => {

		if (!isAddMode) {
			getInspectionsById(id)
				.then((res) => {
					const data = res?.data?.formData
					const fields = ['expression', 'scheduled', 'name', 'module', 'description', 'schema'];
					fields.forEach((field) => {
						setValue(field, data[field])
						if(field == 'scheduled') isScheduled(data[field])
					}
					);
				})
				.catch((e) => { navigate("/settings/inspection") })
		}
	}, []);

	const modulevalues = ["Property", "Agreement"]
	const [openFormBuilder, setOpenFormBuilder] = React.useState(false)

	const [scheduled, isScheduled] = React.useState(false);


	const formjsurl = window.location.origin + "/forms"
	const iframeRef = createRef()


	const schema = yup.object({
		expression: yup.string().trim(),
		scheduled: yup.boolean().required(),
		name: yup.string().trim().required(),
		module: yup.string().trim().required(),
		description: yup.string().trim().required(),
		schema: yup.object({ components: yup.array(yup.object()).required().min(1, "Provide at least one Component") })
	}).required();


	const { control, register, getValues, setValue, handleSubmit, clearErrors, reset, formState: { errors } } = useForm({
		defaultValues: {
			expression: '0 0 * * *',
			name: '',
			description: '',
			scheduled: false,
			module: '',
			schema: { components: [] }
		},
		resolver: yupResolver(schema)
	});


	const isError = (val) => val !== undefined && val !== null && typeof val === 'object'

	const saveForm = (data) => {
		let newrecord = { ...data }
		console.log('data',data)
		console.log('control', control)
		if(!newrecord.scheduled) delete newrecord.expression
		if(isAddMode) {	

		  CreateInspectionBuilder({ "formData": newrecord })
		  .then(()=>{
			  navigate(-1); 
		  })
		}
		else	
		{
			UpdateInspectionBuilder(id,{ "formData": newrecord })
			.then(()=>{
			  navigate(-1); 
			})
		}	
	}
	// const  CronInput = ({ errors, field })=> {

	// 	console.log(field)

	// 	return <Fragment>
	// 		<Cron {...field} showResultText={true}
	// 			showResultCron={true} />
	// 		<span>
	// 		</span>
	// 	</Fragment>
	// }
	const getOptions = (opts = []) => {
		return [<option key='temp'>Select One</option>].concat(opts.map((e, idx) => {
			if (typeof e === 'string')
				return <option key={idx} value={e}>{e}</option>
			return <option key={idx} value={e._id}>{e.name}</option>
		}))
	}

	const FormBuilderControl = ({ errors, field }) => {
		const { name } = field
		return (
			<FormControl required error={isError(errors[name])} variant='standard' margin='dense' fullWidth>

				<Button {...register(name)} onClick={() => { setOpenFormBuilder(true) }} variant="outlined" >Form Builder</Button>

				{errors[name] && <FormHelperText>{errors[name].components.message}</FormHelperText>}
			</FormControl>
		)
	}
	const listenToFormBuilder = (e) => {
		if (e.data && e.data.source && e.data.source == "formjs") {
			setValue("schema", e.data.schema)
			setOpenFormBuilder(false)
		}

	}
	useEffect(() => {

		window.addEventListener("message", listenToFormBuilder)
	}, []);

	useEffect(() => {
		return () => {
			window.removeEventListener("message", listenToFormBuilder);

		}
	}, [])
	/**/
	const showFormBuilder = () => {
		const values = getValues()
		iframeRef.current.contentWindow.postMessage(values.schema, '*');
	}



	const getCron = () => {

		const schema =
			{ type: 'expression', required: true, headerName: 'Expression', flex: 1, field: 'expression', grid: true };
		// <Controller name="expression" control={control} render={({ field }) => <CronInput errors={errors} field={field} />} />	

		return <Controller key={schema.field} name={schema.field} control={control} render={({ field }) => {
			
				return <CronInputAdd errors={errors} field={field} isAdd={true} />
			
		}
		} />

		//  return <CrudView deletable={Access.isAdmin('Settings')} editable={Access.isAdmin('Settings')} schema={schema} title='Admin Inspection' type='AdminInspection' pageSize={10} />

	}



	function CronInputAdd({ errors, field }) {

		const { name, value, onChange } = field
		console.log('field--<',field)
		const [cronError, setCronError] = React.useState('') // get error message if cron is invalid
		//const [isAdmin, setIsAdmin] = React.useState(true) // set admin or non-admin to enable or disable high frequency scheduling (more than once a day)
		return (
			<Scheduler
				cron={value}
				setCron={(val)=> onChange(val)}
				setCronError={setCronError}
				isAdmin={true}
			/>
		)
	}
	return (
		<React.Fragment>
			<Button style={{ float: 'right', right: 40 }} variant='outlined' onClick={() => navigate(-1)}
				startIcon={<BackIcon />}>Back</Button>


			<Button
				variant="outlined"
				style={{ float: 'right', right: 50, zIndex: 99 }}
				//style={{ bottom: 20, left: '40%' }}
				// color="secondary"
				onClick={handleSubmit(saveForm)}
				startIcon={<SaveOutlined />}
			>
				Save Inspection
			</Button>
			<Controller name="name" control={control}
				render={({ field }) =>
					<TextField margin='dense' error={isError(errors.name)} helperText={errors.name && errors.name.message}
						fullWidth label='Name' {...field} />} />
			<Controller name="description" control={control}
				render={({ field }) =>
					<TextField margin='dense' error={isError(errors.description)} helperText={errors.description && errors.description.message}
						fullWidth label='Description' {...field} />} />
			<Controller name="module" control={control}
				render={({ field }) =>
					<FormControl required error={isError(errors.module)} variant='standard' margin='dense' fullWidth>
						<InputLabel shrink>Module</InputLabel>
						<NativeSelect {...field} >{getOptions(modulevalues)}</NativeSelect>
						{errors.module && <FormHelperText>{errors.module.message}</FormHelperText>}</FormControl>} />
			<Controller name="schema" control={control} render={({ field }) => <FormBuilderControl errors={errors} field={field} />} />

			<Controller name="scheduled" control={control}
				render={({ field }) =>
					<FormControlLabel {...field} control={<Checkbox checked={field.value}
						onInput={(evt) => { isScheduled(evt.target.checked) }} />} label="Is Scheduled" />} />
			{
				scheduled &&
				getCron()
				// <Controller name="expression" control={control} render={({ field }) => <CronInput errors={errors} field={field} />} />	
			}
			{openFormBuilder &&
				<iframe ref={iframeRef} src={formjsurl} style={{
					position: "fixed", top: "67px", bottom: "0px", right: "0px", width: "100%",
					border: "none", margin: "0", padding: "0", height: 'calc(100% - 67px)', zIndex: 999
				}}
					onLoad={showFormBuilder}>
				</iframe>
			}


		</React.Fragment>


	)


}
export default CreateInspection;



