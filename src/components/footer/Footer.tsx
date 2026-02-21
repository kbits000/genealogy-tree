import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function Footer() {
    return (
        <Box
        component='footer'
        sx={{
            padding: '20px',
            textAlign: 'center'
        }}
        >
            <Typography variant="body2">
                © {new Date().getFullYear()} Kbits000. All rights reserved.
            </Typography>
        </Box>
    )
}