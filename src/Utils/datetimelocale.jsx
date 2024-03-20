import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';


const  DateTimeLocale = (props)=>{
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>  
            {props.children}
        </LocalizationProvider>

    )
}
 

  
const DateTimeControl = ({ errors, field,register,label }) => {
    const { name,value,onChange } = field
     
    const isError = (val) => val !== undefined && val !== null && typeof val === 'object'
    const onChangeDayjs = (params) => {
       
      
      onChange(params.toISOString());
    };
    return (
      <FormControl required error={isError(errors[name])} variant='standard' margin='dense' fullWidth>
        <DatePicker
        label={label}
        value={dayjs(value)}
        {...register(name)}
        onChange={onChangeDayjs}
       
        />
        
  
        {errors[name] && <FormHelperText>{errors[name].message}</FormHelperText>}
      </FormControl>
    )
  }

export {
    DateTimeLocale,DateTimeControl
}