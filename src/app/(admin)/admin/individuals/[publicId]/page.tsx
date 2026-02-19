import AdminSidebar from "@/components/admin_page/admin_sidebar";
import Box from "@mui/material/Box";
import AdminBreadcrumbs from "@/components/admin_page/admin_breadcrumbs";
import Footer from "@/components/footer/Footer";
import IndividualDetails from "@/components/admin_page/individuals_page/individual_details";
import { getIndividualByPublicId } from "@/lib/_data_access/individuals";
import { notFound } from "next/navigation";

export default async function IndividualsDetailsPage({ params }: { params: Promise<{ publicId: string }> }) {
    const { publicId } = await params;
    const individual = await getIndividualByPublicId(publicId);

    if (!individual) {
        notFound();
    }

    return (
        <div dir='rtl'>
            <AdminSidebar selectedButton={'Individuals'} />
            <Box sx={{px:4, py: 0}}>
                <AdminBreadcrumbs breadcrumbsList={[{text: 'المشرف', path: '/admin'}, {text: 'الافراد', path: '/admin/individuals'}, {text: 'بيانات', path: '#'}]}/>
                <h1>بيانات الفرد</h1>
                <IndividualDetails individual={individual} publicId={publicId} />
            </Box>
            <Footer />
        </div>
    )
}
