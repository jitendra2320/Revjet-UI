import React from "react";
import Fab from "@mui/material/Fab";
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from "react-router-dom";
import { CssBaseline, Tooltip } from "@mui/material";
import { AppBar, Toolbar, Typography } from "@mui/material";
import { FormTypes } from "../configs/formTypes";
import { ArrowBack } from "@mui/icons-material/ArrowBack";

const Header = (props) => {
  const { showAddButton, title, showHeaderBack } = props;
  const navigate = useNavigate();
  const handleToggle = () => {
    navigate("/createForm", {
      state: {
        location: {
          formType: FormTypes.CREATE,
        },
      },
    });
  };
  return (
    <>
      <CssBaseline />
      <AppBar position="sticky">
        <Toolbar>
          {showHeaderBack ? (
            <Fab
              color="secondary"
              aria-label="back"
              size="small"
              onClick={() => {
                navigate(-1);
              }}
            >
               <Tooltip title="Back">
              <ArrowBack />
              </Tooltip>
            </Fab>
          ) : null}
          <Typography
            variant="h5"
            color="inherit"
            style={{ flex: 1, fontWeight: "bold" }}
          >
            {title}
          </Typography>
          {showAddButton ? (
            <Fab
              color="secondary"
              aria-label="add"
              size="small"
              onClick={handleToggle}
            >
              <Tooltip title="Create New Form">
              <AddIcon />
              </Tooltip>
            </Fab>
          ) : null}
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Header;
