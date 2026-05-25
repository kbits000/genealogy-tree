'use server'

import AdminSidebar from "@/components/admin_page/admin_sidebar";
import Box from "@mui/material/Box";
import AdminBreadcrumbs from "@/components/admin_page/admin_breadcrumbs";
import Footer from "@/components/footer/Footer";
import IndividualSubmissionForm from "@/components/admin_page/individuals_page/individual_submission_form";
import { getAllIndividuals, getSpouseCandidateSexes } from "@/lib/_data_access/individuals";

function individualToOption(i: {
    public_id: string;
    first_name: string;
    parent_name?: string;
    grandparent_name?: string;
    last_name?: string;
    sex: string;
}) {
    return {
        public_id: i.public_id,
        sex: i.sex,
        label: [i.first_name, i.parent_name, i.last_name].filter(Boolean).join(' '),
    };
}

export default async function IndividualsAddPage() {
    const [allIndividuals] = await Promise.all([
        getAllIndividuals(),
        // getAllIndividuals(undefined, { sexes: getSpouseCandidateSexes('unknown') }),
    ]);
    const options = allIndividuals.map(individualToOption);
    // const spouseOptions = spouseCandidates.map(individualToOption);

    return (
        <div dir='rtl'>
            <AdminSidebar selectedButton={'Individuals'} />
            <Box sx={{px:4, py: 0}}>
                <AdminBreadcrumbs breadcrumbsList={[{text: 'المشرف', path: '/admin'}, {text: 'الافراد', path: '#'}]}/>
                <h1>اضافة افراد جدد</h1>
                <IndividualSubmissionForm allIndividuals={options} />
            </Box>
            <Footer />
        </div>
    )
}
