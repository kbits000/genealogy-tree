
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

export default function AdminBreadcrumbs({breadcrumbsList}: {breadcrumbsList: {text: string, path: string}[]}) {
    return (
        <Box>
            <Breadcrumbs aria-label="breadcrumb">
                {breadcrumbsList.map((item) => (
                    item.path === "#" ? (
                        <Typography key={item.text} sx={{ color: 'text.primary' }}>{item.text}</Typography>
                    ) : (
                        <Link key={item.text} underline="hover" color="inherit" href={item.path}>
                            {item.text}
                        </Link>
                    )
                ))}
            </Breadcrumbs>
        </Box>
    )
}