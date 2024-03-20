import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import StarIcon from '@mui/icons-material/StarBorder';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import FlightIcon from '@mui/icons-material/FlightLand';
import ListIcon from '@mui/icons-material/MapOutlined';
import PhoneIcon from '@mui/icons-material/Phone';
import { useNavigate } from 'react-router-dom';

const tiers = [
    {
        title: 'Transient Parking',
        buttonText: 'Submit',
        buttonVariant: 'contained',
        icon: <FlightIcon style={{ fontSize: '3rem' }} />,
        link: 'tiedown/create'
    },
    {
        title: 'Property Listing',
        buttonText: 'View Listings',
        buttonVariant: 'contained',
        icon: <ListIcon style={{ fontSize: '3rem' }} />,
        link: 'listings'
    },
    {
        title: 'Contact Us',
        buttonText: 'Learn More',
        buttonVariant: 'contained',
        icon: <PhoneIcon style={{ fontSize: '3rem' }} />,
        external: true,
        link: 'https://revjet360.com'
    },
];


export default function App() {

    const navigate = useNavigate()

    return (
        <React.Fragment>
            <Container>
                <Typography
                    component="h1"
                    variant="h2"
                    align="center"
                    color="text.primary"
                    gutterBottom
                >
                    RevJet 360
                </Typography>
                <Typography variant="h5" align="center" color="text.secondary" component="p">
                    Our focus on dynamic design and innovation is a part of our promise to push the boundaries of the field and develop new ideas and practices
                </Typography>
            </Container>
            {/* End hero unit */}
            <Container maxWidth="md" component="main">
                <Grid container spacing={5} alignItems="flex-end">
                    {tiers.map((tier, idx) => (
                        // Enterprise card is full width at sm breakpoint
                        <Grid
                            item
                            key={tier.title}
                            xs={12}
                            sm={tier.title === 'Enterprise' ? 12 : 6}
                            md={4}
                        >
                            <Card>
                                <CardHeader
                                    title={tier.title}
                                    subheader={tier.subheader}
                                    titleTypographyProps={{ align: 'center' }}
                                    action={tier.title === 'Pro' ? <StarIcon /> : null}
                                    subheaderTypographyProps={{
                                        align: 'center',
                                    }}
                                    sx={{
                                        backgroundColor: (theme) =>
                                            theme.palette.mode === 'light'
                                                ? theme.palette.grey[200]
                                                : theme.palette.grey[700],
                                    }}
                                />
                                <CardContent>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'baseline',
                                            mb: 2,
                                        }}
                                    >
                                    </Box>
                                    <Grid style={{ display: 'flex', justifyContent: 'center' }}>
                                        {tier.icon}
                                    </Grid>
                                </CardContent>
                                <CardActions>
                                    <Button onClick={() => {
                                        if (tier.external)
                                            document.location.href = tier.link
                                        else
                                            navigate(tier.link ? tier.link : '')
                                    }}
                                        fullWidth variant={tier.buttonVariant} >
                                        {tier.buttonText}
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
            {/* Footer */}
            <Container
                maxWidth="md"
                component="footer"
                sx={{
                    borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                    mt: 8,
                    py: [3, 6],
                }}
            >
            </Container>
        </React.Fragment>
    );
}