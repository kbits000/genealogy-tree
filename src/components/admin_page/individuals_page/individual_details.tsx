import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';

type RelatedIndividual = { public_id: string; first_name: string; parent_name?: string; fullName: string; relationshipSide: string; };

type Individual = {
    first_name: string;
    parent_name?: string;
    grandparent_name?: string;
    last_name?: string;
    sex: string;
    is_dead: string;
    // mother_id?: RelatedIndividual;
    mother_id?: string;
    // father_id?: RelatedIndividual;
    father_id?: string;
    // wives_ids?: RelatedIndividual[];
    // husbands_ids?: RelatedIndividual[];
    spouses_ids?: RelatedIndividual[];
    siblings_ids?: RelatedIndividual[];
    grandmothers_ids?: RelatedIndividual[];
    grandfathers_ids?: RelatedIndividual[];
    // individuals_ids?: { individual: RelatedIndividual; relationship: string }[];
    individuals_ids?: RelatedIndividual[];
}

const sexToArabic: Record<string, string> = {
    male: 'ذكر',
    female: 'أنثى',
    unknown: 'غير معلوم',
};

const isDeadToArabic: Record<string, string> = {
    alive: 'حي',
    dead: 'متوفى',
    unknown: 'غير معلوم',
};

const relationshipSideToArabic: Record<string, string> = {
    father: 'الأب',
    mother: 'الأم',
    unknown: 'غير معلوم',
};

function fullName(r?: RelatedIndividual) {
    return r ? [r.first_name, r.parent_name].filter(Boolean).join(' ') : undefined;
}

function Field({ label, value }: { label: string; value?: string }) {
    return (
        <Box display="flex" gap={2} alignItems="baseline">
            <Typography variant="body2" color="text.secondary" minWidth={120}>
                {label}
            </Typography>
            <Typography variant="body1">
                {value || '—'}
            </Typography>
        </Box>
    );
}

function ChipsField({ label, items }: { label: string; items: string[] }) {
    return (
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <Typography variant="body2" color="text.secondary" minWidth={120}>
                {label}
            </Typography>
            {items.length === 0
                ? <Typography variant="body1">—</Typography>
                : items.map((item, i) => <Chip key={i} label={item} size="small" />)
            }
        </Box>
    );
}

export default function IndividualDetails({ individual }: { individual: Individual; publicId: string }) {
    return (
        <Stack spacing={2}>
            <Field label="الاسم الأول" value={individual.first_name} />
            <Field label="اسم الأب" value={individual.parent_name} />
            <Field label="اسم الجد" value={individual.grandparent_name} />
            <Field label="الاسم الأخير" value={individual.last_name} />
            <Divider />
            <Box display="flex" gap={2} alignItems="center">
                <Typography variant="body2" color="text.secondary" minWidth={120}>
                    الجنس
                </Typography>
                <Chip label={sexToArabic[individual.sex] ?? 'غير معلوم'} size="small" />
            </Box>
            <Box display="flex" gap={2} alignItems="center">
                <Typography variant="body2" color="text.secondary" minWidth={120}>
                    الحالة
                </Typography>
                <Chip label={isDeadToArabic[individual.is_dead] ?? 'غير معلوم'} size="small" />
            </Box>
            <Divider />
            <Field label="الأم" value={fullName(individual.mother_id)} />
            <Field label="الأب" value={fullName(individual.father_id)} />
            <ChipsField
                label="الأزواج"
                items={(individual.spouses_ids ?? []).map(r => fullName(r)!).filter(Boolean)}
            />
            <ChipsField
                label="الإخوة والأخوات"
                items={(individual.siblings_ids ?? []).map(r => `الاسم: ${r.fullName}, جهة القرابة: ${relationshipSideToArabic[r.relationshipSide]}`).filter(Boolean)}
            />
            <ChipsField
                label="الجدات"
                items={(individual.grandmothers_ids ?? []).map(r => `الاسم: ${r.fullName}, جهة القرابة: ${relationshipSideToArabic[r.relationshipSide]}`).filter(Boolean)}
            />
            <ChipsField
                label="الأجداد"
                items={(individual.grandfathers_ids ?? []).map(r => `الاسم: ${r.fullName}, جهة القرابة: ${relationshipSideToArabic[r.relationshipSide]}`).filter(Boolean)}
            />
            <ChipsField
                label="أفراد آخرون"
                items={(individual.individuals_ids ?? []).map(r => `الاسم: ${r.fullName}, جهة القرابة: ${relationshipSideToArabic[r.relationshipSide]}`).filter(Boolean)}
            />
        </Stack>
    );
}
