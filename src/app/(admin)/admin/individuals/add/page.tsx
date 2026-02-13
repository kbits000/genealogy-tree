'use server'

import AdminSidebar from "@/components/admin_page/admin_sidebar";
import Box from "@mui/material/Box";
import AdminBreadcrumbs from "@/components/admin_page/admin_breadcrumbs";
import Footer from "@/components/footer/Footer";
import IndividualSubmissionForm from "@/components/admin_page/individuals_page/individual_submission_form";

export default async function IndividualsAddPage() {
    return (
            <div dir='rtl'>
                <AdminSidebar selectedButton={'Individuals'} />
                <Box sx={{px:4, py: 0}}>
                    <AdminBreadcrumbs breadcrumbsList={[{text: 'المشرف', path: '/admin'}, {text: 'الافراد', path: '#'}]}/>
                    <h1>اضافة افراد جدد</h1>
                    <IndividualSubmissionForm />
                </Box>
                <Footer />
            </div>
    )
}