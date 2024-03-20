import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const ShowConfirm = (props)=>{
    const { onClose,onAccept, open ,title} = props;

    const handleClose = () => {
      onClose();
    };
  
    const handleAccept = (value) => {
        onClose();
        onAccept();
    };
    return (
    <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
            <DialogContentText>Do You really want to continue ?</DialogContentText>
            
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleAccept}>Proceed</Button>
        </DialogActions>
    </Dialog> )
}


export default ShowConfirm;