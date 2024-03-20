import { createTheme } from "@material-ui/core";

export const defaultTheme = createTheme({
  palette: {
    primary: {
      main: "#3f51b5",
      //   main: "#1888A9",
      // main:'#006D82',
      contrastText: "#fff",
    },
    secondary: {
      main: "#f50057",
      // main: '#1888A9',
      contrastText: "#fff",
    },
    otherColors: {
      red: "red", //EB8200
    },
  },
  spacing: 6,
  components: {
    MuiFormLabel: {
      styleOverrides: {
        asterisk: { color: "red" },
      },
    },
  },
  overrides: {
    MuiListItem: {
      root: {
        "&$selected": {
          backgroundColor: "#fff",
          "&:hover": {
            backgroundColor: "orange",
          },
        },
      },
      button: {
        "&:hover": {
          backgroundColor: "#F5F5F5",
        },
      },
    },
  },
});
