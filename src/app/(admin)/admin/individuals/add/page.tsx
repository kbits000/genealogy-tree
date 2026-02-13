'use server'

import AdminSidebar from "@/components/admin_page/admin_sidebar";
import Box from "@mui/material/Box";
import AdminBreadcrumbs from "@/components/admin_page/admin_breadcrumbs";
import Footer from "@/components/footer/Footer";
import Form from 'next/form'
import TextField from '@mui/material/TextField';
import {PrintStatement} from "@/lib/actions/admin_server_actions";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import SaveButton from "@/components/admin_page/save_button";

export default async function IndividualsAddPage() {
    return (
            <div dir='rtl'>
                <AdminSidebar selectedButton={'Individuals'} />
                <Box sx={{px:4, py: 0}}>
                    <AdminBreadcrumbs breadcrumbsList={[{text: 'المشرف', path: '/admin'}, {text: 'الافراد', path: '#'}]}/>
                    <h1>اضافة افراد جدد</h1>
                    <Form action={PrintStatement}>
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
                            </Stack>
                        <Button
                            type={'submit'}
                            variant="contained"
                        >
                            حفظ
                        </Button>
                        {/*<SaveButton />*/}
                    </Form>
                </Box>
                <Footer />
            </div>
    )
}