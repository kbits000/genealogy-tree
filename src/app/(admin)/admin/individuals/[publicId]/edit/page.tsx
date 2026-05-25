import AdminSidebar from "@/components/admin_page/admin_sidebar";
import Box from "@mui/material/Box";
import AdminBreadcrumbs from "@/components/admin_page/admin_breadcrumbs";
import Footer from "@/components/footer/Footer";
import IndividualEditForm from "@/components/admin_page/individuals_page/individual_edit_form";
import { getIndividualByPublicId, getAllIndividuals, getSpouseCandidateSexes } from "@/lib/_data_access/individuals";
import { notFound } from "next/navigation";

type Option = { public_id: string; label: string; sex: string };

function individualToOption(i: {
    public_id: string;
    first_name: string;
    parent_name?: string;
    grandparent_name?: string;
    last_name?: string;
    sex: string;
}): Option {
    return {
        public_id: i.public_id,
        sex: i.sex,
        label: [i.first_name, i.parent_name, i.last_name].filter(Boolean).join(' '),
    };
}

function mergeSpouseOptions(spouseOptions: Option[], existingSpouses: Option[]): Option[] {
    const byId = new Map(spouseOptions.map(o => [o.public_id, o]));
    for (const spouse of existingSpouses) {
        if (!byId.has(spouse.public_id)) {
            byId.set(spouse.public_id, spouse);
        }
    }
    return Array.from(byId.values());
}

export default async function IndividualsEditPage({ params }: { params: Promise<{ publicId: string }> }) {
    const { publicId } = await params;
    const individual = await getIndividualByPublicId(publicId);

    if (!individual) {
        notFound();
    }

    const [allIndividuals, spouseCandidates] = await Promise.all([
        getAllIndividuals(),
        getAllIndividuals(undefined, {
            sexes: getSpouseCandidateSexes(individual.sex),
            excludePublicId: publicId,
        }),
    ]);

    const options = allIndividuals.map(individualToOption);
    const existingSpouseOptions = (individual.spouses_ids ?? []).map(individualToOption);
    const spouseOptions = mergeSpouseOptions(spouseCandidates.map(individualToOption), existingSpouseOptions);

    return (
        <div dir='rtl'>
            <AdminSidebar selectedButton={'Individuals'} />
            <Box sx={{px:4, py: 0}}>
                <AdminBreadcrumbs breadcrumbsList={[{text: 'المشرف', path: '/admin'}, {text: 'الافراد', path: '/admin/individuals'}, {text: 'تعديل', path: '#'}]}/>
                <h1>تعديل بيانات الفرد</h1>
                <IndividualEditForm individual={individual} publicId={publicId} allIndividuals={options} spouseOptions={spouseOptions} />
            </Box>
            <Footer />
        </div>
    )
}
