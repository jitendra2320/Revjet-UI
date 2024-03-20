import React, { useEffect } from 'react';
import MuiAppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import GlobalStyles from '@mui/material/GlobalStyles';
import { Helmet } from 'react-helmet'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import SignIn from './Modules/Authentication/signIn';
import DefaultSettings from './Utils/settings';
import Loader from './Utils/loader';
import Alert from './Utils/alert';
import Landing from './Modules/Home/main';
import Home from './Modules/Home/';
import AuthProvider from './Modules/Authentication/authProvider';
import Access from './Utils/authorize';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListIcon from '@mui/icons-material/ListOutlined';
import ArticleIcon from '@mui/icons-material/Article';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountIcon from '@mui/icons-material/AccountCircle';
import LogOutIcon from '@mui/icons-material/Logout';
import Properties from './Modules/Properties';
import HomeIcon from '@mui/icons-material/HomeMaxOutlined'
import Settings from './Modules/Settings';
import CompanyView from './Modules/Company';
import AgreementView from './Modules/Agreements';
import AlignHorizontalLeftIcon from '@mui/icons-material/AlignHorizontalLeft';
import WaitList from './Modules/WaitList';
import Applicants from './Modules/WaitList/applicants';
import Invoices, { InvoiceDetail } from './Modules/Invoices';
import MessageView, { MessageFullScreen } from './Modules/Messages'
import LeaseListing from './Modules/WaitList/leasing';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import FlightLandIcon from '@mui/icons-material/FlightLand'
import TieDown from './Modules/WaitList/tiedown';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import MyAccount from './Modules/Settings/myaccount';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BellIcon from '@mui/icons-material/NotificationImportant';
import CalendarIcon from '@mui/icons-material/CalendarToday';
import Reports from './Modules/Reports';
import Charts from './Modules/Charts';
import PolicyOutlined from '@mui/icons-material/PolicyOutlined';
import MyInspection from './Modules/Inspection/myinspections';
import InspectionList from './Modules/Inspection/bpmn_form/InspectoinList'; 
import EditInspection from './Modules/Inspection/bpmn_form/editInspection';
import { GetCSRF } from './REST/authenticate'
import AdvancedReports from './Modules/Reports/advancedReports';
import AlertView from './Modules/Alerts';
import AppointmentView from './Modules/Appointment';
import OtherReports from './Modules/Reports/other';
import MicIcon from '@mui/icons-material/Mic';
import {DateTimeLocale} from './Utils/datetimelocale'
const SIGN_IN_URL = `${process.env.REACT_APP_COGNITO_URL}/login?response_type=code&client_id=${process.env.REACT_APP_COGNITO_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_COGNITO_SIGNIN}&scope=${process.env.REACT_APP_COGNITO_SCOPE}`


const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginRight: -drawerWidth,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: 0,
    }),
  }),
);



const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: drawerWidth,
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));


