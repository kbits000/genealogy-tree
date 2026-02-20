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
import Box from '@mui/material/Box';
import Snackbar, { SnackbarCloseReason, SnackbarOrigin } from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

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

interface SnackbarOriginWithOpenBoolean extends SnackbarOrigin {
    open: boolean;
}

export default function IndividualEditForm({ individual, publicId }: { individual: Individual; publicId: string }) {
    const [loading, setLoading] = useState(false);
    const [snackbarState, setSnackbarState] = useState<SnackbarOriginWithOpenBoolean>({ open: false, vertical: 'top', horizontal: 'center',});
    const { open, vertical, horizontal } = snackbarState;
    const [alertState, setAlertState] = useState<{severity: string, content: string}>({severity: 'error', content: 'لم يتم الحفظ. حدثت مشكلة ما!'});
    const { severity, content } = alertState;
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));


    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const editingSaved = await editIndividualServerAction(publicId, formData);
        setLoading(false);
        if (editingSaved) {
            setAlertState({severity: 'success', content: 'تم حفظ التعديلات بنجاح'});
            if (matches) {
                setSnackbarState({ open: true, vertical: 'bottom', horizontal: 'left', });
            } else {
                setSnackbarState({ ...snackbarState, open: true });
            }
        } else {
            setAlertState({severity: 'error', content: 'لم يتم الحفظ. حدثت مشكلة ما!'});
            if (matches) {
                setSnackbarState({ open: true, vertical: 'bottom', horizontal: 'left', });
            } else {
                setSnackbarState({ ...snackbarState, open: true });
            }
        }
    }

    async function handleDelete() {
        setLoading(true);
        await deleteIndividualServerAction(publicId);
        setLoading(false);
    }


    const handleClose = (
        event?: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
    ) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackbarState({...snackbarState, open: false});
    };

    return (
        <Box>
            <Snackbar
                anchorOrigin={{ vertical, horizontal }}
                open={open}
                autoHideDuration={5000}
                onClose={handleClose}
                key={vertical + horizontal}
            >
                <Alert
                    onClose={handleClose}
                    severity={severity==='success'? 'success': 'error'}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    تم حفظ التعديلات بنجاح
                    {content}
                </Alert>
            </Snackbar>
            <form action={handleSubmit}>
                <Stack
                    useFlexGap
                    spacing={{md:2}}
                    direction={{ xs: 'column', sm: 'row' }}
                    sx={{ flexWrap: 'wrap' }}
                >
                    <div dir={'rtl'} lang={'ar'}>
                        <TextField
                            slotProps={{
                                inputLabel: {
                                    sx: {
                                        transformOrigin: "top right",
                                        left: "unset",
                                        right: "1.75rem",
                                        textAlign: "right",
                                    }
                                },
                            }}
                            required label={'الاسم الاول'} name="first_name_field" id="first_name"
                            placeholder={"الأسم الاول"} defaultValue={individual.first_name} variant="outlined"
                            margin="normal"/>
                    </div>
                    <TextField
                        slotProps={{
                            inputLabel: {
                                sx: {
                                    transformOrigin: "top right",
                                    left: "unset",
                                    right: "1.75rem",
                                    textAlign: "right",
                                }
                            },
                        }}
                        label={'الاسم الاب'} name="parent_name_field" id="parent_name" placeholder={"اسم الاب"}
                        defaultValue={individual.parent_name ?? ''} variant="outlined" margin="normal"/>
                    <TextField slotProps={{
                        inputLabel: {
                            sx: {
                                transformOrigin: "top right",
                                left: "unset",
                                right: "1.75rem",
                                textAlign: "right",
                            }
                        },
                    }}
                               label={'الاسم الجد'} name="grandparent_name_field" id="grandparent_name" placeholder={"اسم الجد"}
                               defaultValue={individual.grandparent_name ?? ''} variant="outlined" margin="normal"/>
                    <TextField slotProps={{
                        inputLabel: {
                            sx: {
                                transformOrigin: "top right",
                                left: "unset",
                                right: "1.75rem",
                                textAlign: "right",
                            }
                        },
                    }} label={'الأسم الاخير'} name="last_name_field" id="last_name" placeholder={"الأسم الاخير"}
                               defaultValue={individual.last_name ?? ''} variant="outlined" margin="normal"/>
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
                <Stack
                    useFlexGap
                    spacing={{ xs: 1, sm: 2 }}
                    direction={{ xs: 'column', sm: 'row' }}
                    sx={{ flexWrap: 'wrap' }}
                >
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
                        loading={loading}
                        onClick={handleDelete}
                    >
                        حذف
                    </Button>
                </Stack>
            </form>
        </Box>
    )
}
