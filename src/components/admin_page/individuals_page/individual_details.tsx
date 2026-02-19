import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';

type Individual = {
    first_name: string;
    parent_name?: string;
    grandparent_name?: string;
    last_name?: string;
    sex: string;
    is_dead: string;
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
        </Stack>
    );
}
