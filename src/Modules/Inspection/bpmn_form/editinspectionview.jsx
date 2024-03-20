import * as React from 'react';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
 
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function FullScreenDialog(props) {
 const {handleClose,schema,data,componenetgenerator} = props
 const {createdBy,createdDate,...formdata} = data
  const showFields =  schema.components.filter((x)=>{ return ! ["button","text","image"].includes( x.type)  } )
        .map( (x)=>{
                const generator = componenetgenerator(x)
                const value = generator({value:formdata[x.key]}) 
                const label = x.label
                return (
                    <React.Fragment key={x.key}>
                    <ListItem   >
                    <ListItemText 
                    primary={
                      <React.Fragment>
                        <Typography variant="h6" gutterBottom>
                          {label}
                        </Typography>
                        </React.Fragment>} 
                      secondary={
                            <React.Fragment>
                              <Typography
                                sx={{ display: 'inline' }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                 {value}
                              </Typography>
                               
                            </React.Fragment>
                          } />
                    </ListItem>
                    <Divider />
                    </React.Fragment>
                )

        }  )
   

  return (
    <div>
      
      <Dialog
        fullScreen
        open={true}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            
          
          </Toolbar>
        </AppBar>
        <List>
          {showFields}
          <ListItem   >
              <ListItemText 
              primary={
                <React.Fragment>
                  <Typography variant="h6" gutterBottom>
                    {"Created By"}
                  </Typography>
                  </React.Fragment>} 
                secondary={
                      <React.Fragment>
                        <Typography
                          sx={{ display: 'inline' }}
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                            {createdBy}
                        </Typography>
                          
                      </React.Fragment>
                    } />
          </ListItem>
              <ListItem   >
              <ListItemText 
              primary={
                <React.Fragment>
                  <Typography variant="h6" gutterBottom>
                    {"Created Date"}
                  </Typography>
                  </React.Fragment>} 
                secondary={
                      <React.Fragment>
                        <Typography
                          sx={{ display: 'inline' }}
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                            {new Date(createdDate).toLocaleString()}
                        </Typography>
                          
                      </React.Fragment>
                    } />
          </ListItem>
        </List>
      </Dialog>
    </div>
  );
}