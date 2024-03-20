import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import ShareIcon from '@mui/icons-material/Share';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import ArrowIcon from '@mui/icons-material/ArrowRight';
import { GetAlertById, SendEmail, DeleteAlert } from '../../REST/alert';
import PrintIcon from '@mui/icons-material/Print';
import DeleteIcon from '@mui/icons-material/Delete';

const ExpandMore = styled((props) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));

export default function RecipeReviewCard({ open, handleClose, item = {} }) {
    const [expanded, setExpanded] = React.useState(false);
    const [email, setEmail] = React.useState('')

    React.useEffect(() => {
        if (item)
            GetAlertById(item.id)
    }, [item])

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const handleEmail = () => {
        SendEmail({ email, id: item.id }).then(resp => {

        }).catch(err => console.log)
    }

    const handleDelete = () => {
        DeleteAlert(item.id).then(resp => {
            handleClose()
        }).catch(err => console.log)
    }

    const printElem = () => {
        let mywindow = window.open('', 'PRINT', 'height=400,width=600');
        mywindow.document.write('<html><head><title>' + document.title + '</title>');
        mywindow.document.write('</head><body >');
        mywindow.document.write(document.getElementById('printContent').innerHTML);
        mywindow.document.write('</body></html>');

        mywindow.document.close(); // necessary for IE >= 10
        mywindow.focus(); // necessary for IE >= 10*/

        mywindow.print();
        mywindow.close();
        return true;
    }

    return (
        <Dialog onClose={handleClose} open={open}>
            <div className='d-none' id='printContent'>
                <h4>{item.subject}</h4>
                <h6>{new Date(item.date).toLocaleString()}</h6>
                <section>
                    <article>
                        {item.message}
                    </article>
                </section>
            </div>
            <Card sx={{ maxWidth: 345 }}>
                <CardHeader
                    avatar={
                        <Avatar sx={{ bgcolor: red[500] }} >
                            M
                        </Avatar>
                    }
                    title={item.subject}
                    subheader={new Date(item.date).toLocaleString()}
                />
                <CardContent>
                    <Typography variant="body" color="text.secondary">
                        <div dangerouslySetInnerHTML={{ __html: item.message }} />
                    </Typography>
                </CardContent>
                <CardActions disableSpacing>
                    <IconButton onClick={() => printElem()}>
                        <PrintIcon />
                    </IconButton>
                    <IconButton onClick={handleDelete}>
                        <DeleteIcon />
                    </IconButton>
                    <ExpandMore
                        expand={expanded}
                        onClick={handleExpandClick}
                    >
                        <ShareIcon />
                    </ExpandMore>
                </CardActions>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <Paper
                        component="form"
                        sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', border: '1px solid black', m: 1 }}
                    >
                        <InputBase
                            sx={{ ml: 1, flex: 1 }}
                            value={email}
                            placeholder="Send Email"
                            onChange={evt => setEmail(evt.target.value)}
                        />
                        <IconButton onClick={handleEmail} color="primary" sx={{ p: '10px' }} >
                            <ArrowIcon />
                        </IconButton>
                    </Paper>
                </Collapse>
            </Card>
        </Dialog >
    );
}
