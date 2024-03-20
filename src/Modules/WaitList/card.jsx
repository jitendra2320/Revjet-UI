import * as React from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import { CardActionArea } from '@mui/material';
import noimage from '../../noimage.png';

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

export default function RecipeReviewCard({ data }) {
    const [expanded, setExpanded] = React.useState(false);
    const navigate = useNavigate()
    const { name, headerImage, description, rent, propertyName, areaName, recentAvailability, _id } = data

 

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    // const getDate = (dates = []) => {
    //     dates.sort((a, b) => {
    //         return new Date(a).getTime() - new Date(b).getTime()
    //     })

    //     return new Date(dates[0]).toDateString()
    // }

    const handleLink = (id) => navigate('/listings/' + id)

    return (
        <Card className='col-6 mt-2' sx={{ minWidth: 300 }}>
            <CardHeader
                avatar={
                    <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                        {propertyName.charAt(0)}
                    </Avatar>
                }
                // action={
                //     <IconButton aria-label="settings">
                //         <MoreVertIcon />
                //     </IconButton>
                // }
                title={name}
                subheader={new Date(recentAvailability).toDateString()}
            />
            <CardActionArea>
              { headerImage ? <CardMedia
                    component="img"
                    height="194"
                    image={process.env.REACT_APP_API_URL + '/api/Property/List/Images/' + headerImage}
                    alt="Dashboard"
                    onClick={() => handleLink(_id)}
                /> : <CardMedia
                component="img"
                height="194"
                image={noimage }
                alt="Dashboard"
                onClick={() => handleLink(_id)}
            />}
            </CardActionArea>
            <CardContent>
                <Typography variant="body2" color="text.secondary">
                    {description}
                </Typography>
            </CardContent>
           {/*<CardActions disableSpacing>*/}
               {/*} <ExpandMore
                    expand={expanded}
                    onClick={handleExpandClick}
                    aria-expanded={expanded}
                    aria-label="show more"
                >
                    <ExpandMoreIcon />
                </ExpandMore>
            {/*</CardActions>*/}
           {/* <Collapse in={expanded} timeout="auto" unmountOnExit> */}
                <CardContent>
                    <Typography paragraph>
                        Area: {areaName}
                    </Typography>
                    <Typography paragraph>
                        Property Type: {propertyName}
                    </Typography>
                    <Typography paragraph>
                        Rent: ${rent.toFixed(2)}
                    </Typography>
                </CardContent>
           {/* </Collapse> */}
        </Card>
    );
}