export default function PersistentDrawerRight() {
  const theme = useTheme();
  const navigate = useNavigate()
  const location = useLocation()
  const loaderView = React.useRef(null);
  const alertView = React.useRef(null);
  useEffect(() => {
    if (loaderView && loaderView.current)
      DefaultSettings.setLoader(loaderView.current);
    if (alertView && alertView.current)
      DefaultSettings.setAlert(alertView.current);
  }, [loaderView, alertView])

  const logOut = () => {
    sessionStorage.clear()
    localStorage.clear()
    handleDrawer(false)
    navigate('/', { replace: true })
  }

  const handleLink = (link,params) => {
    handleDrawer(false)
    navigate(link, { replace: true ,state:{location: params}})
  }

  const [open, setOpen] = React.useState(false);

  const handleDrawer = (state) => setOpen(state)

  useEffect(() => {
    GetCSRF()
  }, [])


  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <CssBaseline />
      <Helmet>
        <script type="text/javascript" src="https://sandbox.web.squarecdn.com/v1/square.js" />
      </Helmet>
      <Loader ref={loaderView} />
      <Alert ref={alertView} />
      <GlobalStyles styles={{ ul: { margin: 0, padding: 0, listStyle: 'none' } }} />
      <CssBaseline />
      <AppBar
        position="fixed"
        open={open}
        color="default"
        elevation={0}
        sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
      >
        <Toolbar sx={{ flexWrap: 'wrap' }}>
          <Typography variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }} style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            RevJet 360
          </Typography>
          {location.pathname.includes('/listings') && <Applicants />}
          {Access.user() && <IconButton onClick={() => handleDrawer(true)} sx={{ ...(open && { display: 'none' }) }}>
            <MenuIcon />
          </IconButton>}
          {!Access.user() && <Button href={SIGN_IN_URL} variant="outlined" sx={{ my: 1, mx: 1.5 }}>
            Login
            <MicIcon sx={{ ml: 1 }} /> {/* Add the microphone icon here */}
          </Button>}
        </Toolbar>
      </AppBar>
      <Main open={!!open} style={{ height: 'calc(100% - 77px)' }}>
        <MessageView />
        <DrawerHeader />
        <DateTimeLocale>
        <Routes>
          <Route exact path='/' element={<AuthProvider noAccess={() => <Landing />}><Home /></AuthProvider>} />
          <Route exact path='signin/:code' element={<SignIn />} />
          <Route path='tiedown/*' element={<TieDown />} />
          <Route path='appointment/*' element={<AppointmentView />} />
          <Route path='properties/*' element={<AuthProvider><Properties /></AuthProvider>} />
          <Route path='agreements/*' element={<AuthProvider><AgreementView /></AuthProvider>} />
          <Route path='alerts/*' element={<AuthProvider><AlertView /></AuthProvider>} />
          <Route path='settings/*' element={<AuthProvider key='settings'><Settings key='innerSettings' /></AuthProvider>} />
          <Route path='companies/*' element={<AuthProvider><CompanyView /></AuthProvider>} />
          <Route path='waitlist/*' element={<AuthProvider><WaitList /></AuthProvider>} />
          <Route path='listings/*' element={<LeaseListing />} />
          <Route path='invoices/*' element={<AuthProvider><Invoices /></AuthProvider>} />
          <Route path='myaccount/*' element={<AuthProvider><MyAccount /></AuthProvider>} />
          <Route path='/:id' element={<MessageFullScreen />} />
          <Route path='reports' element={<Reports />} />
          <Route path='interactive' element={<OtherReports />} />
          <Route path='charts' element={<Charts />} />
          <Route path='advancedReports' element={<AdvancedReports />} />
          <Route path='payment/:id' element={<InvoiceDetail editor={false} />} />
          <Route path='inspection' element={ <AuthProvider><MyInspection /></AuthProvider> } />
          <Route path={'inspection/inspectionList/:id'}  element={<AuthProvider><InspectionList /></AuthProvider>} />
          <Route path={'inspection/editinspection/:id'}  element={<AuthProvider><EditInspection /></AuthProvider> } />
        </Routes>
        </DateTimeLocale>
      </Main>


      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
          },
        }}
        variant="persistent"
        anchor="right"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={() => handleDrawer(false)}>
            {theme.direction === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {getAvailable(links).map((link, index) => (
            <ListItem button key={index} onClick={() => handleLink(link.link,link?.params)}>
              <ListItemIcon>
                {link.icon}
              </ListItemIcon>
              <ListItemText primary={link.text} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem button onClick={logOut}>
            <ListItemIcon>
              <LogOutIcon />
            </ListItemIcon>
            <ListItemText primary={'Log Out'} />
          </ListItem>
        </List>
      </Drawer>
    </Box >
  );
}

export const getAvailable = (links = []) => {
  const result = links.filter(x => {
    if (x.external)
      return !Access.isInternal()
    if (x.secure) {
      if (Access.isInternal())
        return x.module ? Access.hasAccess(x.module) : true
      else
        return false
    }
    if (Access.isInternal() && x.module) {
      return Access.hasAccess(x.module)
    }
    if (!Access.isInternal() && x.module) {
      return true
    }
    if (!x.module)
      return true
    return false
  })
  return result
}

export const links = [
  { icon: <HomeIcon />, text: 'Dashboard', link: '/' },
  { icon: <AccountIcon />, text: 'Contacts', link: '/companies', module: 'Company' },
  { icon: <FlightLandIcon />, text: 'Transient Parking', link: '/tiedown', module: 'Tiedown' },
  { icon: <ListIcon />, text: 'Property Listings', link: '/properties/listings', secure: true, module: 'Property' },
  { icon: <ListIcon />, text: 'Property Listings', link: '/listings', external: true, module: 'Property' },
  { icon: <ArticleIcon />, text: 'Lease Agreements', link: '/agreements', module: 'Lease' },
  { icon: <AlignHorizontalLeftIcon />, text: 'WaitList', link: '/waitList', secure: true, module: 'Waitlist' },
  { icon: <SettingsIcon />, text: 'Settings', link: '/settings', secure: true, module: 'Settings' },
  { icon: <MonetizationOnIcon />, text: 'Invoices', link: '/invoices', module: 'Invoices' },
  { icon: <ManageAccountsIcon />, text: 'My Account', link: '/myaccount' },
  { icon: <ShowChartIcon />, text: 'Reports', link: '/interactive', module: 'Reports' },
  { icon: <BellIcon />, text: 'Alerts', link: '/alerts' },
  { icon: <CalendarIcon />, text: 'Appointments', link: '/appointment' },
  { icon: <PolicyOutlined />, text: 'My Inspection', link: '/inspection',params:{isFromHome:true} },
  
]