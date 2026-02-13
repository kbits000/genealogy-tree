
import IndividualsList from "@/components/admin_page/individuals_list";
import AdminSidebar from "@/components/admin_page/admin_sidebar";
import Box from "@mui/material/Box";
import AdminBreadcrumbs from "@/components/admin_page/admin_breadcrumbs";
import Footer from "@/components/footer/Footer";
import Link from "@/components/Link";
import Button from '@mui/material/Button';
import { getAllIndividuals } from "@/lib/_data_access/individuals";

export default async function AdminIndividualsPage() {
    const individuals = await getAllIndividuals();

    return (
        <div>
            <AdminSidebar selectedButton={'Individuals'} />
            <Box sx={{px:4, py: 0}}>
                <AdminBreadcrumbs breadcrumbsList={[{text: 'Admin', path: '/admin'}, {text: 'Individuals', path: '#'}]}/>
                <Button variant="contained" component={Link} href="/admin/individuals/add">
                    اضافة فرد
                </Button>
                <IndividualsList individuals={individuals}/>
            </Box>
            <Footer />
        </div>
    )
}

// export default function AdminIndividualsPage() {
//
//     return (
//         <Box sx={{ display: 'flex', minHeight: '100vh' }}>
//             <AdminSideBar selectedButton={"Individuals"} />
//
//             <Box
//                 sx={{
//                     flexGrow: 1,
//                     p: 3, // Add some padding to the main content area
//                     width: { sm: `calc(100% - ${DRAWER_WIDTH})` },
//                 }}
//             >
//                 <Toolbar />
//                 <AdminBreadcrumbs
//                     breadcrumbsList={ [ {text: "Admin", path: "/admin"}, {text: 'Individuals', path: "#"} ] }
//                 />
//                 <Typography
//                     sx={{
//                         textAlign: 'center',
//                         margin: 2,
//                     }}
//                     variant="h4"
//                     gutterBottom={true}
//                 >
//                     Admin Page Individuals
//                 </Typography>
//                 <Box sx={{ flexGrow: 1 }}>
//                     <IndividualsList />
//                 </Box>
//                 <Footer />
//             </Box>
//         </Box>
//     )
// }