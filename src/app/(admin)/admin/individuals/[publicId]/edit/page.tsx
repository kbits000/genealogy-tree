import AdminSidebar from "@/components/admin_page/admin_sidebar";
import Box from "@mui/material/Box";
import AdminBreadcrumbs from "@/components/admin_page/admin_breadcrumbs";
import Footer from "@/components/footer/Footer";
import IndividualEditForm from "@/components/admin_page/individuals_page/individual_edit_form";
import { getIndividualByPublicId } from "@/lib/_data_access/individuals";
import { notFound } from "next/navigation";

export default async function IndividualsEditPage({ params }: { params: Promise<{ publicId: string }> }) {
    const { publicId } = await params;
    const individual = await getIndividualByPublicId(publicId);

    if (!individual) {
        notFound();
    }

    return (
        <div dir='rtl'>
            <AdminSidebar selectedButton={'Individuals'} />
            <Box sx={{px:4, py: 0}}>
                <AdminBreadcrumbs breadcrumbsList={[{text: 'المشرف', path: '/admin'}, {text: 'الافراد', path: '/admin/individuals'}, {text: 'تعديل', path: '#'}]}/>
                <h1>تعديل بيانات الفرد</h1>
                <IndividualEditForm individual={individual} publicId={publicId} />
            </Box>
            <Footer />
        </div>
    )
}
