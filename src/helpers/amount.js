
import NumberFormat from 'react-number-format';

export const getAmount = (val) => {
    //console.log('value--------',val)
    return <NumberFormat prefix='$' thousandSeparator displayType='text' value={val} fixedDecimalScale={2} />
}
