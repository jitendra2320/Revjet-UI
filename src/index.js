import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { HashRouter } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material';

const theme = createTheme({
  typography: {
    fontFamily: [
      // 'Quicksand',
      'PT Sans',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
});

// try {
//   const time = parseInt(sessionStorage.getItem('expiresIn'))
//   if (new Date().getTime() > time)
//     sessionStorage.clear()
// }
// catch (ex) {
//   console.log('No Token')
// }

document.getElementById('root').classList.add('h-100')

ReactDOM.render(
  <HashRouter>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </HashRouter>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
