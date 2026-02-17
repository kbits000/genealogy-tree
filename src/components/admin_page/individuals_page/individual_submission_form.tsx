'use client'

import { useState } from 'react';
import Form from 'next/form'
import TextField from '@mui/material/TextField';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import {addNewIndividualServerAction} from "@/lib/actions/admin_server_actions";

// TODO implement input validation
export default function IndividualSubmissionForm() {
    const [loading, setLoading] = useState(false);

    return (
        <Form action={addNewIndividualServerAction}>
            <Stack
                useFlexGap
                spacing={{md:2}}
                direction={{ xs: 'column', sm: 'row' }}
                sx={{ flexWrap: 'wrap' }}
            >
                <TextField required name="first_name_field" id="first_name" placeholder={"الأسم الاول"} variant="outlined" margin="normal" />
                <TextField name="parent_name_field" id="parent_name" placeholder={"اسم الاب"} variant="outlined" margin="normal" />
                <TextField name="grandparent_name_field" id="grandparent_name" placeholder={"اسم الجد"} variant="outlined" margin="normal" />
                <TextField name="last_name_field" id="last_name" placeholder={"الأسم الاخير"} variant="outlined" margin="normal" />
                <FormControl sx={{ mt: 2 }}>
                    <FormLabel id="gender-label">الجنس</FormLabel>
                    <RadioGroup
                        aria-labelledby="gender-label"
                        defaultValue="غير معلوم"
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
                        defaultValue="حي"
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
                حفظ
            </Button>
        </Form>
    )
}