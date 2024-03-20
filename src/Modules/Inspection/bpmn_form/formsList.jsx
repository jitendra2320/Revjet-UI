import React, { Fragment, useState } from "react";
// import {
//   List,
//   ListItem,
//   ListItemText,
//   IconButton,
//   ListItemSecondaryAction,
//   Box,
//   makeStyles,
//   Paper,
//   Typography,
//   Tooltip,
// } from "@mui/material";
import {ListItemText,
   List,
   ListItem,
   IconButton,
   ListItemSecondaryAction,
   Box,makeStyles,
   Paper,Typography,
   Tooltip} from "@mui/material";
import Header from "../layout/header";
import {  Edit, Delete, Refresh } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { FormTypes } from "../configs/formTypes";

const FormsList = (props) => {
  const navigate = useNavigate();
  const classes = useStyles();

  let [formsList, setFormsList] = useState(
    localStorage.getItem("forms")
      ? JSON.parse(localStorage.getItem("forms"))
      : []
  );

  const __renderFormsList = () => {
    return (
      <Box
        style={{
          display: "flex",
          justifyContent: " space-around",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Box component={"div"} style={{ width: "70%" }}>
          <List component="ul">
            {formsList?.length ? (
              formsList.map((form, index) => {
                return (
                  <Paper className={classes.paper}>
                    <ListItem key={index} button onClick={() => {}}>
                      <ListItemText
                        primary={`${form?.schema?.id}`}
                        primaryTypographyProps={{
                          className: classes.formTitle,
                        }}
                        color={"#000"}
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Use Form">
                        <IconButton
                          onClick={() => {
                            navigate("editForm", {
                              state: {
                                location: {
                                  formType: FormTypes.EDIT,
                                  formIndex: index,
                                },
                              },
                            });
                          }}
                        >
                          <Refresh />
                         
                        </IconButton>
                        </Tooltip>
                          
                        <Tooltip title="Edit Form">
                        <IconButton
                          onClick={() => {
                            navigate("createForm", {
                              state: {
                                location: {
                                  formType: FormTypes.MODIFY,
                                  formIndex: index,
                                },
                              },
                            });
                          }}
                        >
                           <Edit />
                        </IconButton>
                        </Tooltip>
                        
                      </ListItemSecondaryAction>
                    </ListItem>
                  </Paper>
                );
              })
            ) : (
              <Paper className={[classes.paper]}>
                <Typography>
                  No forms available. Try creating a new form
                </Typography>
              </Paper>
            )}
          </List>
        </Box>
      </Box>
    );
  };

  return (
    <Fragment>
      <Header showAddButton={true} title={"Forms"} />
      {__renderFormsList()}
    </Fragment>
  );
};

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: 20,
    marginTop: 10,
    marginBottom: 10,
    overflowY: "auto",
  },
  noDataHeight: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  formTitle: {
    fontWeight: "bold",
  },
}));

export default FormsList;
