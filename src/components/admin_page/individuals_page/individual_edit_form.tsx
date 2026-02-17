'use client'

import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { editIndividualServerAction, deleteIndividualServerAction } from "@/lib/actions/admin_server_actions";

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

export default function IndividualEditForm({ individual, publicId }: { individual: Individual; publicId: string }) {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        await editIndividualServerAction(publicId, formData);
        setLoading(false);
    }

    async function handleDelete() {
        setLoading(true);
        await deleteIndividualServerAction(publicId);
        setLoading(false);
    }

    return (
        <form action={handleSubmit}>
            <Stack
                useFlexGap
                spacing={{md:2}}
                direction={{ xs: 'column', sm: 'row' }}
                sx={{ flexWrap: 'wrap' }}
            >
                <TextField required name="first_name_field" id="first_name" placeholder={"الأسم الاول"} defaultValue={individual.first_name} variant="outlined" margin="normal" />
                <TextField name="parent_name_field" id="parent_name" placeholder={"اسم الاب"} defaultValue={individual.parent_name ?? ''} variant="outlined" margin="normal" />
                <TextField name="grandparent_name_field" id="grandparent_name" placeholder={"اسم الجد"} defaultValue={individual.grandparent_name ?? ''} variant="outlined" margin="normal" />
                <TextField name="last_name_field" id="last_name" placeholder={"الأسم الاخير"} defaultValue={individual.last_name ?? ''} variant="outlined" margin="normal" />
                <FormControl sx={{ mt: 2 }}>
                    <FormLabel id="gender-label">الجنس</FormLabel>
                    <RadioGroup
                        aria-labelledby="gender-label"
                        defaultValue={sexToArabic[individual.sex] ?? 'غير معلوم'}
                        name="gender_field"
                        row
                    >
                        <FormControlLabel value="ذكر" control={<Radio />} label="ذكر" />
                        <FormControlLabel value="أنثى" control={<Radio />} label="أنثى" />
                        <FormControlLabel value="غير معلوم" control={<Radio />} label="غير معلوم" />
                    </RadioGroup>
                </FormControl>
                <FormControl sx={{ mt: 2 }}>
                    <FormLabel id="is-dead-label">حي؟</FormLabel>
                    <RadioGroup
                        aria-labelledby="is-dead-label"
                        defaultValue={isDeadToArabic[individual.is_dead] ?? 'غير معلوم'}
                        name="is_dead_field"
                        row
                    >
                        <FormControlLabel value="حي" control={<Radio />} label="حي" />
                        <FormControlLabel value="متوفى" control={<Radio />} label="متوفى" />
                        <FormControlLabel value="غير معلوم" control={<Radio />} label="غير معلوم" />
                    </RadioGroup>
                </FormControl>
            </Stack>
            <Button
                type={'submit'}
                variant="contained"
                loading={loading}
            >
                حفظ التعديلات
            </Button>
            <Button
                variant="outlined"
                color="error"
                sx={{ ml: 2 }}
                loading={loading}
                onClick={handleDelete}
            >
                حذف
            </Button>
        </form>
    )
}
