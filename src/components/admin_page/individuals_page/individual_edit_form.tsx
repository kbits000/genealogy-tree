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
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Snackbar, { SnackbarCloseReason, SnackbarOrigin } from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { editIndividualServerAction, deleteIndividualServerAction } from "@/lib/actions/admin_server_actions";

type Option = { public_id: string; label: string };
type RelatedIndividual = { public_id: string; first_name: string; parent_name?: string };

type Individual = {
    first_name: string;
    parent_name?: string;
    grandparent_name?: string;
    last_name?: string;
    sex: string;
    is_dead: string;
    mother_id?: RelatedIndividual;
    father_id?: RelatedIndividual;
    spouses_ids?: RelatedIndividual[];
    siblings_ids?: RelatedIndividual[];
    grandmothers_ids?: RelatedIndividual[];
    grandfathers_ids?: RelatedIndividual[];
    individuals_ids?: { individual: RelatedIndividual; relationship: string }[];
};

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

function toOption(r: RelatedIndividual): Option {
    return {
        public_id: r.public_id,
        label: [r.first_name, r.parent_name].filter(Boolean).join(' '),
    };
}

export default function IndividualEditForm({
                                               individual,
                                               publicId,
                                               allIndividuals,
                                           }: {
    individual: Individual;
    publicId: string;
    allIndividuals: Option[];
}) {
    const [loading, setLoading] = useState(false);
    const [snackbarState, setSnackbarState] = useState<SnackbarOriginWithOpenBoolean>({ open: false, vertical: 'top', horizontal: 'center' });
    const { open, vertical, horizontal } = snackbarState;
    const [alertState, setAlertState] = useState<{ severity: string; content: string }>({ severity: 'error', content: 'لم يتم الحفظ. حدثت مشكلة ما!' });
    const { severity, content } = alertState;
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));

    const [motherId, setMotherId] = useState<Option | null>(individual.mother_id ? toOption(individual.mother_id) : null);
    const [fatherId, setFatherId] = useState<Option | null>(individual.father_id ? toOption(individual.father_id) : null);
    const [spousesIds, setSpousesIds] = useState<Option[]>((individual.spouses_ids ?? []).map(toOption));
    const [siblingsIds, setSiblingsIds] = useState<Option[]>((individual.siblings_ids ?? []).map(toOption));
    const [grandmothersIds, setGrandmothersIds] = useState<Option[]>((individual.grandmothers_ids ?? []).map(toOption));
    const [grandfathersIds, setGrandfathersIds] = useState<Option[]>((individual.grandfathers_ids ?? []).map(toOption));
    const [individualsIds, setIndividualsIds] = useState<{ individual: Option | null; relationship: string }[]>(
        (individual.individuals_ids ?? []).map(e => ({ individual: toOption(e.individual), relationship: e.relationship }))
    );

    // TODO shows error even though there is success
    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const editingSaved = await editIndividualServerAction(publicId, formData);
        setLoading(false);
        if (editingSaved) {
            setAlertState({ severity: 'success', content: 'تم حفظ التعديلات بنجاح' });
            if (matches) {
                setSnackbarState({ open: true, vertical: 'bottom', horizontal: 'left' });
            } else {
                setSnackbarState({ ...snackbarState, open: true });
            }
        } else {
            setAlertState({ severity: 'error', content: 'لم يتم الحفظ. حدثت مشكلة ما!' });
            if (matches) {
                setSnackbarState({ open: true, vertical: 'bottom', horizontal: 'left' });
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
        if (reason === 'clickaway') return;
        setSnackbarState({ ...snackbarState, open: false });
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
                    severity={severity === 'success' ? 'success' : 'error'}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {content}
                </Alert>
            </Snackbar>
            <form action={handleSubmit}>
                {/* Hidden inputs for relationship fields */}
                <input type="hidden" name="mother_id_field"      value={motherId?.public_id ?? ''} readOnly />
                <input type="hidden" name="father_id_field"      value={fatherId?.public_id ?? ''} readOnly />
                <input type="hidden" name="spouses_ids_field"   value={JSON.stringify(spousesIds.map(o => o.public_id))} readOnly />
                <input type="hidden" name="siblings_ids_field"   value={JSON.stringify(siblingsIds.map(o => o.public_id))} readOnly />
                <input type="hidden" name="grandmother_id_field" value={JSON.stringify(grandmothersIds.map(o => o.public_id))} readOnly />
                <input type="hidden" name="grandfather_id_field" value={JSON.stringify(grandfathersIds.map(o => o.public_id))} readOnly />
                <input type="hidden" name="individuals_ids_field" value={JSON.stringify(
                    individualsIds.filter(e => e.individual).map(e => ({ public_id: e.individual!.public_id, relationship: e.relationship }))
                )} readOnly />

                <Stack
                    useFlexGap
                    spacing={{ md: 2 }}
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
                            margin="normal" />
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
                        defaultValue={individual.parent_name ?? ''} variant="outlined" margin="normal" />
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
                               defaultValue={individual.grandparent_name ?? ''} variant="outlined" margin="normal" />
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
                               defaultValue={individual.last_name ?? ''} variant="outlined" margin="normal" />
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

                {/* Relationship fields */}
                <Stack spacing={2} sx={{ mt: 3, maxWidth: 480 }}>
                    <Autocomplete
                        options={allIndividuals}
                        value={motherId}
                        onChange={(_, v) => setMotherId(v)}
                        renderInput={(params) => <TextField {...params} label="الأم" />}
                    />
                    <Autocomplete
                        options={allIndividuals}
                        value={fatherId}
                        onChange={(_, v) => setFatherId(v)}
                        renderInput={(params) => <TextField {...params} label="الأب" />}
                    />
                    {/*<Autocomplete*/}
                    {/*    multiple*/}
                    {/*    options={allIndividuals}*/}
                    {/*    value={wivesIds}*/}
                    {/*    onChange={(_, v) => setWivesIds(v)}*/}
                    {/*    renderInput={(params) => <TextField {...params} label="الزوجات" />}*/}
                    {/*/>*/}
                    <Autocomplete
                        multiple
                        options={allIndividuals}
                        value={spousesIds}
                        onChange={(_, v) => setSpousesIds(v)}
                        renderInput={(params) => <TextField {...params} label="الأزواج" />}
                    />
                    <Autocomplete
                        multiple
                        options={allIndividuals}
                        value={siblingsIds}
                        onChange={(_, v) => setSiblingsIds(v)}
                        renderInput={(params) => <TextField {...params} label="الإخوة والأخوات" />}
                    />
                    <Autocomplete
                        multiple
                        options={allIndividuals}
                        value={grandmothersIds}
                        onChange={(_, v) => setGrandmothersIds(v)}
                        renderInput={(params) => <TextField {...params} label="الجدات" />}
                    />
                    <Autocomplete
                        multiple
                        options={allIndividuals}
                        value={grandfathersIds}
                        onChange={(_, v) => setGrandfathersIds(v)}
                        renderInput={(params) => <TextField {...params} label="الأجداد" />}
                    />

                    {/* individuals_ids — dynamic list */}
                    <Box>
                        <FormLabel>أفراد آخرون</FormLabel>
                        <Stack spacing={1} sx={{ mt: 1 }}>
                            {individualsIds.map((entry, idx) => (
                                <Box key={idx} display="flex" gap={1} alignItems="center">
                                    <Autocomplete
                                        sx={{ flex: 1 }}
                                        options={allIndividuals}
                                        value={entry.individual}
                                        onChange={(_, v) => {
                                            const updated = [...individualsIds];
                                            updated[idx] = { ...updated[idx], individual: v };
                                            setIndividualsIds(updated);
                                        }}
                                        renderInput={(params) => <TextField {...params} label="الفرد" size="small" />}
                                    />
                                    <TextField
                                        sx={{ flex: 1 }}
                                        label="صلة القرابة"
                                        size="small"
                                        value={entry.relationship}
                                        onChange={e => {
                                            const updated = [...individualsIds];
                                            updated[idx] = { ...updated[idx], relationship: e.target.value };
                                            setIndividualsIds(updated);
                                        }}
                                    />
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => setIndividualsIds(individualsIds.filter((_, i) => i !== idx))}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ))}
                        </Stack>
                        <Button
                            size="small"
                            startIcon={<AddIcon />}
                            sx={{ mt: 1 }}
                            onClick={() => setIndividualsIds([...individualsIds, { individual: null, relationship: '' }])}
                        >
                            إضافة
                        </Button>
                    </Box>
                </Stack>

                {/* Action buttons */}
                <Stack
                    useFlexGap
                    spacing={{ xs: 1, sm: 2 }}
                    direction={{ xs: 'column', sm: 'row' }}
                    sx={{ flexWrap: 'wrap', mt: 3 }}
                >
                    <Button type={'submit'} variant="contained" loading={loading}>
                        حفظ التعديلات
                    </Button>
                    <Button variant="outlined" color="error" loading={loading} onClick={handleDelete}>
                        حذف
                    </Button>
                </Stack>
            </form>
        </Box>
    );
}
