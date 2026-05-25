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
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { addNewIndividualServerAction, getSpouseOptionsServerAction } from "@/lib/actions/admin_server_actions";

type Option = { public_id: string; label: string; sex: string };

function getSpouseCandidateSexes(subjectSex: string): ('male' | 'female' | 'unknown')[] {
    if (subjectSex === 'male') return ['female', 'unknown'];
    if (subjectSex === 'female') return ['male', 'unknown'];
    return ['male', 'female', 'unknown'];
}

function mergeSpouseOptions(options: Option[], selected: Option[]): Option[] {
    const byId = new Map(options.map(o => [o.public_id, o]));
    for (const spouse of selected) {
        if (!byId.has(spouse.public_id)) {
            byId.set(spouse.public_id, spouse);
        }
    }
    return Array.from(byId.values());
}

const relationshipSideArabic = ['جهة الأب','جهة الأم', 'غير معلوم'];

// TODO implement input validation
export default function IndividualSubmissionForm({
    allIndividuals,
}: {
    allIndividuals: Option[];
}) {
    const [gender, setGender] = useState('unknown');
    const [spouseOptions, setSpouseOptions] = useState<Option[]>(allIndividuals);
    const [motherId, setMotherId] = useState<Option | null>(null);
    const [fatherId, setFatherId] = useState<Option | null>(null);
    const [spousesIds, setSpousesIds] = useState<Option[]>([]);
    const [siblingsIds, setSiblingsIds] = useState<{ sibling: Option | null; relationshipSide: string }[]>([]);
    const [grandmothersIds, setGrandmothersIds] = useState<{ grandmother: Option | null; relationshipSide: string }[]>([]); // TODO grandmothersIds and grandfathersIds are not of type Option. They are of type {public_id:string;label:string;relationshipSide:string;}
    const [grandfathersIds, setGrandfathersIds] = useState<{ grandfather: Option | null; relationshipSide: string }[]>([]);
    const [individualsIds, setIndividualsIds] = useState<{ individual: Option | null; relationship: string }[]>([]);

    async function handleGenderChange(newGender: string) {
        setGender(newGender);
        const options = allIndividuals.filter(i => getSpouseCandidateSexes(newGender).includes(i.sex as 'male' | 'female' | 'unknown'));
        // setSpouseOptions(mergeSpouseOptions(options, spousesIds));      // TODO spouses that are of the other gender if known.
        setSpouseOptions(options);
        if (newGender === 'male' || newGender === 'female') {
            setSpousesIds(spousesIds.filter(i => getSpouseCandidateSexes(newGender).includes(i.sex as 'male' | 'female' | 'unknown'))); // TODO only remove the spouses that are of the other gender if known.
        }
    }

    return (
        <Form action={addNewIndividualServerAction}>
            {/* Hidden inputs for relationship fields */}
            <input type="hidden" name="mother_id_field"      value={motherId?.public_id ?? ''} readOnly />
            <input type="hidden" name="father_id_field"      value={fatherId?.public_id ?? ''} readOnly />
            <input type="hidden" name="spouses_ids_field"   value={JSON.stringify(spousesIds.map(o => o.public_id))} readOnly />
            <input type="hidden" name="siblings_ids_field"   value={JSON.stringify(
                siblingsIds.filter(e => e.sibling).map(e => ({ public_id: e.sibling!.public_id, relationshipSide: e.relationshipSide }))
                )} readOnly />
            <input type="hidden" name="grandmothers_ids_field" value={JSON.stringify(
                grandmothersIds.filter(e => e.grandmother).map(e => ({ public_id: e.grandmother!.public_id, relationshipSide: e.relationshipSide }))
            )} readOnly />
            <input type="hidden" name="grandfathers_ids_field" value={JSON.stringify(
                grandfathersIds.filter(e => e.grandfather).map(e => ({ public_id: e.grandfather!.public_id, relationshipSide: e.relationshipSide }))
            )} readOnly />
            <input type="hidden" name="individuals_ids_field" value={JSON.stringify(
                individualsIds.filter(e => e.individual).map(e => ({ public_id: e.individual!.public_id, relationship: e.relationship }))
            )} readOnly />

            {/* Basic fields */}
            <Stack
                useFlexGap
                spacing={{ md: 2 }}
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
                        defaultValue={gender}
                        value={gender}
                        onChange={(_, v) => handleGenderChange(v)}
                        name="gender_field"
                        row
                    >
                        <FormControlLabel value="male" control={<Radio />} label="ذكر" />
                        <FormControlLabel value="female" control={<Radio />} label="أنثى" />
                        <FormControlLabel value="unknown" control={<Radio />} label="غير معلوم" />
                    </RadioGroup>
                </FormControl>
                <FormControl sx={{ mt: 2 }}>
                    <FormLabel id="is-dead-label">حي؟</FormLabel>
                    <RadioGroup
                        aria-labelledby="is-dead-label"
                        defaultValue="unknown"
                        name="is_dead_field"
                        row
                    >
                        <FormControlLabel value="alive" control={<Radio />} label="حي" />
                        <FormControlLabel value="dead" control={<Radio />} label="متوفى" />
                        <FormControlLabel value="unknown" control={<Radio />} label="غير معلوم" />
                    </RadioGroup>
                </FormControl>
            </Stack>

            {/* Relationship fields */}
            <Stack spacing={2} sx={{ mt: 3, maxWidth: 480 }}>
                <Autocomplete
                    options={allIndividuals.filter(i => i.sex === 'female' || i.sex === 'unknown')}
                    value={motherId}
                    onChange={(_, v) => setMotherId(v)}
                    renderInput={(params) => <TextField {...params} label="الأم" />}
                />
                <Autocomplete
                    options={allIndividuals.filter(i => i.sex === 'male' || i.sex === 'unknown')}
                    value={fatherId}
                    onChange={(_, v) => setFatherId(v)}
                    renderInput={(params) => <TextField {...params} label="الأب" />}
                />
                <Autocomplete
                    multiple
                    options={spouseOptions}
                    value={spousesIds}
                    onChange={(_, v) => setSpousesIds(v)}
                    renderInput={(params) => <TextField {...params} label="الأزواج" />}
                />
                <Box>
                    <FormLabel>الإخوة والأخوات</FormLabel>
                    <Stack spacing={1} sx={{ mt: 1 }}>
                        {siblingsIds.map((entry, idx) => (
                            <Box key={idx} display="flex" gap={1} alignItems="center">
                                <Autocomplete
                                    sx={{ flex: 1 }}
                                    options={allIndividuals}
                                    value={entry.sibling}
                                    onChange={(_, v) => {
                                        const updated = [...siblingsIds];
                                        updated[idx] = { ...updated[idx], sibling: v };
                                        setSiblingsIds(updated);
                                    }}
                                    renderInput={(params) => <TextField {...params} label="الإخوة والأخوات" size="small" />}
                                />
                                <Autocomplete
                                    sx={{ flex: 1 }}
                                    size="small"
                                    options={relationshipSideArabic}
                                    value={entry.relationshipSide}
                                    onChange={(event: any, newValue: string | null) => {
                                        const updated = [...siblingsIds];
                                        updated[idx] = { ...updated[idx], relationshipSide: newValue ?? '' };
                                        setSiblingsIds(updated);
                                    }}
                                    renderInput={(params) => <TextField {...params} label="جهة القرابة" size="small" />}
                                />
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => setSiblingsIds(siblingsIds.filter((_, i) => i !== idx))}
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
                        onClick={() => setSiblingsIds([...siblingsIds, { sibling: null, relationshipSide: '' }])}
                    >
                        إضافة
                    </Button>
                </Box>
                <Box>
                    <FormLabel>الجدات</FormLabel>
                    <Stack spacing={1} sx={{ mt: 1 }}>
                        {grandmothersIds.map((entry, idx) => (
                            <Box key={idx} display="flex" gap={1} alignItems="center">
                                <Autocomplete
                                    sx={{ flex: 1 }}
                                    options={allIndividuals.filter(i => i.sex === 'female' || i.sex === 'unknown')}
                                    value={entry.grandmother}
                                    onChange={(_, v) => {
                                        const updated = [...grandmothersIds];
                                        updated[idx] = { ...updated[idx], grandmother: v };
                                        setGrandmothersIds(updated);
                                    }}
                                    renderInput={(params) => <TextField {...params} label="الجدة" size="small" />}
                                />
                                <Autocomplete
                                    sx={{ flex: 1 }}
                                    size="small"
                                    options={relationshipSideArabic}
                                    value={entry.relationshipSide}
                                    onChange={(event: any, newValue: string | null) => {
                                        const updated = [...grandmothersIds];
                                        updated[idx] = { ...updated[idx], relationshipSide: newValue ?? '' };
                                        setGrandmothersIds(updated);
                                    }}
                                    renderInput={(params) => <TextField {...params} label="جهة القرابة" size="small" />}
                                />
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => setGrandmothersIds(grandmothersIds.filter((_, i) => i !== idx))}
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
                        onClick={() => setGrandmothersIds([...grandmothersIds, { grandmother: null, relationshipSide: '' }])}
                    >
                        إضافة
                    </Button>
                </Box>
                <Box>
                    <FormLabel>الاجداد</FormLabel>
                    <Stack spacing={1} sx={{ mt: 1 }}>
                        {grandfathersIds.map((entry, idx) => (
                            <Box key={idx} display="flex" gap={1} alignItems="center">
                                <Autocomplete
                                    sx={{ flex: 1 }}
                                    options={allIndividuals.filter(i => i.sex === 'male' || i.sex === 'unknown')}
                                    value={entry.grandfather}
                                    onChange={(_, v) => {
                                        const updated = [...grandfathersIds];
                                        updated[idx] = { ...updated[idx], grandfather: v };
                                        setGrandfathersIds(updated);
                                    }}
                                    renderInput={(params) => <TextField {...params} label="الجد" size="small" />}
                                />
                                <Autocomplete
                                    sx={{ flex: 1 }}
                                    size="small"
                                    options={['جهة الأب','جهة الأم', 'غير معلوم']}
                                    value={entry.relationshipSide}
                                    onChange={(event: any, newValue: string | null) => {
                                        const updated = [...grandfathersIds];
                                        updated[idx] = { ...updated[idx], relationshipSide: newValue ?? '' };
                                        setGrandfathersIds(updated);
                                    }}
                                    renderInput={(params) => <TextField {...params} label="جهة القرابة" size="small" />}
                                />
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => setGrandfathersIds(grandfathersIds.filter((_, i) => i !== idx))}
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
                        onClick={() => setGrandfathersIds([...grandfathersIds, { grandfather: null, relationshipSide: '' }])}
                    >
                        إضافة
                    </Button>
                </Box>

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

            <Button type={'submit'} variant="contained" sx={{ mt: 3 }}>
                حفظ
            </Button>
        </Form>
    );
}
